(() => {
  const screen = document.querySelector('.ramen-screen');
  const page = screen?.querySelector('.ramen-page');
  const laptop = screen?.closest('.dev-hero-art');
  if (!page || !laptop) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;

  function measure() {
    const distance = Math.max(0, page.offsetHeight - screen.clientHeight);
    screen.style.setProperty('--ramen-travel', -distance + 'px');
  }

  function updateMotion() {
    laptop.classList.toggle('is-laptop-visible', visible && !document.hidden && !reducedMotion.matches);
  }

  measure();
  new ResizeObserver(measure).observe(page);
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
