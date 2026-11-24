import {createServer} from 'node:http';
import {WebSocketServer} from 'ws';
import {fresh,selectFighter,launch,step} from '../games/balls/physics.mjs';
const server=createServer((req,res)=>res.end('Balls online'));
const sockets=new WebSocketServer({server,maxPayload:64});
let waiting=null;
sockets.on('connection',socket=>{
 socket.on('error',()=>socket.terminate());
 socket.on('close',()=>{if(waiting===socket)waiting=null;socket.stop?.();});
 if(!waiting||waiting.readyState!==1){waiting=socket;socket.send('"waiting"');return;}
 const pair=[waiting,socket],ps=fresh(),deadline=Date.now()+5000;
 waiting=null;
 let launched=false;
 const send=(s,obj)=>{if(s.readyState===1)s.send(JSON.stringify(obj));};
 pair.forEach((s,i)=>{
  send(s,{seat:i,ps,left:5000});
  s.on('message',raw=>{if(Date.now()>=deadline)return;if(["floyd","net","kirk","classic"].includes(raw.toString())){selectFighter(ps[i],raw.toString());return;}const angle=Number(raw);if(Number.isFinite(angle)&&Math.abs(angle)<=Math.PI*2)ps[i].angle=angle;});
 });
 function stop(){clearInterval(timer);for(const s of pair){s.stop=null;if(s.readyState===1)s.close(1000);}}
 const timer=setInterval(()=>{
  const left=Math.max(0,deadline-Date.now());
  if(!left){if(!launched){launch(ps);launched=true;}step(ps);}
  pair.forEach(s=>send(s,{ps,left}));
  if(ps.some(p=>!p.hp))stop();
 },32);
 pair.forEach(s=>s.stop=stop);
});
export default server;