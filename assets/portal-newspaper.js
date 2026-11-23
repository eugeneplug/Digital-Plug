(() => {
  const art = document.querySelector('.portal-newspaper-art');
  if (!art) return;

  const headline = art.querySelector('[data-newspaper-headline]');
  const article = art.querySelector('[data-newspaper-article]');
  const status = art.querySelector('.portal-newspaper-status');
  const headlineText = headline.textContent;
  const articleText = article.textContent;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 13400;
  const parts = [
    { node: headline, text: headlineText, start: 450, duration: 3700 },
    { node: article, text: articleText, start: 4450, duration: 4000 },
  ];
  let elapsed = 0;
  let visible = false;
  let frame = 0;
  let previousTime = 0;

  function render() {
    const finished = motion.matches || elapsed >= 8450;
    for (const part of parts) {
      const progress = motion.matches ? 1 : Math.max(0, Math.min(1, (elapsed - part.start) / part.duration));
      const content = part.text.slice(0, Math.floor(progress * part.text.length));
      if (part.node.textContent !== content) part.node.textContent = content;
      part.node.classList.toggle('is-typing', progress > 0 && progress < 1);
    }
    const label = finished ? 'Выпуск готов' : 'В печати';
    if (status.textContent !== label) status.textContent = label;
    art.classList.toggle('is-refreshing', !motion.matches && elapsed >= 12700);
  }

  function tick(now) {
    if (previousTime) elapsed = (elapsed + Math.min(now - previousTime, 80)) % duration;
    previousTime = now;
    render();
    frame = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    const playing = visible && !document.hidden && !motion.matches;
    art.classList.toggle('is-playing', playing);
    if (!playing) {
      cancelAnimationFrame(frame);
      frame = previousTime = 0;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  render();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .15 }).observe(art);
  } else {
    visible = true;
    syncPlayback();
  }
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', () => {
    render();
    syncPlayback();
  });
})();
