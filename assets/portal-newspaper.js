(() => {
  const art = document.querySelector('.portal-newspaper-art');
  if (!art) return;

  const status = art.querySelector('.portal-newspaper-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 8450;
  const parts = [
    { node: art.querySelector('[data-newspaper-headline]'), start: 450, duration: 3700 },
    { node: art.querySelector('[data-newspaper-article]'), start: 4450, duration: 4000 },
  ];
  let elapsed = 0;
  let visible = false;
  let started = false;
  let finished = false;
  let frame = 0;
  let previousTime = 0;

  for (const part of parts) {
    const fragment = document.createDocumentFragment();
    part.letters = [];
    part.count = 0;
    part.cursor = null;
    // Keep complete words in the layout from the beginning so they never jump lines.
    for (const token of part.node.textContent.split(/(\s+)/)) {
      if (!token) continue;
      if (/^\s+$/.test(token)) {
        fragment.append(document.createTextNode(token));
        continue;
      }
      const word = document.createElement('span');
      word.className = 'portal-newspaper-word';
      for (const character of token) {
        const letter = document.createElement('span');
        letter.className = 'portal-newspaper-letter';
        letter.textContent = character;
        word.append(letter);
        part.letters.push(letter);
      }
      fragment.append(word);
    }
    part.node.replaceChildren(fragment);
  }
  art.dataset.newspaperState = 'waiting';

  function render() {
    for (const part of parts) {
      const progress = Math.max(0, Math.min(1, (elapsed - part.start) / part.duration));
      const count = Math.floor(progress * part.letters.length);
      for (let index = part.count; index < count; index++) {
        part.letters[index].classList.add('is-visible');
      }
      part.count = count;
      const cursor = progress > 0 && progress < 1 && count > 0 ? part.letters[count - 1] : null;
      if (cursor !== part.cursor) {
        part.cursor?.classList.remove('is-cursor');
        cursor?.classList.add('is-cursor');
        part.cursor = cursor;
      }
    }
    finished = elapsed >= duration;
    const label = finished ? 'Выпуск готов' : started ? 'В печати' : 'Свежий выпуск';
    if (status.textContent !== label) status.textContent = label;
    art.dataset.newspaperState = finished ? 'complete' : started ? 'printing' : 'waiting';
  }

  function tick(now) {
    if (previousTime) elapsed = Math.min(duration, elapsed + Math.min(now - previousTime, 80));
    previousTime = now;
    render();
    if (finished) {
      frame = previousTime = 0;
    } else {
      frame = requestAnimationFrame(tick);
    }
  }

  function syncPlayback() {
    const playing = visible && !document.hidden && !motion.matches;
    art.classList.toggle('is-playing', playing);
    if (motion.matches) {
      elapsed = duration;
      render();
    }
    if (!playing || finished) {
      cancelAnimationFrame(frame);
      frame = previousTime = 0;
    } else if (!frame) {
      started = true;
      render();
      frame = requestAnimationFrame(tick);
    }
  }

  render();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .55;
      syncPlayback();
    }, { threshold: [0, .55] }).observe(art);
  } else {
    elapsed = duration;
    render();
  }
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', syncPlayback);
})();
