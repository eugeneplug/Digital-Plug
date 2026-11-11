(() => {
  const stage=document.querySelector('.knight-stage');
  const surface=document.querySelector('.surface');
  const base=stage.querySelector('.knight-base');
  const reveal=stage.querySelector('.knight-reveal');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let x=0,y=0,r=0,opacity=0,tx=0,ty=0,tr=0,targetOpacity=0,frame=0,last=0,touchTimer;
  function paint(){
    reveal.style.setProperty('--mask-x',x.toFixed(2)+'px');
    reveal.style.setProperty('--mask-y',y.toFixed(2)+'px');
    reveal.style.setProperty('--mask-r',Math.max(0,r).toFixed(2)+'px');
    reveal.style.setProperty('--mask-alpha',opacity.toFixed(4));
  }
  function animate(now){
    frame=0;
    const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
    const follow=1-Math.exp(-dt*8.5),bloom=1-Math.exp(-dt*4.5);
    x+=(tx-x)*follow;y+=(ty-y)*follow;r+=(tr-r)*bloom;
    opacity+=(targetOpacity-opacity)*(1-Math.exp(-dt*(targetOpacity?5:3.5)));
    if(Math.abs(opacity-targetOpacity)<.001)opacity=targetOpacity;
    paint();
    if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(tr-r)>.05||Math.abs(targetOpacity-opacity)>.001)frame=requestAnimationFrame(animate);
    else{last=0;x=tx;y=ty;r=tr;paint();}
  }
  function start(){
    if(motion.matches){x=tx;y=ty;r=tr;opacity=targetOpacity;paint();return;}
    if(!frame)frame=requestAnimationFrame(animate);
  }
  function show(event){
    const rect=reveal.getBoundingClientRect();
    const aspect=(base.naturalWidth||1448)/(base.naturalHeight||1086);
    const width=Math.min(rect.width,rect.height*aspect),height=width/aspect;
    const left=(rect.width-width)/2,top=(rect.height-height)/2;
    tx=event?event.clientX-rect.left:left+width*.66;
    ty=event?event.clientY-rect.top:top+height*.32;
    if(tx<0||ty<0||tx>rect.width||ty>rect.height){hide();return;}
    tr=Math.min(220,Math.min(width,height)*.42);
    if(opacity<.01){x=tx;y=ty;r=tr*.85;}
    targetOpacity=1;start();
  }
  function hide(){targetOpacity=0;start();}
  function update(event){
    if(event.target.closest('a,button,nav,.manifesto')){hide();return;}
    show(event);
  }
  surface.addEventListener('pointermove',event=>{if(event.pointerType!=='touch'||event.buttons)update(event);},{passive:true});
  surface.addEventListener('pointerleave',hide);
  surface.addEventListener('pointerdown',event=>{
    update(event);
    if(event.pointerType==='touch'){clearTimeout(touchTimer);touchTimer=setTimeout(hide,1700);}
  },{passive:true});
  surface.addEventListener('pointercancel',hide);
  stage.addEventListener('focus',()=>{if(stage.matches(':focus-visible'))show();});
  stage.addEventListener('blur',hide);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){targetOpacity=0;opacity=0;if(frame)cancelAnimationFrame(frame);frame=0;last=0;paint();}});
  motion.addEventListener('change',()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;start();});
  paint();
})();

(() => {
  const stage=document.querySelector('.knight-stage');
  const orbit=stage.querySelector('.knight-orbit');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const symbols=['#','+','=','✦','clover','{}','#','×','=','+','</>','#','✦','=','·','+'];
  const particles=symbols.map((symbol,index)=>{
    const element=document.createElement('span');
    element.className='orbit-symbol';
    if(symbol==='clover'){
      element.classList.add('orbit-symbol--clover');
      element.innerHTML='<svg viewBox="0 0 80 80" aria-hidden="true" focusable="false" fill="currentColor"><rect x="24" y="24" width="32" height="32"/><circle cx="24" cy="24" r="20"/><circle cx="56" cy="24" r="20"/><circle cx="24" cy="56" r="20"/><circle cx="56" cy="56" r="20"/></svg>';
    }else{
      element.textContent=symbol;
      if(symbol==='</>')element.classList.add('orbit-symbol--code');
    }
    orbit.append(element);
    return {element,phase:index*Math.PI*2/symbols.length,speed:(index%3===0?-1:1)*(Math.PI*2/(30+(index%5)*5)),lane:.83+(index%4)*.075};
  });
  let width=0,height=0,frame=0;
  function draw(time=0){
    const seconds=time/1000;
    const rx=Math.min(width*.49,height*.86),ry=height*.55;
    particles.forEach((particle,index)=>{
      const angle=particle.phase+(motion.matches?0:seconds*particle.speed);
      const depth=(Math.sin(angle)+1)/2;
      const px=width/2+Math.cos(angle)*rx*particle.lane;
      const py=height/2+Math.sin(angle)*ry*particle.lane+Math.sin(angle*2+index)*6;
      const scale=.58+depth*.42;
      particle.element.style.transform='translate3d('+px.toFixed(2)+'px,'+py.toFixed(2)+'px,0) translate(-50%,-50%) rotate('+(Math.sin(angle+index)*12).toFixed(2)+'deg) scale('+scale.toFixed(3)+')';
      particle.element.style.opacity=(.25+depth*.65).toFixed(3);
    });
  }
  function animate(now){frame=0;if(document.hidden||motion.matches)return;draw(now);frame=requestAnimationFrame(animate);}
  function resume(){if(frame)cancelAnimationFrame(frame);frame=0;draw();if(!motion.matches&&!document.hidden)frame=requestAnimationFrame(animate);}
  new ResizeObserver(()=>{width=stage.clientWidth;height=stage.clientHeight;draw(performance.now());}).observe(stage);
  document.addEventListener('visibilitychange',resume);motion.addEventListener('change',resume);
  width=stage.clientWidth;height=stage.clientHeight;resume();
})();







