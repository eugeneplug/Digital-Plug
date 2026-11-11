(() => {
  const rows=[...document.querySelectorAll('.service-row')];
  if(!rows.length)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const visible=new Set();
  function sync(){
    for(const row of rows)row.classList.toggle('is-motion-active',visible.has(row)&&!document.hidden&&!reduced.matches);
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);
    }
    sync();
  },{threshold:.01});
  rows.forEach(row=>observer.observe(row));
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
})();
