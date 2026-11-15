(() => {
  const laptop = document.querySelector('.landing-page .dev-hero-art');
  const screen = laptop?.querySelector('.laptop-screen');
  const scroller = screen?.matches('[data-laptop-scroll]') ? screen : screen?.querySelector('[data-laptop-scroll]');
  if (!scroller || !('IntersectionObserver' in window)) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const resumeDelay = 3000;
  const topHold = Number(scroller.dataset.laptopTopHold) || 1400;
  let visible = false;
  let hovered = false;
  let touching = false;
  let keyboard = false;
  let frame = 0;
  let timer = 0;
  let resumeAt = 0;
  let holdUntil = 0;
  let previousTime = 0;
  let movementStart = 0;
  let maxScroll = 0;
  let position = 0;
  let direction = 1;
  let lastScrollTop = scroller.scrollTop;
  let started = false;

  function holdAtEdge(now) {
    const atTop = direction === 1;
    holdUntil = now + (atTop ? topHold : 1400);
    scroller.classList.toggle('is-laptop-opening', atTop);
  }

  function tick(now) {
    const delta = previousTime ? Math.min(now - previousTime, 50) : 0;
    previousTime = now;
    const speed = Math.min(165, Math.max(45, maxScroll / 9));
    const acceleration = Math.min(1, (now - movementStart) / 320);
    position = Math.max(0, Math.min(maxScroll, position + direction * speed * acceleration * delta / 1000));

    scroller.scrollTo({ top: position, behavior: 'instant' });
    lastScrollTop = scroller.scrollTop;

    if ((direction === 1 && position >= maxScroll) || (direction === -1 && position <= 0)) {
      direction *= -1;
      holdAtEdge(now);
      updatePlayback();
    } else {
      frame = requestAnimationFrame(tick);
    }
  }

  function updatePlayback() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    frame = timer = previousTime = 0;

    const onScreen = visible && !document.hidden && !reducedMotion.matches;
    laptop.classList.toggle('is-laptop-visible', onScreen);
    if (!onScreen || !maxScroll) return;

    position = scroller.scrollTop;
    if (position <= 0) direction = 1;
    if (position >= maxScroll) direction = -1;

    const now = performance.now();
    if (!started) {
      started = true;
      if (position <= 0) holdAtEdge(now);
    }

    if (hovered || touching || keyboard) return;

    const wait = Math.max(resumeAt, holdUntil) - now;
    if (wait > 1) {
      timer = setTimeout(updatePlayback, wait);
      return;
    }

    scroller.classList.remove('is-laptop-opening');
    movementStart = now;
    frame = requestAnimationFrame(tick);
  }

  function resumeLater() {
    resumeAt = performance.now() + resumeDelay;
    holdUntil = Math.min(holdUntil, resumeAt);
    updatePlayback();
  }

  function measure() {
    maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    updatePlayback();
  }

  screen.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    updatePlayback();
  });
  screen.addEventListener('pointerleave', event => {
    if (event.pointerType === 'touch') return;
    hovered = false;
    resumeLater();
  });
  screen.addEventListener('pointerdown', () => { keyboard = false; });
  screen.addEventListener('wheel', resumeLater, { passive: true });
  screen.addEventListener('touchstart', () => {
    touching = true;
    updatePlayback();
  }, { passive: true });
  function releaseTouch(event) {
    touching = event.touches.length > 0;
    resumeLater();
  }
  screen.addEventListener('touchend', releaseTouch, { passive: true });
  screen.addEventListener('touchcancel', releaseTouch, { passive: true });

  screen.addEventListener('focusin', event => {
    if (hovered || touching || !event.target.matches(':focus-visible')) return;
    keyboard = true;
    updatePlayback();
  });
  screen.addEventListener('keydown', () => {
    keyboard = true;
    updatePlayback();
  });
  screen.addEventListener('focusout', event => {
    if (!keyboard || screen.contains(event.relatedTarget)) return;
    keyboard = false;
    resumeLater();
  });

  scroller.addEventListener('scroll', () => {
    // Native wheel, touch and keyboard scrolling all take priority over the animation.
    if (scroller.scrollTop === lastScrollTop) return;
    lastScrollTop = scroller.scrollTop;
    holdUntil = 0;
    scroller.classList.remove('is-laptop-opening');
    resumeLater();
  }, { passive: true });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updatePlayback();
  }).observe(screen);
  if ('ResizeObserver' in window) {
    const sizeObserver = new ResizeObserver(measure);
    sizeObserver.observe(scroller);
    for (const child of scroller.children) sizeObserver.observe(child);
  }
  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  measure();
})();

(() => {
  const art = document.querySelector('.landing-benefit-art');
  const scene = art?.querySelector('.landing-benefit-scene');
  if (!scene || !('IntersectionObserver' in window)) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;

  function updateMotion() {
    const playing = visible && !document.hidden && !reducedMotion.matches;
    art.classList.toggle('is-playing', playing);
    if (playing) scene.unpauseAnimations();
    else scene.pauseAnimations();
  }

  updateMotion();
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateMotion();
  }).observe(art);
  document.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);
})();
