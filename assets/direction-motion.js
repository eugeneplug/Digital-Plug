(() => {
  const section = document.querySelector('#directions');
  if (!section) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = [...section.querySelectorAll('.direction-card')].map(card => {
    const body = card.querySelector('.direction-card-body');
    const shadow = document.createElement('span');
    shadow.className = 'direction-card-shadow';
    shadow.setAttribute('aria-hidden', 'true');
    body.prepend(shadow);
    return { card, body, shadow, image: card.querySelector('.direction-image'), turn: parseFloat(getComputedStyle(card).getPropertyValue('--hover-turn')) || 0, value: 0, velocity: 0, inside: false, hovered: false, timer: 0, painted: '' };
  });
  let visible = false;
  let frame = 0, previous = 0;
  const frequency = 5.6;
  const active = () => visible && !document.hidden && !motion.matches;
  function paint(state) {
    const value = Math.max(0, Math.min(1, state.value));
    const rounded = value.toFixed(5);
    if (rounded === state.painted) return;
    state.painted = rounded;
    state.body.style.transform = value === 0 ? '' : `translate3d(0,${(-5 * value).toFixed(5)}%,0)`;
    state.image.style.transform = value === 0 ? '' : `translate3d(0,${(-7 * value).toFixed(4)}px,0) rotate(${(state.turn * value).toFixed(4)}deg) scale(${(1 + .1 * value).toFixed(5)})`;
    state.shadow.style.opacity = rounded;
    state.card.classList.toggle('is-raised', value > .001);
  }
  function tick(now) {
    frame = 0;
    if (!active()) return;
    const dt = previous ? Math.min((now - previous) / 1000, .05) : 1 / 60;
    previous = now;
    let moving = false;
    cards.forEach(state => {
      const target = state.hovered || state.card.matches(':focus-visible') ? 1 : 0;
      // A critically damped response keeps position and velocity continuous
      // even when the pointer changes direction halfway through the lift.
      const error = state.value - target;
      const coefficient = state.velocity + frequency * error;
      const decay = Math.exp(-frequency * dt);
      state.value = target + (error + coefficient * dt) * decay;
      state.velocity = (state.velocity - frequency * coefficient * dt) * decay;
      const unsettled = Math.abs(state.value - target) > .0007 || Math.abs(state.velocity) > .003;
      if (!unsettled) { state.value = target; state.velocity = 0; }
      state.card.classList.toggle('is-moving', unsettled);
      moving ||= unsettled;
      paint(state);
    });
    if (moving) frame = requestAnimationFrame(tick);
    else previous = 0;
  }
  function wake() {
    if (active() && !frame) frame = requestAnimationFrame(tick);
  }
  function cancelIntent(state) {
    clearTimeout(state.timer);
    state.timer = 0;
  }
  function armHover(state) {
    cancelIntent(state);
    if (!active() || !finePointer.matches || !state.inside) return;
    const activate = () => {
      state.timer = 0;
      if (!active() || !state.inside || !finePointer.matches) return;
      state.hovered = true;
      wake();
    };
    // Ignore brief flyovers; revisiting a moving card responds immediately.
    if (state.value > .015) activate();
    else state.timer = setTimeout(activate, 75);
  }
  cards.forEach(state => {
    state.card.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      state.inside = true;
      armHover(state);
    });
    const leave = () => {
      cancelIntent(state);
      state.inside = state.hovered = false;
      wake();
    };
    state.card.addEventListener('pointerleave', leave);
    state.card.addEventListener('pointercancel', leave);
    state.card.addEventListener('focus', wake);
    state.card.addEventListener('blur', wake);
    state.card.addEventListener('pointerdown', wake);
  });
  function sync() {
    const playing = active();
    section.classList.toggle('is-motion-active', playing);
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previous = 0;
    cards.forEach(state => {
      cancelIntent(state);
      state.hovered = false;
      if (!playing) {
        state.value = state.velocity = 0;
        state.card.classList.remove('is-moving');
        paint(state);
      } else {
        state.inside = finePointer.matches && state.card.matches(':hover');
        armHover(state);
      }
    });
    if (playing) wake();
  }
  new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    sync();
  }, { threshold: 0.05 }).observe(section.querySelector('.directions-grid'));
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  finePointer.addEventListener('change', sync);
})();
