(() => {
  const screen = document.querySelector('.hoodwars-screen');
  if (!screen) return;

  const deck = screen.querySelector('.hoodwars-deck');
  const sections = [...deck.querySelectorAll('[data-hoodwars-section]')];
  const navigation = screen.querySelector('.hoodwars-bar nav');
  const tabs = [...navigation.querySelectorAll('[data-hoodwars-go]')];
  const admission = deck.querySelector('.hoodwars-admission');
  const admissionContent = admission.querySelector('.hoodwars-admission-content');
  const form = admission.querySelector('.hoodwars-form');
  const name = form.querySelector('input');
  const error = form.querySelector('[role="alert"]');
  const letter = admission.querySelector('.hoodwars-parchment');
  const letterTitle = letter.querySelector('h3');
  const recipient = letter.querySelector('[data-hoodwars-recipient]');
  let current = 'home';

  function scrollToSection(section) {
    // Only scroll the screen inside the laptop, not the surrounding page.
    deck.scrollTo({ top: section.offsetTop });
  }

  function syncNavigation() {
    const middle = deck.scrollTop + deck.clientHeight * .4;
    const active = sections.findLast(section => section.offsetTop <= middle) ?? sections[0];
    const key = active.dataset.hoodwarsSection;
    if (key === current) return;
    current = key;
    for (const tab of tabs) {
      if (tab.dataset.hoodwarsGo === key) tab.setAttribute('aria-current', 'location');
      else tab.removeAttribute('aria-current');
    }
  }

  function clearError() {
    error.hidden = true;
    name.removeAttribute('aria-invalid');
  }

  screen.addEventListener('click', event => {
    if (event.target.closest('[data-hoodwars-reset]')) {
      form.reset();
      clearError();
      letter.hidden = true;
      admissionContent.hidden = false;
      recipient.textContent = '';
      name.focus({ preventScroll: true });
      scrollToSection(admission);
      return;
    }

    const button = event.target.closest('[data-hoodwars-go]');
    if (!button) return;
    const section = sections.find(item => item.dataset.hoodwarsSection === button.dataset.hoodwarsGo);
    if (!section) return;
    if (deck.contains(button)) section.querySelector('h2').focus({ preventScroll: true });
    scrollToSection(section);
  });

  deck.addEventListener('scroll', syncNavigation, { passive: true });
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
    admissionContent.hidden = true;
    letter.hidden = false;
    letterTitle.focus({ preventScroll: true });
    scrollToSection(admission);
  });
  syncNavigation();
})();
