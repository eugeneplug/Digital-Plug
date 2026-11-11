(() => {
  const group = document.querySelector('.workflow-people');
  if (!group) return;
  const label = group.querySelector('.avatar-name');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = null, typing = 0, closing = 0, touch = 0;
  function cancelTimers() {
    clearTimeout(typing); clearTimeout(closing); clearTimeout(touch);
  }
  function hide() {
    cancelTimers(); active = null;
    group.classList.remove('is-name-visible');
  }
  function show(avatar) {
    clearTimeout(closing);
    if (active === avatar && group.classList.contains('is-name-visible')) return;
    clearTimeout(touch);
    clearTimeout(typing);
    active = avatar;
    const letters = [...avatar.dataset.avatarName];
    label.textContent = motion.matches ? letters.join('') : '';
    group.classList.add('is-name-visible');
    if (motion.matches) return;
    let index = 0;
    function type() {
      if (active !== avatar) return;
      label.textContent = letters.slice(0, ++index).join('');
      if (index < letters.length) typing = setTimeout(type, letters[index] === ' ' ? 28 : 44);
    }
    typing = setTimeout(type, 90);
  }
  group.querySelectorAll('[data-avatar-name]').forEach(avatar => {
    avatar.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') show(avatar);
    });
    avatar.addEventListener('pointerleave', event => {
      if (event.pointerType === 'touch' || avatar.matches(':focus-visible')) return;
      closing = setTimeout(hide, 90);
    });
    avatar.addEventListener('focus', () => show(avatar));
    avatar.addEventListener('blur', () => {
      if (active === avatar) closing = setTimeout(hide, 90);
    });
    avatar.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      show(avatar); touch = setTimeout(hide, 2800);
    });
    avatar.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  window.addEventListener('blur', hide);
  motion.addEventListener('change', () => {
    if (active) { clearTimeout(typing); label.textContent = active.dataset.avatarName; }
  });
})();
