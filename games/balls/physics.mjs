const R=47.52,D=R*2,MIN_X=R,MAX_X=800-R,MIN_Y=R,MAX_Y=480-R,TICK_MS=32;
export const PALETTE=[
 {hex:'#47f09a',name:'Szmaragdowy'},
 {hex:'#ff5e78',name:'Karmazynowy'},
 {hex:'#49c6ff',name:'Błękitny'},
 {hex:'#c77dff',name:'Fioletowy'},
 {hex:'#ff9f43',name:'Pomarańczowy'},
 {hex:'#ff66c4',name:'Neonowy róż'}
];
function pickPairColors(fixed){
 if(Array.isArray(fixed)&&fixed.length===2)return fixed;
 const pool=[...PALETTE];
 const a=pool.splice(Math.floor(Math.random()*pool.length),1)[0];
 const b=pool[Math.floor(Math.random()*pool.length)];
 return [a,b];
}
export function speedBonus(p){return p.floyd?(p.power-5)*10:p.kirk&&p.teaBuff>0?25:0;}
export function selectFighter(p,id){
 p.floyd=id==='floyd';p.net=id==='net';p.kirk=id==='kirk';p.diddy=id==='diddy';
 p.maxHP=p.floyd?250:(p.net||p.kirk||p.diddy)?200:100;
 p.hp=p.maxHP;
}
export function fresh(fixedColors){
 const colors=pickPairColors(fixedColors);
 return [0,1].map(i=>({
  x:i?600:200,y:240,power:5,
  floyd:false,net:false,kirk:false,diddy:false,
  color:colors[i].hex,colorName:colors[i].name,
  drops:[],stars:[],waves:[],oils:[],
  shots:0,starHits:0,beam:null,
  teas:0,teaBuff:0,teaAnim:0,
  pickupAnim:null,
  maxHP:100,hp:100,angle:i?Math.PI:0,vx:0,vy:0,cool:0
 }));
}
export function launch(ps){
 for(const p of ps){
  p.started=Date.now();
  p.throws=0;p.decays=0;p.shots=0;p.starHits=0;p.beam=null;
  p.teas=0;p.teaBuff=0;p.teaAnim=0;p.pickupAnim=null;
  p.waves=[];p.drops=[];p.stars=[];p.oils=[];
  p.power=5;
  p.vx=4*Math.cos(p.angle);p.vy=4*Math.sin(p.angle);
 }
}
export function step(ps){
 for(const p of ps){
  const speed=1+speedBonus(p)/100;
  p.x+=p.vx*speed;p.y+=p.vy*speed;p.cool=Math.max(0,p.cool-1);
  if(p.x<MIN_X||p.x>MAX_X){p.x=p.x<MIN_X?MIN_X*2-p.x:MAX_X*2-p.x;p.vx*=-1;}
  if(p.y<MIN_Y||p.y>MAX_Y){p.y=p.y<MIN_Y?MIN_Y*2-p.y:MAX_Y*2-p.y;p.vy*=-1;}
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
    p.stars.push({x:p.x,y:p.y,vx:10*Math.cos(angle),vy:10*Math.sin(angle)});
   }
   p.stars=p.stars.filter(star=>{
    star.x+=star.vx;star.y+=star.vy;
    if(star.x<9||star.x>791){star.vx*=-1;star.x=star.x<9?18-star.x:1582-star.x;}
    if(star.y<9||star.y>471){star.vy*=-1;star.y=star.y<9?18-star.y:942-star.y;}
    if(Math.hypot(star.x-rival.x,star.y-rival.y)>R+9)return true;
    rival.hp=Math.max(0,rival.hp-12);rival.cool=10;
    p.starHits=(p.starHits||0)+1;
    if(p.starHits>=5){
     p.starHits=0;
     rival.hp=Math.max(0,rival.hp-50);rival.cool=18;
     p.beam={sx:p.x,sy:p.y,tx:rival.x,ty:rival.y,ttl:28,max:28};
    }
    return false;
   });
  }
  if(p.kirk){
   const teas=Math.floor(elapsed/15000);
   if(teas>p.teas){
    p.teas=teas;
    p.hp=Math.min(200,p.hp+25);
    p.teaBuff=156;
    p.teaAnim=75;
    p.power=8;
   }
   const shots=Math.floor(elapsed/4000);
   if(shots>p.shots){
    p.shots=shots;
    const angle=Math.atan2(rival.y-p.y,rival.x-p.x);
    p.waves.push({x:p.x,y:p.y,vx:9*Math.cos(angle),vy:9*Math.sin(angle),bounces:0});
   }
   p.waves=p.waves.filter(w=>{
    w.x+=w.vx;w.y+=w.vy;
    if(w.x<12||w.x>788){
     if(w.bounces>=1)return false;
     w.bounces++;w.vx*=-1;w.x=w.x<12?24-w.x:1576-w.x;
    }
    if(w.y<12||w.y>468){
     if(w.bounces>=1)return false;
     w.bounces++;w.vy*=-1;w.y=w.y<12?24-w.y:936-w.y;
    }
    if(Math.hypot(w.x-rival.x,w.y-rival.y)>R+12)return true;
    rival.hp=Math.max(0,rival.hp-9);rival.cool=10;
    const wn=Math.hypot(w.vx,w.vy)||1;
    const rSpeed=Math.hypot(rival.vx,rival.vy)||4;
    const nvx=rival.vx+(w.vx/wn)*2.2,nvy=rival.vy+(w.vy/wn)*2.2;
    const nn=Math.hypot(nvx,nvy)||1;
    rival.vx=nvx/nn*rSpeed;rival.vy=nvy/nn*rSpeed;
    return false;
   });
  }
  if(p.diddy){
   const throws=Math.floor(elapsed/6000);
   if(throws>p.throws){
    p.throws=throws;
    const tx=85+Math.random()*630,ty=85+Math.random()*310;
    p.oils.push({x:p.x,y:p.y,sx:p.x,sy:p.y,tx,ty,born:elapsed,flight:true,r:58,landedAt:0,left:10000,ownAcc:0,foeAcc:0});
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
    const hitDist=oil.r+R*0.5;
    if(Math.hypot(p.x-oil.x,p.y-oil.y)<=hitDist){
     oil.ownAcc+=TICK_MS;
     while(oil.ownAcc>=1000/3){
      oil.ownAcc-=1000/3;
      if(p.hp>0)p.hp=Math.min(p.maxHP,p.hp+1);
     }
    }
    if(Math.hypot(rival.x-oil.x,rival.y-oil.y)<=hitDist){
     oil.foeAcc+=TICK_MS;
     while(oil.foeAcc>=1000/3){
      oil.foeAcc-=1000/3;
      if(rival.hp>0){rival.hp=Math.max(0,rival.hp-1);rival.cool=Math.max(rival.cool,4);}
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
   const tx=60+Math.random()*680,ty=60+Math.random()*360;
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
   p.hp=Math.min(250,p.hp+5);
   p.power=Math.min(10,p.power+1);
   p.pickupAnim={x:p.x,y:p.y,ttl:24,max:24,label:'+5 HP · +1 Fent'};
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
 if(impactA>0.001){b.hp=Math.max(0,b.hp-a.power);b.cool=10;}
 if(impactB>0.001){a.hp=Math.max(0,a.hp-b.power);a.cool=10;}
}
