const motion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-current-year]').forEach(element=>{element.textContent=String(new Date().getFullYear());});
const dialog = document.querySelector('#info-panel');
const heart = document.querySelector('.heart-cursor');
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.heart-hover').forEach(button => {
    button.addEventListener('pointerenter', event => {
      heart.style.left = event.clientX + 'px';
      heart.style.top = event.clientY + 'px';
      if (!motion.matches) heart.classList.add('visible');
    });
    button.addEventListener('pointermove', event => {
      heart.style.left = event.clientX + 'px';
      heart.style.top = event.clientY + 'px';
    }, { passive: true });
    button.addEventListener('pointerleave', () => heart.classList.remove('visible', 'pressed'));
    button.addEventListener('pointerdown', () => heart.classList.add('pressed'));
    button.addEventListener('pointerup', () => heart.classList.remove('pressed'));
  });
}
const menu = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  menu.setAttribute('aria-label', expanded ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('is-open', expanded);
});

const panelTitle = document.querySelector('#panel-title');
const content = document.querySelector('#panel-content');
const panels = {
  cases: { title: 'Кейсы', html: '<p>Добавим на следующем этапе.</p>' },
  contacts: {
    title: 'Контакты',
    html: '<button class="form-button" data-panel="project" style="width:100%">Составить бриф</button>',
  },
  project: {
    title: 'Обсудить проект',
    html: `<div class="project-experience" data-state="idle"><form class="project-form">
        <div class="project-sentence">
          <div class="sentence-line">Меня зовут <label class="inline-field field-name"><span class="sr-only">Ваше имя</span><input name="name" autocomplete="name" placeholder="ваше имя" required maxlength="100"></label>.</div>
          <div class="sentence-line sentence-project">Мой проект - <label class="inline-field field-company"><span class="sr-only">Название проекта или компании (необязательно)</span><input name="company" autocomplete="organization" placeholder="название" maxlength="160"></label>.</div>
          <div class="sentence-line">Задача - <div class="inline-field field-service custom-select"><input type="hidden" name="service"><button class="service-trigger" type="button" role="combobox" aria-label="Услуга" aria-required="true" aria-haspopup="listbox" aria-expanded="false" aria-controls="service-options"><span class="service-value">выбрать услугу</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></button><div class="service-menu" id="service-options" role="listbox" aria-label="Услуга" aria-hidden="true" inert>${['Разработка сайта', 'SEO-продвижение', 'Сайт и SEO', 'Другая задача'].map((name, index) => `<button type="button" role="option" id="service-option-${index}" aria-selected="false" tabindex="-1" data-service="${name}"><span>${name}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg></button>`).join('')}</div></div>.</div>
          <div class="sentence-line">Для связи - <label class="inline-field field-contact"><span class="sr-only">Номер телефона</span><input type="tel" name="contact" autocomplete="tel" inputmode="tel" placeholder="номер телефона" required maxlength="18"></label>.</div>
        </div>
        <div class="project-details"><button class="details-toggle" type="button" aria-expanded="false" aria-controls="project-details-content"><span class="details-plus" aria-hidden="true">+</span> Добавить пару деталей</button><div class="details-reveal" id="project-details-content" aria-hidden="true" inert><div class="details-inner"><label><span class="sr-only">Расскажите о задаче (необязательно)</span><textarea name="brief" placeholder="Что хотите сделать? Сроки, ссылки, пожелания…" maxlength="3000"></textarea></label></div></div></div>
        <div class="project-footer"><button class="form-button project-submit" type="submit"><span>Отправить</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></button><label class="project-consent"><input class="sr-only" type="checkbox" name="consent" required><span class="consent-check" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m4 10 4 4 8-8"/></svg></span><span class="consent-copy">Согласен на обработку персональных данных в соответствии с <span class="consent-policy">политикой конфиденциальности</span>.</span></label></div>
        <p class="copy-status" role="status" hidden></p>
      </form><div class="project-success" aria-hidden="true" inert><h3 class="project-success-title" tabindex="-1">Спасибо<br>за заявку<span>!</span></h3><p class="project-success-copy">Мы свяжемся с вами,<br>чтобы обсудить детали проекта.</p></div></div>`,
  },
};
let panelCloseTimer;
let panelTrigger;
let serviceSelect;
const projectFormSelects=new WeakMap();
function activateServiceSelect(select){
  if(serviceSelect!==select)closeServiceSelect();
  serviceSelect=select;
}
function openPanel(key) {
  const panel = panels[key];
  if (!panel) return;
  closeServiceSelect();
  serviceSelect = null;
  clearTimeout(panelCloseTimer);
  if (!dialog.open) panelTrigger = document.activeElement;
  dialog.classList.remove('is-closing');
  dialog.classList.toggle('project-panel', key === 'project');
  panelTitle.textContent = panel.title;
  content.innerHTML = panel.html;
  if (key === 'project') initProjectForm();
  nav.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Открыть меню');
  heart.classList.remove('visible');
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}
function closePanel() {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;
  closeServiceSelect();
  dialog.classList.add('is-closing');
  panelCloseTimer = setTimeout(() => {
    dialog.close();
    dialog.classList.remove('is-closing');
    if (panelTrigger?.isConnected) panelTrigger.focus({ preventScroll: true });
  }, motion.matches ? 0 : 260);
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-panel]');
  if (!button) return;
  openPanel(button.dataset.panel);
  if(button.dataset.panel==='project'&&button.dataset.serviceRequest){
    const form=content.querySelector('.project-form');
    const select=projectFormSelects.get(form);
    if(!select)return;
    activateServiceSelect(select);
    const index=select.options.findIndex(option=>option.dataset.service===button.dataset.serviceRequest);
    if(index>=0)chooseService(index);
    if(button.dataset.serviceTopic&&(button.dataset.serviceRequest==='Другая задача'||button.hasAttribute('data-service-brief'))){
      form.elements.brief.value='Интересует: '+button.dataset.serviceTopic+'.';
      setProjectDetails(form,true);
    }
  }
});
document.querySelector('.panel-close').addEventListener('click', closePanel);
dialog.addEventListener('cancel', event => {
  event.preventDefault();
  if (serviceSelect?.open) {
    closeServiceSelect();
    return;
  }
  closePanel();
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePanel();
  }
});

function closeServiceSelect() {
  if (!serviceSelect) return;
  serviceSelect.open = false;
  serviceSelect.root.classList.remove('is-open');
  serviceSelect.button.setAttribute('aria-expanded', 'false');
  serviceSelect.button.removeAttribute('aria-activedescendant');
  serviceSelect.list.setAttribute('aria-hidden', 'true');
  serviceSelect.list.inert = true;
}
function highlightService(index) {
  const select = serviceSelect;
  select.activeIndex = (index + select.options.length) % select.options.length;
  select.options.forEach((option, i) => option.classList.toggle('is-highlighted', i === select.activeIndex));
  select.button.setAttribute('aria-activedescendant', select.options[select.activeIndex].id);
}
function openServiceSelect(index) {
  const select = serviceSelect;
  select.open = true;
  const bounds = select.button.getBoundingClientRect();
  const panelBounds = select.form.closest('.project-panel').getBoundingClientRect();
  const below = Math.min(innerHeight,panelBounds.bottom) - bounds.bottom - 16;
  const above = bounds.top - Math.max(0,panelBounds.top) - 16;
  const upwards = below < 240 && above > below;
  select.root.classList.toggle('opens-up', upwards);
  select.root.style.setProperty('--menu-max-height', Math.max(100, Math.min(260, upwards ? above : below)) + 'px');
  select.root.classList.add('is-open');
  select.button.setAttribute('aria-expanded', 'true');
  select.list.setAttribute('aria-hidden', 'false');
  select.list.inert = false;
  highlightService(index ?? Math.max(0, select.options.findIndex(option => option.dataset.service === select.value.value)));
}
function chooseService(index) {
  const select = serviceSelect;
  const option = select.options[index];
  select.value.value = option.dataset.service;
  select.root.querySelector('.service-value').textContent = option.dataset.service;
  select.options.forEach(item => item.setAttribute('aria-selected', String(item === option)));
  select.button.removeAttribute('aria-invalid');
  closeServiceSelect();
  if (option.dataset.service === 'Другая задача') setProjectDetails(select.form, true);
  select.button.focus({ preventScroll: true });
}
function setProjectDetails(form, expanded) {
  const details = form.querySelector('.project-details');
  const toggle = details.querySelector('.details-toggle');
  const reveal = details.querySelector('.details-reveal');
  toggle.setAttribute('aria-expanded', String(expanded));
  details.classList.toggle('is-expanded', expanded);
  reveal.setAttribute('aria-hidden', String(!expanded));
  reveal.inert = !expanded;
}
function initProjectForm(container=content) {
  const form=container.querySelector('.project-form');
  if(!form||projectFormSelects.has(form))return;
  const root = form.querySelector('.custom-select');
  const select = { form,root, button: root.querySelector('.service-trigger'), list: root.querySelector('[role="listbox"]'), options: [...root.querySelectorAll('[role="option"]')], value: root.querySelector('input'), open: false, activeIndex: 0 };
  projectFormSelects.set(form,select);
  select.validatePhone=initPhoneMask(form.elements.contact);
  for(const field of [form.elements.name]){
    field.addEventListener('input',()=>field.setCustomValidity(''));
    field.addEventListener('change',()=>field.setCustomValidity(field.value.trim()?'':'Заполните это поле.'));
  }
  select.button.addEventListener('click', () => {activateServiceSelect(select);select.open ? closeServiceSelect() : openServiceSelect();});
  select.options.forEach((option, index) => {
    option.addEventListener('click', () => {activateServiceSelect(select);chooseService(index);});
    option.addEventListener('pointerenter', () => { if (select.open) {activateServiceSelect(select);highlightService(index);} });
    option.addEventListener('pointerdown', event => event.preventDefault());
  });
  let search = '', searchTimer;
  select.button.addEventListener('keydown', event => {
    activateServiceSelect(select);
    const key = event.key;
    if (key === 'Escape' && select.open) {
      event.preventDefault();
      event.stopPropagation();
      closeServiceSelect();
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      if (!select.open) openServiceSelect(key === 'ArrowUp' || key === 'End' ? select.options.length - 1 : 0);
      else highlightService(key === 'Home' ? 0 : key === 'End' ? select.options.length - 1 : select.activeIndex + (key === 'ArrowDown' ? 1 : -1));
    } else if ((key === 'Enter' || key === ' ') && select.open) {
      event.preventDefault();
      chooseService(select.activeIndex);
    } else if (key === 'Tab') closeServiceSelect();
    else if (key.length === 1 && key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      clearTimeout(searchTimer);
      search += key.toLocaleLowerCase('ru');
      const index = select.options.findIndex(option => option.textContent.trim().toLocaleLowerCase('ru').startsWith(search));
      if (index >= 0) { if (!select.open) openServiceSelect(index); else highlightService(index); }
      searchTimer = setTimeout(() => { search = ''; }, 650);
    }
  });
  const details = form.querySelector('.project-details');
  const toggle = details.querySelector('.details-toggle');
  toggle.addEventListener('click', () => {
    setProjectDetails(form, toggle.getAttribute('aria-expanded') !== 'true');
  });
}
document.addEventListener('pointerdown', event => {
  if (serviceSelect?.open && !serviceSelect.root.contains(event.target)) closeServiceSelect();
});

document.addEventListener('submit', async event => {
  if (!event.target.matches('.project-form')) return;
  event.preventDefault();
  const form=event.target;
  const experience=form.closest('.project-experience');
  if(!experience||experience.dataset.state!=='idle')return;
  const select=projectFormSelects.get(form);
  if(!select)return;
  for(const field of [form.elements.name]){
    field.setCustomValidity(field.value.trim()?'':'Заполните это поле.');
  }
  select.validatePhone();
  if(!form.reportValidity())return;
  activateServiceSelect(select);
  if (!select.value.value) {
    serviceSelect.button.setAttribute('aria-invalid', 'true');
    serviceSelect.button.focus({ preventScroll: true });
    openServiceSelect();
    return;
  }
  closeServiceSelect();
  const submit=form.querySelector('.project-submit');
  experience.dataset.state='sending';
  form.setAttribute('aria-busy','true');
  submit.disabled=true;
  submit.querySelector('span').textContent='Отправляем…';
  document.dispatchEvent(new CustomEvent('project:submitting',{detail:{form}}));
  // Demo submission only. No personal data is transmitted or stored.
  await new Promise(resolve=>setTimeout(resolve,700));
  if(!form.isConnected)return;
  form.removeAttribute('aria-busy');
  form.inert=true;
  form.setAttribute('aria-hidden','true');
  const success=experience.querySelector('.project-success');
  success.inert=false;
  success.removeAttribute('aria-hidden');
  experience.dataset.state='complete';
  document.dispatchEvent(new CustomEvent('project:submitted',{detail:{form}}));
  setTimeout(()=>{
    if(!success.isConnected||(dialog.contains(success)&&(!dialog.open||dialog.classList.contains('is-closing'))))return;
    success.querySelector('.project-success-title').focus({preventScroll:true});
  },motion.matches?0:600);
});

// Reuse the modal markup with separate field state and unique ARIA IDs.
const contactFormHost=document.querySelector('.contact-form-host');
if(contactFormHost){
  contactFormHost.innerHTML=panels.project.html;
  const ids=new Map();
  contactFormHost.querySelectorAll('[id]').forEach(element=>{
    const previous=element.id;const next='contact-'+previous;
    ids.set(previous,next);element.id=next;
  });
  contactFormHost.querySelectorAll('[aria-controls]').forEach(element=>{
    element.setAttribute('aria-controls',element.getAttribute('aria-controls').split(' ').map(id=>ids.get(id)||id).join(' '));
  });
  contactFormHost.querySelector('form').setAttribute('aria-labelledby','contact-form-title');
  initProjectForm(contactFormHost);
}


// The Russian wordmark is shown once, then only the code variants repeat.
const logo = document.querySelector('.logo');
const logoTyping = document.querySelector('.logo-typing');
const logoFrames = [
  { text: 'DigitalPlug', code: false },
  { text: 'Диджитал Плаг', code: false, once: true },
  { text: 'const studio = "DigitalPlug";', code: true },
  { text: 'studio = "DigitalPlug"', code: true },
  { text: '$studio = "DigitalPlug";', code: true },
  { text: '<DigitalPlug />', code: true },
];
let logoFrame = 0;
let logoPosition = logoFrames[0].text.length;
let logoDeleting = true;
let russianShown = false;
let logoTimer;
let logoHasRun = false;
const logoTiming = { type: 48, erase: 22, between: 90, holdCode: 900, holdBrand: 1100, initial: 900, resume: 60 };
function scheduleLogo(delay) {
  clearTimeout(logoTimer);
  logoTimer = setTimeout(typeLogo, delay);
}
function paintLogo() {
  const frame = logoFrames[logoFrame];
  const text = frame.text.slice(0, logoPosition);
  const fragment = document.createDocumentFragment();
  const match = /DigitalPlug|Диджитал Плаг/.exec(text);
  if (match) {
    fragment.append(document.createTextNode(text.slice(0, match.index)));
    const brand = document.createElement('span');
    const russian = match[0] === 'Диджитал Плаг';
    brand.append(document.createTextNode(russian ? 'Диджитал ' : 'Digital'));
    const plug = document.createElement('span');
    plug.className = 'logo-plug';
    plug.textContent = russian ? 'Плаг' : 'Plug';
    brand.append(plug);
    fragment.append(brand, document.createTextNode(text.slice(match.index + match[0].length)));
  } else fragment.append(document.createTextNode(text));
  logoTyping.replaceChildren(fragment);
  logo.classList.toggle('is-code', frame.code);
}
function typeLogo() {
  logoTimer = undefined;
  if (motion.matches || document.hidden) return;
  logoHasRun = true;
  logo.classList.remove('is-holding');
  let delay = logoDeleting ? logoTiming.erase : logoTiming.type;
  if (logoDeleting) {
    logoPosition--;
    if (logoPosition <= 0) {
      logoPosition = 0;
      do { logoFrame = (logoFrame + 1) % logoFrames.length; }
      while (logoFrames[logoFrame].once && russianShown);
      if (logoFrames[logoFrame].once) russianShown = true;
      logoDeleting = false;
      delay = logoTiming.between;
    }
  } else {
    logoPosition++;
    if (logoPosition >= logoFrames[logoFrame].text.length) {
      logoPosition = logoFrames[logoFrame].text.length;
      logoDeleting = true;
      logo.classList.add('is-holding');
      delay = logoFrames[logoFrame].code ? logoTiming.holdCode : logoTiming.holdBrand;
    }
  }
  paintLogo();
  scheduleLogo(delay);
}
function resumeLogo() {
  clearTimeout(logoTimer);
  logoTimer = undefined;
  if (motion.matches) {
    logoFrame = 0; logoPosition = logoFrames[0].text.length; logoDeleting = true;
    paintLogo(); logo.classList.add('is-holding');
  } else if (!document.hidden) scheduleLogo(logoHasRun ? logoTiming.resume : logoTiming.initial);
}
document.addEventListener('visibilitychange', resumeLogo);
motion.addEventListener('change', resumeLogo);
window.addEventListener('pageshow', resumeLogo);
window.addEventListener('pagehide', () => {
  clearTimeout(logoTimer);
  logoTimer = undefined;
});
resumeLogo();






// The existing letters respond to the pointer with a soft, local magnetic lift.
const manifesto = document.querySelector('.manifesto');
const heroLines = [...document.querySelectorAll('.hero-line')];
heroLines.forEach(line => {
  const fragment = document.createDocumentFragment();
  const letters = Array.from(line.dataset.text).map(character => {
    const element = document.createElement('span');
    element.className = character === ' ' ? 'glyph is-space' : 'glyph';
    element.textContent = character === ' ' ? '\u00a0' : character;
    fragment.append(element);
    return { element, x: 0, y: 0, angle: 0, scale: 1, tx: 0, ty: 0, ta: 0, ts: 1, center: 0 };
  });
  line.replaceChildren(fragment);
  let frame = 0, previous = 0, touchTimer;
  function measure() {
    const rect = line.getBoundingClientRect();
    letters.forEach(letter => { letter.center = rect.left + letter.element.offsetLeft - line.offsetLeft + letter.element.offsetWidth / 2; });
    return rect;
  }
  function render(now) {
    frame = 0;
    const dt = previous ? Math.min((now - previous) / 1000, .05) : 1 / 60;
    previous = now;
    const follow = 1 - Math.exp(-dt * 13);
    let unsettled = false;
    letters.forEach(letter => {
      letter.x += (letter.tx - letter.x) * follow;
      letter.y += (letter.ty - letter.y) * follow;
      letter.angle += (letter.ta - letter.angle) * follow;
      letter.scale += (letter.ts - letter.scale) * follow;
      letter.element.style.transform = 'translate3d(' + letter.x.toFixed(3) + 'px,' + letter.y.toFixed(3) + 'px,0) rotate(' + letter.angle.toFixed(3) + 'deg) scaleY(' + letter.scale.toFixed(4) + ')';
      if (Math.abs(letter.tx-letter.x) + Math.abs(letter.ty-letter.y) + Math.abs(letter.ta-letter.angle) > .015 || Math.abs(letter.ts-letter.scale) > .0001) unsettled = true;
    });
    if (unsettled) frame = requestAnimationFrame(render);
    else {
      previous = 0;
      if (!line.classList.contains('is-active')) letters.forEach(letter => { letter.element.style.transform = ''; });
    }
  }
  function start() { if (!frame) frame = requestAnimationFrame(render); }
  function attract(clientX, clientY) {
    if (motion.matches) return;
    const rect = measure();
    const size = parseFloat(getComputedStyle(line).fontSize);
    const radius = size * 1.45;
    const pointerX = clientX ?? rect.left + rect.width / 2;
    const lift = size * (.10 + .035 * Math.max(0,Math.min(1,((clientY ?? rect.top) - rect.top) / rect.height)));
    letters.forEach(letter => {
      const distance = (letter.center - pointerX) / radius;
      const influence = Math.exp(-distance * distance * 1.5);
      letter.ty = -lift * influence;
      letter.tx = distance * size * .065 * influence;
      letter.ta = distance * 5 * influence;
      letter.ts = 1 + influence * .045;
    });
    line.classList.add('is-active'); start();
  }
  function release() {
    line.classList.remove('is-active');
    letters.forEach(letter => { letter.tx=0; letter.ty=0; letter.ta=0; letter.ts=1; });
    start();
  }
  line.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')attract(event.clientX,event.clientY);});
  line.addEventListener('pointermove',event=>{if(event.pointerType!=='touch')attract(event.clientX,event.clientY);},{passive:true});
  line.addEventListener('pointerleave',release);
  line.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch')return;
    clearTimeout(touchTimer);attract(event.clientX,event.clientY);touchTimer=setTimeout(release,900);
  },{passive:true});
  manifesto.addEventListener('focus',()=>attract());
  manifesto.addEventListener('blur',release);
  motion.addEventListener('change',()=>{
    if(frame)cancelAnimationFrame(frame);frame=0;previous=0;
    line.classList.remove('is-active');
    letters.forEach(letter=>{letter.x=letter.y=letter.angle=letter.tx=letter.ty=letter.ta=0;letter.scale=letter.ts=1;letter.element.style.transform='';});
  });
});
