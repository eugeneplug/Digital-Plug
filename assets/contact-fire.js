(() => {
  const section = document.querySelector('#contacts');
  const surface = section?.querySelector('.contact-surface');
  const stage = section?.querySelector('.contact-robot');
  const canvas = section?.querySelector('.contact-fire-layer');
  const button = section?.querySelector('.project-submit');
  if (!canvas || !stage || !button) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const desktop = matchMedia('(min-width: 1024px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.querySelector('#info-panel');
  // Source-frame markers: slowing the video also slows this firing cadence.
  const shots = {
    intro: [{time:20/30,x:161,y:210},{time:44/30,x:161,y:219}],
    loop: [{time:4/30,x:157,y:215},{time:25/30,x:159,y:216},{time:46/30,x:157,y:219},{time:65/30,x:143,y:229}]
  };
  const videos = [stage.querySelector('.contact-robot-intro'), stage.querySelector('.contact-robot-loop')];
  const clocks = new Map(videos.map(video => [video, {id:0, previous:-.001}]));
  const atlas = new Image();
  let atlasStarted = false, effects = [], raf = 0, width = 0, height = 0, ratio = 1;
  const flight = .19, impactDuration = 55 / 42;
  let impactEdges = [], previousEdge = -1;
  function impactPoint(target, origin) {
    if (!impactEdges.length) {
      impactEdges = [0,1,2,3];
      for (let i = impactEdges.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [impactEdges[i], impactEdges[j]] = [impactEdges[j], impactEdges[i]];
      }
      if (impactEdges[3] === previousEdge) [impactEdges[0],impactEdges[3]] = [impactEdges[3],impactEdges[0]];
    }
    const edge = impactEdges.pop(); previousEdge = edge;
    const along = .12 + Math.random() * .76, gap = 3 + Math.random() * 7;
    const left = target.left - origin.left, top = target.top - origin.top;
    let tx, ty;
    if (edge === 0) { tx = left + target.width * along; ty = top - gap; }
    if (edge === 1) { tx = left + target.width + gap; ty = top + target.height * along; }
    if (edge === 2) { tx = left + target.width * along; ty = top + target.height + gap; }
    if (edge === 3) { tx = left - gap; ty = top + target.height * along; }
    // Keep the whole small burst inside the section, even on a narrow laptop.
    return {tx:Math.max(46,Math.min(width-46,tx)),ty:Math.max(46,Math.min(height-46,ty))};
  }
  function enabled() {
    return desktop.matches && !reduced.matches && !document.hidden && !dialog?.open &&
      stage.classList.contains('is-visible') && section.querySelector('.project-experience')?.dataset.state !== 'complete';
  }
  function loadAtlas() {
    if (atlasStarted || !enabled()) return;
    atlasStarted = true;
    atlas.src = canvas.dataset.sprite;
  }
  function clear() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0; effects = [];
    ctx.clearRect(0, 0, width, height);
  }
  function resize() {
    if (!desktop.matches) { clear(); return; }
    const bounds = surface.getBoundingClientRect();
    const nextWidth = Math.round(bounds.width - 2), nextHeight = Math.round(bounds.height - 2);
    if (nextWidth === width && nextHeight === height) return;
    clear(); width = nextWidth; height = nextHeight;
    ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function fire(video, shot) {
    if (!enabled()) return;
    resize(); loadAtlas();
    const origin = canvas.getBoundingClientRect();
    const media = video.getBoundingClientRect();
    const target = button.getBoundingClientRect();
    const scale = Math.min(media.width / 736, media.height / 512);
    const x = media.left - origin.left + (media.width - 736 * scale) / 2 + shot.x * scale;
    const y = media.top - origin.top + (media.height - 512 * scale) / 2 + shot.y * scale;
    const {tx,ty} = impactPoint(target, origin);
    effects.push({x,y,tx,ty,born:performance.now()});
    if (!raf) raf = requestAnimationFrame(draw);
  }
  function draw(now) {
    raf = 0;
    if (!enabled()) { clear(); return; }
    ctx.clearRect(0, 0, width, height);
    effects = effects.filter(effect => (now - effect.born) / 1000 < flight + impactDuration);
    for (const effect of effects) {
      const age = (now - effect.born) / 1000;
      if (age < flight) {
        const p = Math.max(0, age / flight), tail = Math.max(0, p - .13);
        const hx = effect.x + (effect.tx - effect.x) * p;
        const hy = effect.y + (effect.ty - effect.y) * p;
        const bx = effect.x + (effect.tx - effect.x) * tail;
        const by = effect.y + (effect.ty - effect.y) * tail;
        const gradient = ctx.createLinearGradient(bx, by, hx, hy);
        gradient.addColorStop(0, '#ad60ff00'); gradient.addColorStop(.65, '#b86cff'); gradient.addColorStop(1, '#f8e7ff');
        ctx.save(); ctx.strokeStyle = gradient; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.shadowColor = '#a04cff'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(hx, hy); ctx.stroke(); ctx.restore();
      } else if (atlas.complete && atlas.naturalWidth) {
        const frame = Math.min(54, Math.floor((age - flight) * 42));
        const size = 92;
        ctx.save();
        ctx.globalAlpha = Math.min(1, (55 - frame) / 7);
        ctx.drawImage(atlas, frame % 8 * 128, Math.floor(frame / 8) * 128, 128, 128,
          effect.tx - size / 2, effect.ty - size / 2, size, size);
        ctx.restore();
      }
    }
    if (effects.length) raf = requestAnimationFrame(draw);
  }
  function stop(video) {
    const clock = clocks.get(video);
    if (clock.id) {
      if (video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(clock.id);
      else cancelAnimationFrame(clock.id);
    }
    clock.id = 0;
    if (!enabled()) clear();
  }
  function queue(video) {
    const clock = clocks.get(video);
    if (clock.id || video.paused || video.ended || !enabled()) return;
    const sample = (_now, metadata) => {
      clock.id = 0;
      if (video.paused || video.ended || !enabled()) { if (!enabled()) clear(); return; }
      const time = metadata?.mediaTime ?? video.currentTime;
      if (time < clock.previous) clock.previous = -.001;
      const markers = shots[video.classList.contains('contact-robot-intro') ? 'intro' : 'loop'];
      for (const shot of markers) {
        if (shot.time > clock.previous && shot.time <= time && time - shot.time < .18) fire(video, shot);
      }
      clock.previous = time; queue(video);
    };
    clock.id = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(sample) : requestAnimationFrame(sample);
  }
  for (const video of videos) {
    video.addEventListener('playing', () => { loadAtlas(); queue(video); });
    video.addEventListener('pause', () => stop(video));
    video.addEventListener('ended', () => stop(video));
    video.addEventListener('seeking', () => { clocks.get(video).previous = video.currentTime - .001; });
    if (!video.paused) queue(video);
  }
  new ResizeObserver(resize).observe(surface);
  for (const media of [desktop, reduced]) media.addEventListener('change', () => {
    if (!enabled()) { clear(); videos.forEach(stop); }
    else { resize(); videos.forEach(queue); }
  });
  document.addEventListener('visibilitychange', () => { if (!enabled()) clear(); });
  document.addEventListener('project:submitted', event => { if (event.detail?.form?.closest('#contacts')) clear(); });
  window.addEventListener('pagehide', clear);
})();
