import {createServer} from 'node:http';
import {WebSocketServer} from 'ws';
import {fresh,selectFighter,launch,step} from '../games/balls/physics.mjs';
const VALID_FIGHTERS=['floyd','net','kirk','diddy','classic'];
const server=createServer((req,res)=>res.end('Balls online'));
const sockets=new WebSocketServer({server,maxPayload:64});
let waiting=null;
sockets.on('connection',socket=>{
 socket.on('error',()=>socket.terminate());
 socket.on('close',()=>{if(waiting===socket)waiting=null;socket.stop?.();});
 if(!waiting||waiting.readyState!==1){waiting=socket;socket.send('"waiting"');return;}
 const pair=[waiting,socket];
 waiting=null;
 const fighters=['floyd','floyd'];
 const lives=[5,5];
 let round=1;
 let ps=fresh();
 const colors=ps.map(p=>({hex:p.color,name:p.colorName}));
 selectFighter(ps[0],fighters[0]);selectFighter(ps[1],fighters[1]);
 let phase='aim',deadline=Date.now()+5000,roundWinner=null,closingTimer=null;
 const send=(s,obj)=>{if(s.readyState===1)s.send(JSON.stringify(obj));};
 pair.forEach((s,i)=>{
  send(s,{seat:i,ps,left:5000,lives,round,phase,roundWinner});
  s.on('message',raw=>{
   const text=raw.toString();
   if(VALID_FIGHTERS.includes(text)){
    fighters[i]=text;
    if(phase==='aim'&&Date.now()<deadline)selectFighter(ps[i],text);
    return;
   }
   if(phase!=='aim'||Date.now()>=deadline)return;
   const angle=Number(text);
   if(Number.isFinite(angle)&&Math.abs(angle)<=Math.PI*2)ps[i].angle=angle;
  });
 });
 function stop(){
  clearInterval(timer);
  if(closingTimer){clearTimeout(closingTimer);closingTimer=null;}
  for(const s of pair){s.stop=null;if(s.readyState===1)s.close(1000);}
 }
 const timer=setInterval(()=>{
  const now=Date.now();
  if(phase==='aim'){
   const left=Math.max(0,deadline-now);
   if(!left){launch(ps);phase='fight';}
   pair.forEach(s=>send(s,{ps,left,lives,round,phase,roundWinner}));
   return;
  }
  if(phase==='fight'){
   step(ps);
   if(ps.some(p=>!p.hp)){
    if(!ps[0].hp)lives[0]=Math.max(0,lives[0]-1);
    if(!ps[1].hp)lives[1]=Math.max(0,lives[1]-1);
    roundWinner=!ps[0].hp&&!ps[1].hp?'draw':ps[0].hp?0:1;
    if(lives[0]<=0||lives[1]<=0){
     phase='over';
     pair.forEach(s=>send(s,{ps,left:0,lives,round,phase,roundWinner}));
     clearInterval(timer);
     closingTimer=setTimeout(stop,250);
     return;
    }
    phase='between';
    deadline=now+2600;
    pair.forEach(s=>send(s,{ps,left:2600,lives,round,phase,roundWinner}));
    return;
   }
   pair.forEach(s=>send(s,{ps,left:0,lives,round,phase,roundWinner}));
   return;
  }
  if(phase==='between'){
   const left=Math.max(0,deadline-now);
   if(!left){
    round++;
    ps=fresh(colors);
    selectFighter(ps[0],fighters[0]);selectFighter(ps[1],fighters[1]);
    phase='aim';roundWinner=null;deadline=now+5000;
   }
   pair.forEach(s=>send(s,{ps,left:Math.max(0,deadline-now),lives,round,phase,roundWinner}));
  }
 },32);
 pair.forEach(s=>s.stop=stop);
});
export default server;
