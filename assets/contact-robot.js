(() => {
  const section=document.querySelector('#contacts');
  const stage=section?.querySelector('.contact-robot');
  if(!stage)return;
  const intro=stage.querySelector('.contact-robot-intro');
  const cycle=stage.querySelector('.contact-robot-loop');
  const outro=stage.querySelector('.contact-robot-outro');
  const videos=[intro,cycle,outro].filter(Boolean);
  const desktop=matchMedia('(min-width: 1024px)');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const dialog=document.querySelector('#info-panel');
  const surface=section.querySelector('.contact-surface');
  const layout=section.querySelector('.contact-layout');
  const formHost=section.querySelector('.contact-form-host');
  let centerTimer;
  let visible=false,near=false,loaded=false,phase='intro';
  const current=()=>phase==='outro'?outro:phase==='intro'?intro:cycle;
  const allowed=()=>desktop.matches&&visible&&!document.hidden&&!dialog?.open&&!motion.matches;
  function load(){
    if(loaded||!desktop.matches)return;
    loaded=true;
    intro.poster=intro.dataset.poster;
    for(const video of [intro,cycle]){
      video.defaultPlaybackRate=.75;video.playbackRate=.75;
      video.muted=true;video.defaultMuted=true;video.playsInline=true;
      video.preload='auto';video.src=video.dataset.src;video.load();
    }
  }
  function ready(){stage.classList.add('is-ready');}
  function measureThanks(){
    const bounds=layout.getBoundingClientRect(),host=formHost.getBoundingClientRect();
    const offset=desktop.matches?bounds.left+bounds.width/2-host.left-host.width/2:0;
    surface.style.setProperty('--success-center-offset',offset.toFixed(2)+'px');
  }
  function centerThanks(){
    if(phase!=='outro')return;
    clearTimeout(centerTimer);measureThanks();surface.classList.add('is-concluded');
  }
  function finishOutro(){
    if(phase!=='outro')return;
    stage.classList.add('is-finished');
    clearTimeout(centerTimer);
    centerTimer=setTimeout(centerThanks,motion.matches?0:350);
  }
  new ResizeObserver(measureThanks).observe(layout);
  function loadOutro(){
    if(!outro||!desktop.matches||outro.getAttribute('src'))return;
    outro.muted=true;outro.defaultMuted=true;outro.playsInline=true;
    outro.defaultPlaybackRate=.75;outro.playbackRate=.75;
    outro.preload='auto';outro.src=outro.dataset.src;outro.load();
  }
  intro.addEventListener('loadeddata',ready);
  intro.addEventListener('error',()=>{ready();stage.classList.add('is-static');});
  cycle.addEventListener('error',()=>stage.classList.add('is-static'));
  outro?.addEventListener('error',finishOutro);
  outro?.addEventListener('ended',finishOutro);
  function sync(){
    stage.classList.toggle('is-visible',desktop.matches&&visible);
    if(desktop.matches&&(visible||near))load();
    if(!allowed()){videos.forEach(video=>video.pause());return;}
    if(phase==='outro')loadOutro();
    const active=current();
    videos.forEach(video=>{if(video!==active)video.pause();});
    if(!active||(phase==='outro'&&active.ended))return;
    if(!active.paused)return;
    const playing=active.play();
    playing?.then(()=>{
      if(!allowed()||current()!==active){active.pause();return;}
      const show=()=>{if(allowed()&&current()===active){stage.dataset.phase=phase;if(phase==='outro')stage.classList.add('is-outro-ready');ready();}};
      if(active.requestVideoFrameCallback)active.requestVideoFrameCallback(show);else show();
    }).catch(()=>stage.classList.add('is-static'));
  }
  intro.addEventListener('ended',()=>{
    if(phase!=='intro')return;
    phase='loop';cycle.currentTime=0;sync();
  });
  document.addEventListener('project:submitting',event=>{
    if(event.detail?.form?.closest('#contacts')&&desktop.matches&&!motion.matches)loadOutro();
  });
  document.addEventListener('project:submitted',event=>{
    if(!event.detail?.form?.closest('#contacts')||!outro||phase==='outro')return;
    phase='outro';outro.currentTime=0;
    if(motion.matches||outro.error)finishOutro();
    sync();
  });
  new IntersectionObserver(entries=>{
    near=entries.some(entry=>entry.isIntersecting);if(near&&desktop.matches)load();
  },{rootMargin:'400px'}).observe(section);
  new IntersectionObserver(entries=>{
    visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.18);sync();
  },{threshold:[0,.18,.4]}).observe(section.querySelector('.contact-surface'));
  document.addEventListener('visibilitychange',sync);
  desktop.addEventListener('change',sync);motion.addEventListener('change',sync);
  if(dialog)new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
  section.addEventListener('pointerdown',()=>{if(allowed())sync();},{passive:true});
})();
