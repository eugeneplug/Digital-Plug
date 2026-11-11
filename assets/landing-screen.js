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
