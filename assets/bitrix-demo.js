import { playLaptopDemo } from './laptop-demo.js?v=1';

const demo = document.querySelector('.bitrix-demo');
const field = name => demo.querySelector('[data-bx-' + name + ']');
const codeLines = [...demo.querySelectorAll('.bx-code-line code')];
const track = demo.querySelector('.bx-live-track');

playLaptopDemo(demo, {
  targetAttribute: 'data-bx-target',
  duration: 29600,
  resetContent(ready) {
    demo.dataset.view = 'catalog';
    demo.classList.remove('is-saved', 'is-checked', 'is-ending');
    for (const name of ['user', 'password', 'product', 'price']) field(name).textContent = '';
    codeLines.forEach(line => { line.textContent = ''; });
    track.style.transform = '';
    return ready ? 'live' : 'login';
  },
  buildTimeline({ showScene, moveTo, click, type, scroll, clearHover }) {
    const showPanel = view => {
      demo.dataset.view = view;
      clearHover();
    };

    return [
      [360, () => moveTo('user', 510)],
      [970, () => click('user')],
      [1070, () => type(field('user'), 'admin', 430)],
      [1580, () => moveTo('password', 390)],
      [2050, () => click('password')],
      [2160, () => type(field('password'), '••••••••••', 560)],
      [2840, () => moveTo('login', 450)],
      [3380, () => click('login')],
      [3860, () => showScene('admin')],

      [4320, () => moveTo('create', 570)],
      [5030, () => click('create')],
      [5520, () => showPanel('product')],
      [5930, () => moveTo('product', 490)],
      [6500, () => click('product')],
      [6610, () => type(field('product'), 'Луч 1200', 740)],
      [7460, () => moveTo('price', 440)],
      [8000, () => click('price')],
      [8100, () => type(field('price'), '9\u202f900', 550)],
      [9030, () => moveTo('save', 500)],
      [9670, () => click('save')],
      [10170, () => {
        demo.classList.add('is-saved');
        showPanel('catalog');
      }],

      [11600, () => moveTo('template', 600)],
      [12300, () => click('template')],
      [12750, () => showPanel('code')],
      [13270, () => type(codeLines[0], '<?php $item = $arResult; ?>', 550)],
      [13930, () => type(codeLines[1], '<article class="product-card">', 610)],
      [14660, () => type(codeLines[2], "  <h3><?= htmlspecialchars($item['NAME']) ?></h3>", 1030)],
      [15810, () => type(codeLines[3], "  <p><?= htmlspecialchars($item['PRICE']) ?> ₽</p>", 1020)],
      [16960, () => type(codeLines[4], '</article>', 420)],
      [17950, () => moveTo('preview', 600)],
      [18650, () => click('preview')],
      [19140, () => showPanel('check')],
      [19570, () => moveTo('card-preview', 530)],
      [20210, () => click('card-preview')],
      [20560, () => demo.classList.add('is-checked')],
      [21250, () => moveTo('open', 520)],
      [21880, () => click('open')],
      [22390, () => showScene('live')],
      [24350, () => scroll(track, 3350)],
      [29100, () => demo.classList.add('is-ending')],
    ];
  },
});
