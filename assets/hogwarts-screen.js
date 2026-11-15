(() => {
  const screen = document.querySelector('.hogwarts-screen');
  if (!screen) return;

  const views = [...screen.querySelectorAll('[data-hogwarts-view]')];
  const tabs = [...screen.querySelectorAll('.hogwarts-bar [aria-pressed]')];
  const form = screen.querySelector('.hogwarts-form');
  const name = form.querySelector('input');
  const error = form.querySelector('[role="alert"]');
  const recipient = screen.querySelector('[data-hogwarts-recipient]');

  function show(viewName, moveFocus = false) {
    const view = views.find(element => element.dataset.hogwartsView === viewName);
    if (!view) return;
    for (const candidate of views) candidate.hidden = candidate !== view;
    for (const tab of tabs) {
      const tabName = viewName === 'letter' ? 'admission' : viewName;
      tab.setAttribute('aria-pressed', String(tab.dataset.hogwartsGo === tabName));
    }
    view.scrollTop = 0;
    if (moveFocus) view.querySelector('h2').focus({ preventScroll: true });
  }

  screen.addEventListener('click', event => {
    const button = event.target.closest('[data-hogwarts-go]');
    if (!button) return;
    if (button.hasAttribute('data-hogwarts-reset')) {
      form.reset();
      clearError();
    }
    show(button.dataset.hogwartsGo, !button.closest('.hogwarts-bar'));
  });

  function clearError() {
    error.hidden = true;
    name.removeAttribute('aria-invalid');
  }

  name.addEventListener('input', clearError);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const writtenName = name.value.trim();
    if (!writtenName) {
      error.hidden = false;
      name.setAttribute('aria-invalid', 'true');
      name.focus({ preventScroll: true });
      return;
    }
    clearError();
    recipient.textContent = writtenName;
    show('letter', true);
  });
})();
