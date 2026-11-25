export const STEP_MS=1000/60;
const R=47.52,D=R*2,MIN_X=R,MAX_X=800-R,MIN_Y=R,MAX_Y=480-R,BASE_SPEED=3.1;
export const PALETTE=[
 {hex:'#47f09a',name:'Szmaragdowy'},
 {hex:'#ff5e78',name:'Karmazynowy'},
 {hex:'#49c6ff',name:'Błękitny'},
 {hex:'#c77dff',name:'Fioletowy'},
 {hex:'#ff9f43',name:'Pomarańczowy'},
 {hex:'#ff66c4',name:'Neonowy róż'}
];
export const MAPS={
 arena:{id:'arena',name:'Klasyczna',obstacles:[],hazards:[]},
 pillars:{id:'pillars',name:'Kolumny',obstacles:[
  {type:'circle',x:400,y:145,r:38},
  {type:'circle',x:400,y:335,r:38}
 ],hazards:[]},
 bunker:{id:'bunker',name:'Bunkier',obstacles:[
  {type:'rect',x:388,y:155,w:24,h:170}
 ],hazards:[]},
 pinball:{id:'pinball',name:'Pinball',obstacles:[
  {type:'circle',x:400,y:240,r:34,bumper:true},
  {type:'circle',x:260,y:115,r:26,bumper:true},
  {type:'circle',x:540,y:365,r:26,bumper:true}
 ],hazards:[]},
 lava:{id:'lava',name:'Wulkan',obstacles:[],hazards:[
  {x:0,y:0,r:92},{x:800,y:0,r:92},{x:0,y:480,r:92},{x:800,y:480,r:92}
 ]}
};
export const MAP_IDS=Object.keys(MAPS);
export function getMap(id){return MAPS[id]||MAPS.arena;}
export function resolveMap(id){
 if(id==='random')return MAP_IDS[Math.floor(Math.random()*MAP_IDS.length)];
 return MAPS[id]?id:'arena';
}
function pickPairColors(fixed){
 if(Array.isArray(fixed)&&fixed.length===2)return fixed;
 const pool=[...PALETTE];
 const a=pool.splice(Math.floor(Math.random()*pool.length),1)[0];
 const b=pool[Math.floor(Math.random()*pool.length)];
 return [a,b];
}
function safeSpot(mapId,minX,maxX,minY,maxY,pad){
 const m=getMap(mapId);
 let fx=(minX+maxX)/2,fy=(minY+maxY)/2;
 for(let t=0;t<16;t++){
  const x=minX+Math.random()*(maxX-minX),y=minY+Math.random()*(maxY-minY);
  let ok=true;
  for(const o of m.obstacles){
   if(o.type==='circle'&&Math.hypot(x-o.x,y-o.y)<o.r+pad){ok=false;break;}
   if(o.type==='rect'){
    const cx=Math.max(o.x,Math.min(x,o.x+o.w)),cy=Math.max(o.y,Math.min(y,o.y+o.h));
    if(Math.hypot(x-cx,y-cy)<pad){ok=false;break;}
   }
  }
  if(ok)return [x,y];
  fx=x;fy=y;
 }
 return [fx,fy];
}
function collideEntityMap(e,radius,m,onBumper){
 for(const o of m.obstacles){
  if(o.type==='circle'){
   const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy),minD=o.r+radius;
   if(d<minD){
    const nx=d?dx/d:1,ny=d?dy/d:0;
    e.x=o.x+nx*minD;e.y=o.y+ny*minD;
    const vn=e.vx*nx+e.vy*ny;
    if(vn<0){e.vx-=2*vn*nx;e.vy-=2*vn*ny;}
    if(o.bumper&&onBumper)onBumper();
   }
  }else if(o.type==='rect'){
   const cx=Math.max(o.x,Math.min(e.x,o.x+o.w)),cy=Math.max(o.y,Math.min(e.y,o.y+o.h));
   const dx=e.x-cx,dy=e.y-cy,d=Math.hypot(dx,dy);
   if(d<radius){
    let nx,ny;
    if(d>0.0001){nx=dx/d;ny=dy/d;}
    else{
     const dl=e.x-o.x,dr=(o.x+o.w)-e.x,dt=e.y-o.y,db=(o.y+o.h)-e.y;
     const minSide=Math.min(dl,dr,dt,db);
     if(minSide===dl){nx=-1;ny=0;}else if(minSide===dr){nx=1;ny=0;}else if(minSide===dt){nx=0;ny=-1;}else{nx=0;ny=1;}
    }
    e.x=cx+nx*radius;e.y=cy+ny*radius;
    const vn=e.vx*nx+e.vy*ny;
    if(vn<0){e.vx-=2*vn*nx;e.vy-=2*vn*ny;}
   }
  }
 }
}
export function attackDamage(p){return p.floyd?p.power+1:p.power;}
export function speedBonus(p){return (p.floyd?(p.power-5)*10:p.kirk&&p.teaBuff>0?25:0)+(p.bumperBoost>0?35:0);}
export function selectFighter(p,id){
 p.floyd=id==='floyd';p.net=id==='net';p.kirk=id==='kirk';p.diddy=id==='diddy';
 p.maxHP=p.floyd?250:(p.net||p.kirk||p.diddy)?200:100;
 p.hp=p.maxHP;
}
export function fresh(fixedColors,mapId='arena'){
 const colors=pickPairColors(fixedColors);
 const resolved=MAPS[mapId]?mapId:'arena';
 return [0,1].map(i=>({
  x:i?620:180,y:240,power:5,
  floyd:false,net:false,kirk:false,diddy:false,
  color:colors[i].hex,colorName:colors[i].name,
  mapId:resolved,
  drops:[],stars:[],waves:[],oils:[],
  shots:0,starHits:0,beam:null,
  teas:0,teaBuff:0,teaAnim:0,
  pickupAnim:null,bumperBoost:0,hazardAcc:0,
  maxHP:100,hp:100,angle:i?Math.PI:0,vx:0,vy:0,cool:0
 }));
}
export function launch(ps){
 for(const p of ps){
  p.started=Date.now();
  p.throws=0;p.decays=0;p.shots=0;p.starHits=0;p.beam=null;
  p.teas=0;p.teaBuff=0;p.teaAnim=0;p.pickupAnim=null;
  p.bumperBoost=0;p.hazardAcc=0;
  p.waves=[];p.drops=[];p.stars=[];p.oils=[];
  p.power=5;
  p.vx=BASE_SPEED*Math.cos(p.angle);p.vy=BASE_SPEED*Math.sin(p.angle);
 }
}
export function step(ps,mapId){
 const activeMapId=mapId||ps[0]?.mapId||'arena';
 const m=getMap(activeMapId);
 for(const p of ps){
  const speed=1+speedBonus(p)/100;
  p.x+=p.vx*speed;p.y+=p.vy*speed;
  p.cool=Math.max(0,p.cool-1);
  if(p.bumperBoost>0)p.bumperBoost--;
  if(p.x<MIN_X||p.x>MAX_X){p.x=p.x<MIN_X?MIN_X*2-p.x:MAX_X*2-p.x;p.vx*=-1;}
  if(p.y<MIN_Y||p.y>MAX_Y){p.y=p.y<MIN_Y?MIN_Y*2-p.y:MAX_Y*2-p.y;p.vy*=-1;}
  collideEntityMap(p,R,m,()=>{p.bumperBoost=36;});
  for(const h of m.hazards){
   if(Math.hypot(p.x-h.x,p.y-h.y)<=h.r+R*0.65){
    p.hazardAcc=(p.hazardAcc||0)+STEP_MS;
    while(p.hazardAcc>=250){
     p.hazardAcc-=250;
     if(p.hp>0){p.hp=Math.max(0,p.hp-1);p.cool=Math.max(p.cool,6);}
    }
   }
  }
  if(p.beam){
   p.beam.ttl--;
   if(p.beam.ttl<=0)p.beam=null;
  }
  if(p.pickupAnim){
   p.pickupAnim.ttl--;
   if(p.pickupAnim.ttl<=0)p.pickupAnim=null;
  }
  if(p.teaAnim>0)p.teaAnim--;
  if(p.teaBuff>0){
   p.teaBuff--;
   if(p.teaBuff===0&&p.kirk)p.power=5;
  }
 }
 for(const p of ps){
  const rival=ps[0]===p?ps[1]:ps[0];
  const elapsed=Date.now()-p.started;
  if(p.net){
   if(p.beam){p.beam.sx=p.x;p.beam.sy=p.y;p.beam.tx=rival.x;p.beam.ty=rival.y;}
   const shots=Math.floor(elapsed/5000);
   if(shots>p.shots){
    p.shots=shots;
    const angle=Math.atan2(rival.y-p.y,rival.x-p.x);
    p.stars.push({x:p.x,y:p.y,vx:6.4*Math.cos(angle),vy:6.4*Math.sin(angle)});
   }
   p.stars=p.stars.filter(star=>{
    star.x+=star.vx;star.y+=star.vy;
    if(star.x<9||star.x>791){star.vx*=-1;star.x=star.x<9?18-star.x:1582-star.x;}
    if(star.y<9||star.y>471){star.vy*=-1;star.y=star.y<9?18-star.y:942-star.y;}
    collideEntityMap(star,9,m);
    if(Math.hypot(star.x-rival.x,star.y-rival.y)>R+9)return true;
    rival.hp=Math.max(0,rival.hp-12);rival.cool=18;
    p.starHits=(p.starHits||0)+1;
    if(p.starHits>=5){
     p.starHits=0;
     rival.hp=Math.max(0,rival.hp-50);rival.cool=30;
     p.beam={sx:p.x,sy:p.y,tx:rival.x,ty:rival.y,ttl:52,max:52};
    }
    return false;
   });
  }
  if(p.kirk){
   const teas=Math.floor(elapsed/15000);
   if(teas>p.teas){
    p.teas=teas;
    p.hp=Math.min(200,p.hp+25);
    p.teaBuff=300;
    p.teaAnim=140;
    p.power=8;
   }
   const shots=Math.floor(elapsed/4000);
   if(shots>p.shots){
    p.shots=shots;
    const angle=Math.atan2(rival.y-p.y,rival.x-p.x);
    p.waves.push({x:p.x,y:p.y,vx:5.8*Math.cos(angle),vy:5.8*Math.sin(angle),ageMs:0,dmg:18});
   }
   p.waves=p.waves.filter(w=>{
    w.ageMs=(w.ageMs||0)+STEP_MS;
    w.dmg=Math.max(0,18-Math.floor(w.ageMs/1000)*3);
    if(w.dmg<=0)return false;
    w.x+=w.vx;w.y+=w.vy;
    if(w.x<12||w.x>788){w.vx*=-1;w.x=w.x<12?24-w.x:1576-w.x;}
    if(w.y<12||w.y>468){w.vy*=-1;w.y=w.y<12?24-w.y:936-w.y;}
    collideEntityMap(w,12,m);
    if(Math.hypot(w.x-rival.x,w.y-rival.y)>R+12)return true;
    rival.hp=Math.max(0,rival.hp-w.dmg);rival.cool=18;
    const wn=Math.hypot(w.vx,w.vy)||1;
    const rSpeed=Math.hypot(rival.vx,rival.vy)||BASE_SPEED;
    const nvx=rival.vx+(w.vx/wn)*1.8,nvy=rival.vy+(w.vy/wn)*1.8;
    const nn=Math.hypot(nvx,nvy)||1;
    rival.vx=nvx/nn*rSpeed;rival.vy=nvy/nn*rSpeed;
    return false;
   });
  }
  if(p.diddy){
   const throws=Math.floor(elapsed/6000);
   if(throws>p.throws){
    p.throws=throws;
    const [tx,ty]=safeSpot(activeMapId,95,705,95,385,25);
    p.oils.push({x:p.x,y:p.y,sx:p.x,sy:p.y,tx,ty,born:elapsed,flight:true,r:72.5,landedAt:0,left:10000,ownAcc:0,foeAcc:0});
   }
   p.oils=p.oils.filter(oil=>{
    if(oil.flight){
     const t=Math.min(1,(elapsed-oil.born)/600);
     oil.x=oil.sx+(oil.tx-oil.sx)*t;oil.y=oil.sy+(oil.ty-oil.sy)*t;
     if(t<1)return true;
     oil.flight=false;oil.landedAt=elapsed;oil.left=10000;
    }
    oil.left=Math.max(0,10000-(elapsed-oil.landedAt));
    if(oil.left<=0)return false;
    const hitDist=oil.r+R;
    if(Math.hypot(p.x-oil.x,p.y-oil.y)<=hitDist){
     oil.ownAcc+=STEP_MS;
     while(oil.ownAcc>=999.99){
      oil.ownAcc-=1000;
      if(p.hp>0)p.hp=Math.min(p.maxHP,p.hp+1);
     }
    }
    if(Math.hypot(rival.x-oil.x,rival.y-oil.y)<=hitDist){
     oil.foeAcc+=STEP_MS;
     while(oil.foeAcc>=999.99){
      oil.foeAcc-=1000;
      if(rival.hp>0){rival.hp=Math.max(0,rival.hp-1);rival.cool=Math.max(rival.cool,6);}
     }
    }
    return true;
   });
  }
  if(!p.floyd)continue;
  const throws=Math.floor(elapsed/3000),decays=Math.floor(elapsed/7000);
  p.power=Math.max(0,p.power-(decays-p.decays));p.decays=decays;
  if(throws>p.throws){
   p.throws=throws;
   const [tx,ty]=safeSpot(activeMapId,60,740,60,420,20);
   p.drops.push({x:p.x,y:p.y,sx:p.x,sy:p.y,tx,ty,born:elapsed,flight:true});
  }
  p.drops=p.drops.filter(item=>{
   if(item.flight){
    const t=Math.min(1,(elapsed-item.born)/800);
    item.x=item.sx+(item.tx-item.sx)*t;item.y=item.sy+(item.ty-item.sy)*t;
    if(t<1)return true;
    item.flight=false;
   }
   if(Math.hypot(p.x-item.x,p.y-item.y)>R+4)return true;
   p.hp=Math.min(250,p.hp+4);
   p.power=Math.min(10,p.power+1);
   p.pickupAnim={x:p.x,y:p.y,ttl:45,max:45,label:'+4 HP · +1 Fent'};
   return false;
  });
 }
 const [a,b]=ps,dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
 if(d>=D)return;
 const nx=d?dx/d:1,ny=d?dy/d:0,overlap=(D-d)/2;
 a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
 const closing=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
 if(closing<=0)return;
 const impactA=a.vx*nx+a.vy*ny,impactB=-b.vx*nx-b.vy*ny;
 a.vx-=closing*nx;a.vy-=closing*ny;b.vx+=closing*nx;b.vy+=closing*ny;
 if(impactA>0.001){b.hp=Math.max(0,b.hp-attackDamage(a));b.cool=18;}
 if(impactB>0.001){a.hp=Math.max(0,a.hp-attackDamage(b));a.cool=18;}
}
