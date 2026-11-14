(() => {
  const laptop = document.querySelector('.landing-page .dev-hero-art');
  if (!laptop || !('IntersectionObserver' in window)) return;

  const screen = laptop.querySelector('.ramen-screen');
  const page = screen?.querySelector('.ramen-page');
  if (page) {
    const measure = () => {
      const distance = Math.max(0, page.offsetHeight - screen.clientHeight);
      screen.style.setProperty('--ramen-travel', -distance + 'px');
    };
    measure();
    new ResizeObserver(measure).observe(page);
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;

  function updateMotion() {
    laptop.classList.toggle('is-laptop-visible', visible && !document.hidden && !reducedMotion.matches);
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateMotion();
  }).observe(laptop);
  document.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);
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
