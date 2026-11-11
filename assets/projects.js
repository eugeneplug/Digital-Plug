(() => {
  const section=document.querySelector('#projects');
  if(!section)return;
  const rail=section.querySelector('.projects-track');
  const cards=[...rail.querySelectorAll('.case-card')];
  const prev=section.querySelector('.projects-prev'),next=section.querySelector('.projects-next');
  const progress=section.querySelector('.projects-progress>span'),status=section.querySelector('.projects-status');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let stops=[],bounds=[],max=0,view=0,frame=0,last=0,paintFrame=0,position=0,velocity=0,target=0,drag=null;
  let announced='',announceTimer=0;
  const clamp=value=>Math.max(0,Math.min(max,value));
  function update(announce=false){
    const left=rail.scrollLeft,right=left+view;
    const shown=bounds.map((box,index)=>({box,index})).filter(({box})=>Math.min(right,box.x+box.w)-Math.max(left,box.x)>=box.w*.5);
    const first=(shown[0]?.index??0)+1,end=(shown.at(-1)?.index??cards.length-1)+1;
    const atStart=(frame?target:left)<=1,atEnd=(frame?target:left)>=max-1;
    if(prev.disabled!==atStart)prev.disabled=atStart;
    if(next.disabled!==atEnd)next.disabled=atEnd;
    const visible=Math.min(1,view/(view+max));
    progress.style.transform=`scaleX(${(visible+(1-visible)*(max?left/max:0)).toFixed(5)})`;
    if(announce){const text=`Показаны проекты с ${first} по ${end} из ${cards.length}.`;if(text!==announced){status.textContent=text;announced=text;}}
  }
  function stop(){
    if(frame)cancelAnimationFrame(frame);
    frame=last=0;velocity=0;position=target=rail.scrollLeft;
    rail.classList.remove('is-sliding');
  }
  function finish(){
    rail.scrollLeft=target;position=target;velocity=0;frame=last=0;
    rail.classList.remove('is-sliding');update(true);
  }
  function tick(now){
    frame=0;
    const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
    // Continuous position and velocity keep rapid reversals smooth.
    const frequency=8.5,error=position-target,coefficient=velocity+frequency*error,decay=Math.exp(-frequency*dt);
    position=target+(error+coefficient*dt)*decay;
    velocity=(velocity-frequency*coefficient*dt)*decay;
    if(position<0||position>max){position=clamp(position);velocity=0;}
    rail.scrollLeft=position;update();
    if(Math.abs(position-target)<.45&&Math.abs(velocity)<3){finish();return;}
    frame=requestAnimationFrame(tick);
  }
  function go(value,initialVelocity){
    const destination=clamp(value);
    if(!frame){position=rail.scrollLeft;velocity=initialVelocity||0;last=0;}
    target=destination;
    if(motion.matches){if(frame)cancelAnimationFrame(frame);finish();return;}
    rail.classList.add('is-sliding');
    if(!frame)frame=requestAnimationFrame(tick);
    update();
  }
  function move(direction){
    const from=frame?target:rail.scrollLeft;
    const destination=direction>0?stops.find(value=>value>from+1):stops.findLast(value=>value<from-1);
    if(destination!==undefined)go(destination);
  }
  function measure(){
    const ratio=max?rail.scrollLeft/max:0;
    stop();view=rail.clientWidth;max=Math.max(0,rail.scrollWidth-view);
    const origin=cards[0]?.offsetLeft||0;
    bounds=cards.map(card=>({x:card.offsetLeft,w:card.offsetWidth}));
    stops=[0];
    cards.forEach(card=>{const value=clamp(card.offsetLeft-origin);if(value-stops.at(-1)>1)stops.push(value);});
    if(max-stops.at(-1)>1)stops.push(max);
    rail.scrollLeft=stops.reduce((best,value)=>Math.abs(value-ratio*max)<Math.abs(best-ratio*max)?value:best,0);
    position=target=rail.scrollLeft;update();
  }
  prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  rail.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();event.stopPropagation();move(event.key==='ArrowRight'?1:-1);}
    else if(event.key==='Home'||event.key==='End'){event.preventDefault();event.stopPropagation();go(event.key==='Home'?0:max);}
  });
  rail.addEventListener('scroll',()=>{
    if(!paintFrame)paintFrame=requestAnimationFrame(()=>{paintFrame=0;update();});
    clearTimeout(announceTimer);announceTimer=setTimeout(()=>update(true),180);
  },{passive:true});
  rail.addEventListener('wheel',stop,{passive:true});
  rail.addEventListener('pointerdown',event=>{
    stop();
    if(event.pointerType==='touch'||event.button!==0||!event.target.closest('.case-cover'))return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:rail.scrollLeft,last:rail.scrollLeft,time:performance.now(),speed:0,active:false};
  });
  rail.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.active){
      if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}
      if(Math.abs(dx)<6)return;
      drag.active=true;rail.setPointerCapture(event.pointerId);rail.classList.add('is-dragging');
    }
    event.preventDefault();
    const value=clamp(drag.start-dx),now=performance.now(),dt=Math.max(8,now-drag.time);
    drag.speed=drag.speed*.6+((value-drag.last)/dt*1000)*.4;
    rail.scrollLeft=value;drag.last=value;drag.time=now;
  });
  function release(event,cancelled=false){
    if(!drag||(event&&event.pointerId!==drag.id))return;
    const state=drag;drag=null;rail.classList.remove('is-dragging');
    if(rail.hasPointerCapture(state.id))rail.releasePointerCapture(state.id);
    if(!state.active)return;
    const speed=performance.now()-state.time>100?0:state.speed;
    const predicted=clamp(rail.scrollLeft+(cancelled?0:speed*.18));
    const destination=stops.reduce((best,value)=>Math.abs(value-predicted)<Math.abs(best-predicted)?value:best,stops[0]);
    go(destination,cancelled?0:Math.max(-1600,Math.min(1600,speed)));
  }
  rail.addEventListener('pointerup',event=>release(event));
  rail.addEventListener('pointercancel',event=>release(event,true));
  rail.addEventListener('lostpointercapture',event=>release(event,true));
  new ResizeObserver(measure).observe(rail);
  new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting)){release(null,true);stop();}}).observe(section);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release(null,true);stop();}});
  motion.addEventListener('change',()=>{if(motion.matches&&frame){cancelAnimationFrame(frame);finish();}});
  document.querySelectorAll('.nav a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{
    document.querySelector('.nav').classList.remove('is-open');
    const menu=document.querySelector('.menu-button');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');
  }));
  measure();
})();
