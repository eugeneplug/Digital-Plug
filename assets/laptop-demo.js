export function playLaptopDemo(demo, { targetAttribute, duration, resetContent, buildTimeline }) {
  const art = demo.closest('.dev-hero-art');
  const cursor = demo.querySelector('.laptop-demo-cursor');
  const targets = new Map([...demo.querySelectorAll('[' + targetAttribute + ']')]
    .map(node => [node.getAttribute(targetAttribute), node]));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const startPoint = { x: 515, y: 377 };
  const ease = progress => progress ** 2 * (3 - 2 * progress);

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
  let position = startPoint;

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

  function moveTo(name, travelTime) {
    const target = targets.get(name);
    // Offset coordinates are local to the screen before the perspective transform.
    let x = target.offsetWidth * .46;
    let y = target.offsetHeight * .5;
    for (let node = target; node && node !== demo; node = node.offsetParent) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }
    demo.classList.add('has-cursor');
    setHover(null);
    movement = { from: position, to: { x, y }, start: time, duration: travelTime, target };
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
    pulse.className = 'laptop-demo-pulse';
    cursor.append(pulse);
    target.classList.add('is-pressed');
    press = { target, pulse, start: time };
  }

  function type(node, value, typingTime) {
    typing?.node.parentElement.classList.remove('is-typing');
    node.textContent = '';
    node.parentElement.classList.add('is-typing');
    typing = { node, value, start: time, duration: typingTime, length: 0 };
  }

  function scroll(track, scrollTime) {
    scrolling = { track, distance: track.offsetHeight - track.parentElement.clientHeight, start: time, duration: scrollTime };
  }

  function reset(ready = false) {
    eventIndex = time = 0;
    movement = scrolling = null;
    typing?.node.parentElement.classList.remove('is-typing');
    typing = null;
    releasePress();
    setCursor(startPoint);
    showScene(resetContent(ready));
  }

  const timeline = buildTimeline({ showScene, moveTo, click, type, scroll, clearHover: () => setHover(null) });
  const progressOf = effect => Math.min(1, (time - effect.start) / effect.duration);

  function animate() {
    if (movement) {
      const progress = progressOf(movement);
      const ratio = ease(progress);
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
      if (elapsed > 470) releasePress();
      else if (elapsed > 155) press.target.classList.remove('is-pressed');
    }

    if (typing) {
      const progress = progressOf(typing);
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
      const progress = progressOf(scrolling);
      scrolling.track.style.transform = 'translateY(' + (-scrolling.distance * ease(progress)) + 'px)';
      if (progress === 1) scrolling = null;
    }
  }

  function tick(now) {
    if (lastFrame) time += Math.min(now - lastFrame, 64);
    lastFrame = now;
    if (time >= duration) reset();
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
}
