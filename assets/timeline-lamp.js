(() => {
  const root = document.querySelector('.workflow-timeline');
  if (!root) return;
  const clip = {"fps":30,"frames":150,"size":256,"columns":10,"duration":5.0,"anchor":[0.5,0.975],"offsets":[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,-0.002083,-0.002083,-0.014583,-0.039583,-0.091667,-0.129167,-0.16875,-0.185417,-0.191667,-0.191667,-0.183333,-0.170833,-0.147917,-0.114583,-0.06875,-0.033333,-0.002083,-0.002083,-0.002083,-0.002083,-0.002083,-0.002083,-0.002083,-0.002083,-0.002083,-0.033333,-0.064583,-0.091667,-0.133333,-0.166667,-0.2,-0.202083,-0.204167,-0.202083,-0.191667,-0.1375,-0.11875,-0.097917,-0.04375,-0.002083,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,-0.00625,-0.01875,-0.064583,-0.110417,-0.14375,-0.16875,-0.18125,-0.16875,-0.154167,-0.116667,-0.072917,-0.01875,-0.0125,-0.004167,-0.004167,-0.008333,-0.025,-0.133333,-0.145833,-0.160417,-0.177083,-0.183333,-0.147917,-0.129167,-0.110417,-0.05625,-0.010417,-0.002083,-0.002083,-0.002083,-0.002083,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"contacts":[[0,15],[30,38],[53,101],[114,116],[127,149]]}; // Embedded source-video frame data.
  const steps = [...root.querySelectorAll('.timeline-step')];
  const lamp = root.querySelector('.timeline-lamp');
  const canvas = root.querySelector('.lamp-video');
  const context = canvas.getContext('2d');
  if (!context) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const atlas = new Image();
  let centers = [], width = 144, visible = false, ready = false;
  let frame = 0, previous = 0, clock = 0, current = -2, painted = -1;
  const smooth = t => (1 - Math.cos(Math.PI * t)) / 2;
  const hops = [[15,30,0,1],[38,53,1,2],[101,114,2,1],[116,127,1,0]];
  function measure() {
    const box = root.getBoundingClientRect();
    centers = steps.map(step => { const rect = step.getBoundingClientRect(); return rect.left + rect.width / 2 - box.left; });
    width = lamp.getBoundingClientRect().width;
    paint(clock);
  }
  function paint(time) {
    if (!centers.length) return;
    const sample = motion.matches || !ready ? 0 : (time % clip.duration) * clip.fps;
    const index = Math.min(clip.frames - 1, Math.floor(sample));
    let position = 0, landed = 0;
    if (sample >= 30 && sample < 53) position = landed = 1;
    if (sample >= 53 && sample < 114) position = landed = 2;
    if (sample >= 114 && sample < 127) position = landed = 1;
    for (const [start,end,from,to] of hops) {
      if (sample <= start || sample >= end) continue;
      position = from + (to - from) * smooth((sample - start) / (end - start));
      landed = -1;
    }
    const from = Math.floor(position), to = Math.min(2, from + 1);
    const x = centers[from] + (centers[to] - centers[from]) * (position - from);
    const next = Math.min(index + 1, clip.frames - 1);
    const jump = ready && !motion.matches ? (clip.offsets[index] + (clip.offsets[next] - clip.offsets[index]) * (sample-index)) * width : 0;
    lamp.style.transform = `translate3d(${x.toFixed(3)}px,${jump.toFixed(3)}px,0)`;
    if (ready && painted !== index) {
      context.clearRect(0,0,clip.size,clip.size);
      context.drawImage(atlas,(index%clip.columns)*clip.size,Math.floor(index/clip.columns)*clip.size,clip.size,clip.size,0,0,clip.size,clip.size);
      painted = index;
      root.classList.add('has-video-frames');
    }
    root.dataset.direction = sample >= 90 && sample < 140 ? 'backward' : 'forward';
    if (landed !== current) {
      current = landed;
      steps.forEach((step,i) => step.classList.toggle('is-current',i === landed));
      root.dataset.stage = landed < 0 ? 'jump' : `0${landed+1}`;
    }
  }
  function tick(now) {
    frame = 0;
    if (previous) clock += Math.min((now-previous)/1000,.08) * .5;
    previous = now; paint(clock); frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = previous = 0;
    const playing = ready && visible && !document.hidden && !motion.matches;
    root.classList.toggle('is-lamp-playing',playing);
    if (playing) frame = requestAnimationFrame(tick);
    else if (motion.matches) paint(0);
  }
  atlas.onload = () => { ready = true; measure(); sync(); };
  const preload = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      atlas.src = 'assets/lamp-motion.webp'; preload.disconnect();
    }
  },{rootMargin:'400px'});
  preload.observe(root);
  new ResizeObserver(measure).observe(root);
  new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); },{threshold:.1}).observe(root);
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',sync);
  measure();
})();
