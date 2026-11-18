(() => {
  const demo = document.querySelector('.tilda-demo');
  if (!demo) return;

  const art = demo.closest('.tilda-demo-art');
  const cursor = demo.querySelector('.td-cursor');
  const track = demo.querySelector('.td-live-track');
  const liveWindow = track.parentElement;
  const targets = new Map([...demo.querySelectorAll('[data-td-target]')].map(node => [node.dataset.tdTarget, node]));
  const field = name => demo.querySelector('[data-td-' + name + ']');
  const updateTitles = title => demo.querySelectorAll('[data-td-title]').forEach(node => { node.textContent = title; });
  const draftTitle = 'Рыбный портал';
  const finalTitle = 'Речной атлас';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const loopDuration = 24900;
  const smooth = progress => progress ** 2 * (3 - 2 * progress);

  let time = 0;
  let eventIndex = 0;
  let lastFrame = 0;
  let frame = 0;
  let visible = false;
  let hovered = null;
  let movement = null;
  let typing = null;
  let scrolling = null;
  let press = null;
  let position = { x: 515, y: 377 };

  function setHover(node) {
    hovered?.classList.remove('is-hovered');
    hovered = node;
    hovered?.classList.add('is-hovered');
  }

  function showScene(name) {
    demo.dataset.scene = name;
    demo.classList.remove('has-cursor');
    setHover(null);
  }

  function setCursor(point) {
    position = point;
    cursor.style.transform = 'translate3d(' + point.x + 'px,' + point.y + 'px,0)';
  }

  function moveTo(name, duration) {
    const target = targets.get(name);
    // Offsets are measured before the laptop's perspective transform.
    let x = target.offsetWidth * .46;
    let y = target.offsetHeight * .5;
    for (let node = target; node && node !== demo; node = node.offsetParent) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }
    demo.classList.add('has-cursor');
    setHover(null);
    movement = { from: position, to: { x, y }, start: time, duration, target };
  }

  function releasePress() {
    if (!press) return;
    press.target.classList.remove('is-pressed');
    press.pulse.remove();
    press = null;
  }

  function click(name) {
    const target = targets.get(name);
    releasePress();
    const pulse = document.createElement('span');
    pulse.className = 'td-pulse';
    cursor.append(pulse);
    target.classList.add('is-pressed');
    press = { target, pulse, start: time };
  }

  function type(name, value, duration) {
    const node = field(name);
    node.textContent = '';
    node.parentElement.classList.add('is-typing');
    typing = { node, value, start: time, duration, length: 0 };
  }

  function reset(ready = false) {
    eventIndex = time = 0;
    movement = scrolling = null;
    typing?.node.parentElement.classList.remove('is-typing');
    typing = null;
    releasePress();
    demo.classList.remove('is-editing', 'is-publishing', 'is-published', 'is-ending');
    field('email').textContent = '';
    field('password').textContent = '';
    field('edit-title').textContent = draftTitle;
    field('saved').textContent = 'Черновик';
    field('publish-title').textContent = 'Публикуем страницу';
    field('publish-symbol').textContent = '↑';
    track.style.transform = '';
    setCursor({ x: 515, y: 377 });
    updateTitles(ready ? finalTitle : draftTitle);
    showScene(ready ? 'live' : 'login');
  }

  const timeline = [
    [420, () => moveTo('email', 570)],
    [1040, () => click('email')],
    [1130, () => type('email', 'admin@admin.ru', 970)],
    [2200, () => moveTo('password', 420)],
    [2690, () => click('password')],
    [2780, () => type('password', '••••••••', 570)],
    [3420, () => moveTo('signin', 490)],
    [3980, () => click('signin')],
    [4450, () => showScene('projects')],
    [4910, () => moveTo('project', 660)],
    [5700, () => click('project')],
    [6200, () => showScene('pages')],
    [6590, () => moveTo('page', 540)],
    [7270, () => click('page')],
    [7770, () => showScene('editor')],
    [8220, () => moveTo('block', 590)],
    [8930, () => click('block')],
    [9270, () => demo.classList.add('is-editing')],
    [9780, () => moveTo('title', 490)],
    [10380, () => click('title')],
    [10500, () => type('edit-title', finalTitle, 1190)],
    [11860, () => moveTo('save', 510)],
    [12500, () => click('save')],
    [12990, () => {
      demo.classList.remove('is-editing');
      setHover(null);
      updateTitles(finalTitle);
      field('saved').textContent = 'Сохранено';
    }],
    [13540, () => moveTo('publish', 640)],
    [14300, () => click('publish')],
    [14790, () => {
      demo.classList.add('is-publishing');
      setHover(null);
    }],
    [16280, () => {
      demo.classList.replace('is-publishing', 'is-published');
      field('publish-title').textContent = 'Сайт опубликован';
      field('publish-symbol').textContent = '✓';
    }],
    [16680, () => moveTo('open', 580)],
    [17410, () => click('open')],
    [17910, () => showScene('live')],
    [19700, () => {
      scrolling = { start: time, distance: track.offsetHeight - liveWindow.clientHeight, duration: 3550 };
    }],
    [24400, () => demo.classList.add('is-ending')],
  ];

  function animate() {
    if (movement) {
      const progress = Math.min(1, (time - movement.start) / movement.duration);
      const ratio = smooth(progress);
      const { from, to } = movement;
      setCursor({
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio - 13 * Math.sin(Math.PI * ratio),
      });
      if (progress === 1) {
        setHover(movement.target);
        movement = null;
      }
    }

    if (press) {
      const elapsed = time - press.start;
      if (elapsed > 155) press.target.classList.remove('is-pressed');
      if (elapsed > 470) releasePress();
    }

    if (typing) {
      const progress = Math.min(1, (time - typing.start) / typing.duration);
      const length = Math.floor(progress * typing.value.length);
      if (length !== typing.length) {
        typing.node.textContent = typing.value.slice(0, length);
        typing.length = length;
      }
      if (progress === 1) {
        typing.node.parentElement.classList.remove('is-typing');
        typing = null;
      }
    }

    if (scrolling) {
      const progress = Math.min(1, (time - scrolling.start) / scrolling.duration);
      track.style.transform = 'translateY(' + (-scrolling.distance * smooth(progress)) + 'px)';
      if (progress === 1) scrolling = null;
    }
  }

  function tick(now) {
    if (lastFrame) time += Math.min(now - lastFrame, 64);
    lastFrame = now;
    if (time >= loopDuration) reset();
    while (eventIndex < timeline.length && timeline[eventIndex][0] <= time) {
      timeline[eventIndex++][1]();
    }
    animate();
    frame = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    const play = visible && !document.hidden && !reducedMotion.matches;
    art.classList.toggle('is-laptop-visible', play);
    if (!play) {
      cancelAnimationFrame(frame);
      frame = lastFrame = 0;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  reset(reducedMotion.matches);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .12 }).observe(art);
  } else {
    visible = true;
    syncPlayback();
  }
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', () => {
    reset(reducedMotion.matches);
    syncPlayback();
  });
})();
