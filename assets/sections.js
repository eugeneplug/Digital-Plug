(() => {
  const home=document.querySelector('.home-viewport');
  const intro=document.querySelector('#about');
  const videos=[...document.querySelectorAll('.knight-video')];
  let video=videos[0];
  let clipQueue=[];
  let lastVideoIndex=-1;
  function chooseNextClip(){
    if(!clipQueue.length){
      clipQueue=videos.map((_,index)=>index);
      for(let i=clipQueue.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [clipQueue[i],clipQueue[j]]=[clipQueue[j],clipQueue[i]];
      }
      if(clipQueue.length>1&&clipQueue[0]===lastVideoIndex){
        const swap=1+Math.floor(Math.random()*(clipQueue.length-1));
        [clipQueue[0],clipQueue[swap]]=[clipQueue[swap],clipQueue[0]];
      }
    }
    const chosen=clipQueue.shift();
    lastVideoIndex=chosen;
    return chosen;
  }
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const dialog=document.querySelector('#info-panel');
  const next=document.querySelector('.next-section');
  let busy=false,phase='home',run=0,frame=0,wheelTotal=0,lastWheel=0,touchY=null,touchPrevious=null;
  let keyboardScroll=false,pointerFocus=null;
  function clearPointerFocus(){
    if(pointerFocus){pointerFocus.removeAttribute('data-scroll-focus');pointerFocus=null;}
  }
  function focusSection(target){
    clearPointerFocus();
    if(!keyboardScroll){target.dataset.scrollFocus='pointer';pointerFocus=target;}
    target.focus({preventScroll:true});
  }
  window.addEventListener('keydown',clearPointerFocus,{capture:true});
  const ease=t=>.35*t+.65*t*t;
  const easeReturn=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const destination=()=>intro.getBoundingClientRect().top+window.scrollY;
  function updateScenes(){
    const distance=destination()||innerHeight;
    const progress=Math.max(0,Math.min(1,window.scrollY/distance));
    home.style.setProperty('--scene-exit',progress.toFixed(4));
    if(!busy&&window.scrollY<distance-1&&phase==='intro')resetHome();
  }
  function resetHome(){
    videos.forEach(clip=>{clip.pause();clip.classList.remove('is-selected');});
    home.classList.remove('is-playing');home.inert=false;phase='home';
    try{video.currentTime=0;}catch{}
    home.dataset.transition='idle';
  }
  function scrollToSection(target,duration,easing=ease){
    if(frame)cancelAnimationFrame(frame);
    const from=window.scrollY;
    return new Promise(resolve=>{
      if(!duration){window.scrollTo(0,target());updateScenes();resolve();return;}
      const start=performance.now();
      function tick(now){
        const progress=motion.matches?1:Math.min(1,(now-start)/duration);
        window.scrollTo(0,from+(target()-from)*easing(progress));updateScenes();
        if(progress<1)frame=requestAnimationFrame(tick);else{frame=0;resolve();}
      }
      frame=requestAnimationFrame(tick);
    });
  }
  async function up(keyboard=false){
    if(busy||dialog.open||window.scrollY<2)return;
    keyboardScroll=keyboard===true;
    const id=++run;
    resetHome();
    busy=true;phase='returning';home.dataset.transition='returning';
    wheelTotal=0;
    await scrollToSection(()=>0,motion.matches?0:900,easeReturn);
    if(id!==run)return;
    busy=false;resetHome();updateScenes();
    focusSection(document.querySelector('.manifesto'));
  }
  async function slideDown(id){
    if(id!==run||phase!=='playing')return;
    phase='sliding';home.dataset.transition='sliding';
    await scrollToSection(destination,motion.matches?0:980);
    if(id!==run)return;
    busy=false;phase='intro';
    home.dataset.transition='complete';video.pause();
    focusSection(document.querySelector('#about-title'));
  }
  function down(keyboard=false){
    if(busy||dialog.open)return;
    keyboardScroll=keyboard===true;
    busy=true;const id=++run;phase='playing';home.dataset.transition='playing';home.inert=true;
    if(motion.matches){slideDown(id);return;}
    const chosenIndex=chooseNextClip();
    video=videos[chosenIndex];
    home.dataset.activeClip=String(chosenIndex+1);
    videos.forEach(clip=>{clip.pause();clip.classList.toggle('is-selected',clip===video);});
    let started=false;
    function begin(){
      if(id!==run||!busy||started)return;
      started=true;home.classList.add('is-playing');
    }
    video.muted=true;video.playsInline=true;video.playbackRate=2.5;
    try{video.currentTime=0;}catch{}
    video.addEventListener('playing',begin,{once:true});
    try{
      const promise=video.play();
      if(promise)promise.then(begin).catch(()=>{if(id===run)home.classList.remove('is-playing');});
    }catch{}
    setTimeout(()=>slideDown(id),200);
  }
  videos.forEach(clip=>clip.addEventListener('error',()=>{if(clip===video)home.classList.remove('is-playing');}));
  function nearHome(){return window.scrollY<Math.min(90,innerHeight*.12);}
  function entersHome(delta){
    const y=window.scrollY,edge=destination();
    return delta<0&&y>2&&(y<=edge+2||y+delta<=edge);
  }
  window.addEventListener('wheel',event=>{
    if(event.ctrlKey||dialog.open)return;
    if(busy){event.preventDefault();return;}
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(entersHome(delta)){event.preventDefault();up();return;}
    if(nearHome()&&event.deltaY>0){
      event.preventDefault();const now=performance.now();
      wheelTotal=now-lastWheel>180?event.deltaY:wheelTotal+event.deltaY;lastWheel=now;
      if(wheelTotal>16){wheelTotal=0;down();}
    }
  },{passive:false});
  window.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||dialog.open||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if([' ','Enter'].includes(event.key)&&event.target.closest('button,a'))return;
    if(busy&&['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(event.key)){event.preventDefault();return;}
    const upward=event.key==='ArrowUp'?-40:event.key==='PageUp'||(event.key===' '&&event.shiftKey)?-innerHeight*.9:0;
    if((event.key==='Home'&&window.scrollY>2)||entersHome(upward)){event.preventDefault();up(true);return;}
    if(!event.shiftKey&&nearHome()&&['ArrowDown','PageDown',' '].includes(event.key)){event.preventDefault();down(true);}
  });
  window.addEventListener('touchstart',event=>{touchY=touchPrevious=event.touches.length===1?event.touches[0].clientY:null;},{passive:true});
  window.addEventListener('touchmove',event=>{
    if(dialog.open||event.touches.length!==1)return;
    if(busy){event.preventDefault();return;}
    if(touchY===null)return;
    const delta=touchY-event.touches[0].clientY;
    const step=touchPrevious-event.touches[0].clientY;
    touchPrevious=event.touches[0].clientY;
    if(delta < -35&&entersHome(step)){event.preventDefault();touchY=touchPrevious=null;up();return;}
    if(nearHome()&&delta>35){event.preventDefault();touchY=touchPrevious=null;down();}
  },{passive:false});
  window.addEventListener('touchend',()=>{touchY=touchPrevious=null;},{passive:true});
  next.addEventListener('click',event=>down(event.detail===0));
  document.querySelectorAll('.logo,[data-home-link]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();up(event.detail===0);}));
  window.addEventListener('scroll',updateScenes,{passive:true});
  window.addEventListener('resize',updateScenes);
  motion.addEventListener('change',()=>{if(motion.matches&&busy&&phase==='playing')slideDown(run);});
  updateScenes();
})();




