import {createServer} from 'node:http';
import {WebSocketServer} from 'ws';
import {fresh,selectFighter,launch,step,STEP_MS,MAP_IDS,resolveMap} from '../games/balls/physics.mjs';
const VALID_FIGHTERS=['floyd','net','kirk','diddy','classic'];
const VALID_MAPS=[...MAP_IDS,'random'];
const server=createServer((req,res)=>res.end('Balls online'));
const sockets=new WebSocketServer({server,maxPayload:256});
let waiting=null;

const heartbeat=setInterval(()=>{
 for(const ws of sockets.clients){
  if(ws.isAlive===false){ws.terminate();continue;}
  ws.isAlive=false;
  try{ws.ping();}catch{}
 }
},20000);
sockets.on('close',()=>clearInterval(heartbeat));

sockets.on('connection',socket=>{
 socket.isAlive=true;
 socket.on('pong',()=>{socket.isAlive=true;});
 socket.on('error',()=>socket.terminate());
 socket.on('close',()=>{if(waiting===socket)waiting=null;socket.stop?.();});
 if(!waiting||waiting.readyState!==1){waiting=socket;socket.send('"waiting"');return;}
 const pair=[waiting,socket];
 waiting=null;
 const fighters=['floyd','floyd'];
 const ready=[false,false];
 const lives=[5,5];
 let round=1,mapChoice='arena',mapId='arena';
 let ps=fresh(null,mapId);
 const colors=ps.map(p=>({hex:p.color,name:p.colorName}));
 selectFighter(ps[0],fighters[0]);selectFighter(ps[1],fighters[1]);
 let phase='lobby',deadline=0,roundWinner=null,closingTimer=null,lastTick=Date.now(),acc=0,lastLobbySend=0;

 const send=(s,obj)=>{if(s.readyState===1)s.send(JSON.stringify(obj));};
 const broadcast=(left=0)=>{
  const payload={ps,left,lives,round,phase,roundWinner,ready,mapId,mapChoice,fighters};
  pair.forEach(s=>send(s,payload));
 };
 const startAim=()=>{
  mapId=resolveMap(mapChoice);
  ps=fresh(colors,mapId);
  selectFighter(ps[0],fighters[0]);selectFighter(ps[1],fighters[1]);
  phase='aim';roundWinner=null;ready[0]=ready[1]=false;
  deadline=Date.now()+5000;
  broadcast(5000);
 };

 pair.forEach((s,i)=>{
  send(s,{seat:i,ps,left:0,lives,round,phase,roundWinner,ready,mapId,mapChoice,fighters});
  s.on('message',raw=>{
   const text=raw.toString();
   let msg=null;
   if(text.startsWith('{')){
    try{msg=JSON.parse(text);}catch{return;}
   }else if(VALID_FIGHTERS.includes(text)){
    msg={type:'fighter',id:text};
   }else{
    const a=Number(text);
    if(Number.isFinite(a))msg={type:'angle',value:a};
   }
   if(!msg)return;
   if(msg.type==='fighter'&&VALID_FIGHTERS.includes(msg.id)){
    fighters[i]=msg.id;
    if(phase==='lobby'||(phase==='aim'&&Date.now()<deadline))selectFighter(ps[i],msg.id);
    if(phase==='lobby')broadcast(0);
    return;
   }
   if(msg.type==='map'&&phase==='lobby'&&VALID_MAPS.includes(msg.id)){
    mapChoice=msg.id;
    mapId=resolveMap(mapChoice);
    ps=fresh(colors,mapId);
    selectFighter(ps[0],fighters[0]);selectFighter(ps[1],fighters[1]);
    ready[0]=ready[1]=false;
    broadcast(0);
    return;
   }
   if(msg.type==='ready'&&(phase==='lobby'||phase==='between')){
    ready[i]=Boolean(msg.value);
    if(ready[0]&&ready[1]){
     if(phase==='between')round++;
     startAim();
    }else{
     const left=phase==='between'?Math.max(0,deadline-Date.now()):0;
     broadcast(left);
    }
    return;
   }
   if(msg.type==='angle'&&phase==='aim'&&Date.now()<deadline){
    const angle=Number(msg.value);
    if(Number.isFinite(angle)&&Math.abs(angle)<=Math.PI*2)ps[i].angle=angle;
   }
  });
 });

 function stop(){
  clearInterval(timer);
  if(closingTimer){clearTimeout(closingTimer);closingTimer=null;}
  for(const s of pair){s.stop=null;if(s.readyState===1)s.close(1000);}
 }

 const timer=setInterval(()=>{
  const now=Date.now();
  if(phase==='lobby'){
   if(now-lastLobbySend>=500){lastLobbySend=now;broadcast(0);}
   return;
  }
  if(phase==='aim'){
   const left=Math.max(0,deadline-now);
   if(!left){launch(ps);phase='fight';lastTick=now;acc=0;}
   broadcast(left);
   return;
  }
  if(phase==='fight'){
   const dt=Math.min(100,Math.max(0,now-lastTick));
   lastTick=now;acc+=dt;
   while(acc>=STEP_MS){
    step(ps,mapId);
    acc-=STEP_MS;
    if(ps.some(p=>!p.hp))break;
   }
   if(ps.some(p=>!p.hp)){
    if(!ps[0].hp)lives[0]=Math.max(0,lives[0]-1);
    if(!ps[1].hp)lives[1]=Math.max(0,lives[1]-1);
    roundWinner=!ps[0].hp&&!ps[1].hp?'draw':ps[0].hp?0:1;
    if(lives[0]<=0||lives[1]<=0){
     phase='over';
     broadcast(0);
     clearInterval(timer);
     closingTimer=setTimeout(stop,300);
     return;
    }
    phase='between';
    ready[0]=ready[1]=false;
    deadline=now+4000;
    broadcast(4000);
    return;
   }
   broadcast(0);
   return;
  }
  if(phase==='between'){
   const left=Math.max(0,deadline-now);
   if(!left){round++;startAim();return;}
   broadcast(left);
  }
 },16);
 pair.forEach(s=>s.stop=stop);
});
export default server;
