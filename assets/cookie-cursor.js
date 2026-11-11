(() => {
  const assetBase=new URL('.',document.currentScript.src);
  const link=document.querySelector('[data-cookie-cursor]');
  if(!link)return;
  const desktop=matchMedia('(min-width:761px) and (hover:hover) and (pointer:fine)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const canvas=document.createElement('canvas');
  canvas.className='cookie-cursor';canvas.setAttribute('aria-hidden','true');
  canvas.style.transformOrigin='0 0';
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  const dpr=Math.min(devicePixelRatio||1,2),size=176,cookieSize=44,displayScale=.5;
  canvas.width=canvas.height=size*dpr;
  ctx.scale(dpr,dpr);
  const image=new Image();
  let loading,stages,hovered=false,running=false,frame=0,last=0,epoch=0,bite=0;
  let x=0,y=0,tx=0,ty=0,particles=[];
  const cuts=[[39,30,13],[23,42,15],[4,29,16],[8,9,18],[32,7,22]];
  function load(){
    if(loading)return loading;
    image.src=new URL('cookie-cursor.png',assetBase).href;
    loading=image.decode().then(()=>{
      stages=Array.from({length:6},(_,stage)=>{
        const node=document.createElement('canvas');node.width=node.height=88;
        const pen=node.getContext('2d');pen.scale(2,2);
        pen.drawImage(image,0,0,cookieSize,cookieSize);
        pen.globalCompositeOperation='destination-out';
        for(const [cx,cy,r] of cuts.slice(0,stage)){
          pen.beginPath();pen.arc(cx,cy,r,0,Math.PI*2);pen.fill();
        }
        return node;
      });
      if(hovered&&desktop.matches)start();
    }).catch(()=>{loading=null;});
    return loading;
  }
  function crumbs(now,index){
    const [cx,cy]=cuts[index];
    for(let i=0;i<9;i++)particles.push({
      x:x+cx-22,y:y+cy-22,vx:(Math.random()-.35)*100,vy:-35-Math.random()*65,
      angle:Math.random()*6.28,spin:(Math.random()-.5)*7,
      size:1.3+Math.random()*2,born:now,life:650+Math.random()*300,
      color:['#b97e51','#9b6348','#765144','#d29a60'][i%4],
    });
  }
  function tick(now){
    frame=0;if(!running)return;
    const dt=Math.min(40,last?now-last:16.7);last=now;
    if(!epoch)epoch=now;
    let age=now-epoch;
    if(age>=3800){epoch=now;age=0;bite=0;}
    const stage=reduced.matches?0:Math.min(5,Math.max(0,Math.floor((age-650)/500)+1));
    if(stage>bite)for(let i=bite;i<stage;i++)crumbs(now,i);
    bite=stage;
    const follow=1-Math.exp(-dt*.04);x+=(tx-x)*follow;y+=(ty-y)*follow;
    canvas.style.transform=`translate3d(${x+22-88*displayScale}px,${y+20-64*displayScale}px,0) scale(${displayScale})`;
    ctx.clearRect(0,0,size,size);
    const pulse=age-(650+(stage-1)*500);
    const kick=!reduced.matches&&stage>0&&pulse<240?Math.exp(-pulse/65):0;
    const appear=reduced.matches?1:Math.min(1,age/240);
    const scale=1-Math.pow(1-appear,3);
    ctx.save();ctx.translate(88+Math.sin(pulse*.15)*kick*1.8,64);
    ctx.rotate(Math.sin(pulse*.1)*kick*.13);ctx.scale(scale,scale);
    ctx.globalAlpha=appear;
    ctx.drawImage(stages[stage],-22,-22,cookieSize,cookieSize);ctx.restore();
    particles=particles.filter(p=>now-p.born<p.life);
    for(const p of particles){
      const t=(now-p.born)/p.life;
      p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vy+=180*dt/1000;p.angle+=p.spin*dt/1000;
      const px=p.x-x,py=p.y-y;
      const edge=Math.max(0,Math.min(1,(84-Math.abs(px))/15,(108-py)/15,(py+60)/15));
      ctx.save();ctx.translate(88+px,64+py);ctx.rotate(p.angle);
      ctx.globalAlpha=Math.pow(1-t,1.4)*edge;ctx.fillStyle=p.color;
      ctx.beginPath();ctx.moveTo(-p.size,-p.size*.5);ctx.lineTo(p.size*.6,-p.size);
      ctx.lineTo(p.size,p.size*.6);ctx.lineTo(-p.size*.5,p.size);ctx.closePath();ctx.fill();ctx.restore();
    }
    if(!reduced.matches||Math.abs(tx-x)+Math.abs(ty-y)>.1)frame=requestAnimationFrame(tick);
  }
  function start(){
    if(running)return;
    if(!canvas.isConnected)document.body.append(canvas);
    running=true;x=tx;y=ty;epoch=last=0;bite=0;particles=[];
    canvas.classList.add('is-visible');link.classList.add('is-cookie-cursor');
    frame=requestAnimationFrame(tick);
  }
  function stop(){
    hovered=running=false;
    cancelAnimationFrame(frame);frame=0;particles=[];
    canvas.classList.remove('is-visible');link.classList.remove('is-cookie-cursor');
  }
  link.addEventListener('pointerenter',event=>{
    if(!desktop.matches||event.pointerType!=='mouse')return;
    hovered=true;tx=event.clientX;ty=event.clientY;
    if(stages)start();else load();
  });
  link.addEventListener('pointermove',event=>{
    if(!hovered)return;tx=event.clientX;ty=event.clientY;
    if(running&&!frame)frame=requestAnimationFrame(tick);
  },{passive:true});
  link.addEventListener('pointerleave',stop);link.addEventListener('pointercancel',stop);
  window.addEventListener('blur',stop);
  window.addEventListener('scroll',stop,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  desktop.addEventListener('change',()=>{if(!desktop.matches)stop();});
  reduced.addEventListener('change',stop);
})();
