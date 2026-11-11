(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const tolerance = 1;

  for (const carousel of document.querySelectorAll('[data-dev-carousel]')) {
    const track = carousel.querySelector('[data-dev-track]');
    const previous = carousel.querySelector('[data-dev-prev]');
    const next = carousel.querySelector('[data-dev-next]');
    if (!track?.children.length || !previous || !next) continue;

    const cards = Array.from(track.children);
    let stops = [0];
    let destination = null;
    let settleTimer;

    function updateButtons() {
      previous.disabled = track.scrollLeft <= tolerance;
      next.disabled = track.scrollLeft >= stops.at(-1) - tolerance;
    }

    function measure() {
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const padding = getComputedStyle(track).scrollPaddingLeft;
      const paddingValue = parseFloat(padding) || 0;
      const scrollInset = padding.endsWith('%') ? paddingValue * track.clientWidth / 100 : paddingValue;
      const origin = track.getBoundingClientRect().left + track.clientLeft + scrollInset - track.scrollLeft;
      stops = [0];
      for (const card of cards) {
        const stop = Math.min(max, card.getBoundingClientRect().left - origin);
        if (stop - stops.at(-1) > tolerance) stops.push(stop);
      }
      if (max - stops.at(-1) > tolerance) stops.push(max);
      destination = null;
      updateButtons();
    }

    function scheduleDestinationReset() {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        destination = null;
      }, 150);
    }

    function goTo(index) {
      if (index < 0 || index >= stops.length) return;
      destination = index;
      track.scrollTo({ left: stops[index], behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      scheduleDestinationReset();
    }

    function move(direction) {
      if (destination !== null) {
        goTo(destination + direction);
      } else if (direction > 0) {
        goTo(stops.findIndex(stop => stop > track.scrollLeft + tolerance));
      } else {
        goTo(stops.findLastIndex(stop => stop < track.scrollLeft - tolerance));
      }
    }

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', () => {
      updateButtons();
      scheduleDestinationReset();
    }, { passive: true });
    track.addEventListener('pointerdown', () => { destination = null; });
    track.addEventListener('wheel', () => { destination = null; }, { passive: true });
    track.addEventListener('keydown', event => {
      if (event.target !== track || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      switch (event.key) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'Home': goTo(0); break;
        case 'End': goTo(stops.length - 1); break;
        default: return;
      }
      event.preventDefault();
    });

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    cards.forEach(card => observer.observe(card));
    measure();
    carousel.setAttribute('data-dev-ready', '');
  }
})();

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active;

  function dismissOutside(event) {
    if (active && !active.element.contains(event.target)) active.close();
  }

  document.addEventListener('pointerdown', dismissOutside);
  document.addEventListener('focusin', dismissOutside);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') active?.close();
  });

  for (const element of document.querySelectorAll('[data-offer-info]')) {
    const button = element.querySelector('.dev-info-button');
    const popover = element.querySelector('.dev-info-popover');
    const typed = popover.querySelector('.dev-info-typed');
    const description = popover.querySelector('.dev-info-full').textContent;
    let pinned = false;
    let frame;

    function finishTyping() {
      cancelAnimationFrame(frame);
      popover.classList.remove('is-typing');
      typed.textContent = '';
    }

    function close() {
      finishTyping();
      button.setAttribute('aria-expanded', 'false');
      popover.hidden = true;
      pinned = false;
      active = undefined;
    }

    function open() {
      if (!popover.hidden) return;
      active?.close();
      active = { element, close };
      button.setAttribute('aria-expanded', 'true');
      popover.hidden = false;
      if (reducedMotion.matches) return;

      const start = performance.now();
      const duration = Math.min(750, description.length * 5);
      popover.classList.add('is-typing');
      function type(now) {
        if (now - start >= duration || reducedMotion.matches) {
          finishTyping();
          return;
        }
        typed.textContent = description.slice(0, Math.floor((now - start) / duration * description.length));
        frame = requestAnimationFrame(type);
      }
      frame = requestAnimationFrame(type);
    }

    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') open();
    });
    element.addEventListener('pointerleave', () => {
      if (!pinned && !popover.hidden) close();
    });
    button.addEventListener('click', () => {
      if (pinned) {
        close();
      } else {
        open();
        pinned = true;
      }
    });
  }
})();
(() => {
  const art = document.querySelector('.dev-hero-art');
  const rows = [...(art?.querySelectorAll('[data-dev-code-line]') ?? [])];
  if (!rows.length) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const code = [
    'const studio = {',
    '  name: "DigitalPlug",',
    '  build: "web experiences"',
    '};',
    '',
    'async function launch(project) {',
    '  const ui = await design(project);',
    '  const site = await build(ui);',
    '  await test(site);',
    '  return publish(site);',
    '}',
    '',
    'const project = {',
    '  theme: "digital-blue",',
    '  responsive: true,',
    '  accessible: true',
    '};',
    '',
    'launch(project).then(console.log);',
    '',
  ];
  const colors = ['#174caa', '#152c57', '#196078'];
  const screen = rows.map(row => row.textContent);
  let line = 4;
  let cursor = 0;
  let row = 4;
  let visible = false;
  let timer;

  function draw() {
    for (const [index, element] of rows.entries()) {
      element.textContent = screen[index] + (index === row ? '▌' : '');
      const value = screen[index];
      element.setAttribute('fill', colors[value.includes('"') ? 2 : value.startsWith('  ') ? 1 : 0]);
    }
  }

  function type() {
    const value = code[line];
    if (cursor > value.length) {
      line = (line + 1) % code.length;
      cursor = 0;
      if (row === rows.length - 1) {
        screen.shift();
        screen.push('');
      } else {
        row += 1;
      }
    }
    const current = code[line];
    screen[row] = current.slice(0, cursor);
    draw();
    const complete = cursor === current.length;
    cursor += 1;
    timer = setTimeout(type, complete ? 155 : 27);
  }

  function updateMotion() {
    clearTimeout(timer);
    const running = visible && !document.hidden && !reducedMotion.matches;
    art.classList.toggle('is-laptop-visible', running);
    if (running) timer = setTimeout(type, 120);
    else rows[row].textContent = screen[row];
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateMotion();
  });
  observer.observe(art);
  document.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);
})();

(() => {
  const scene = document.querySelector('.dev-runners');
  const video = scene?.querySelector('video');
  if (!video) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;

  function updatePlayback() {
    const running = visible && !document.hidden && !reducedMotion.matches;
    scene.classList.toggle('is-running', running);
    if (running) {
      video.play().catch(() => scene.classList.remove('is-running'));
    } else {
      video.pause();
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updatePlayback();
  }).observe(scene);
  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
})();

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  for (const details of document.querySelectorAll('.dev-faq details')) {
    const summary = details.querySelector('summary');
    if (!summary || !details.animate) continue;

    let animation;
    let expanding = false;

    summary.addEventListener('click', event => {
      event.preventDefault();
      const expand = !(animation ? expanding : details.open);
      const startHeight = details.getBoundingClientRect().height;
      animation?.cancel();
      animation = undefined;

      if (reducedMotion.matches) {
        details.open = expand;
        return;
      }

      details.open = true;
      expanding = expand;
      const styles = getComputedStyle(details);
      const borderHeight = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
      const endHeight = expand ? details.getBoundingClientRect().height
        : summary.getBoundingClientRect().height + borderHeight;

      animation = details.animate([
        { height: startHeight + 'px', overflow: 'hidden' },
        { height: endHeight + 'px', overflow: 'hidden' },
      ], { duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
      animation.onfinish = () => {
        details.open = expand;
        animation.cancel();
        animation = undefined;
      };
    });
  }
})();
