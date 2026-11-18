import { playLaptopDemo } from './laptop-demo.js?v=1';

const demo = document.querySelector('.wordpress-demo');
const field = name => demo.querySelector('[data-wp-' + name + ']');
const codeLines = [...demo.querySelectorAll('.wp-code-line code')];
const track = demo.querySelector('.wp-live-track');

function setEditor(mode, label, action) {
  demo.dataset.editor = mode;
  field('mode').textContent = label;
  field('mode-action').textContent = action;
}

playLaptopDemo(demo, {
  targetAttribute: 'data-wp-target',
  duration: 31900,
  resetContent(ready) {
    demo.classList.remove('is-inserting', 'is-inserted', 'is-publishing', 'is-published', 'is-ending');
    delete demo.dataset.inspected;
    setEditor('canvas', 'Визуальный редактор', 'Код');
    field('user').textContent = '';
    field('password').textContent = '';
    field('publish-title').textContent = 'Публикация страницы';
    field('publish-mark').textContent = '↑';
    codeLines.forEach(line => { line.textContent = ''; });
    track.style.transform = '';
    return ready ? 'live' : 'login';
  },
  buildTimeline: ({ moveTo, click, type, showScene, clearHover, scroll }) => [
    [380, () => moveTo('user', 510)],
    [950, () => click('user')],
    [1050, () => type(field('user'), 'admin', 450)],
    [1620, () => moveTo('password', 400)],
    [2080, () => click('password')],
    [2200, () => type(field('password'), '••••••••••', 600)],
    [2910, () => moveTo('login', 520)],
    [3520, () => click('login')],
    [4020, () => showScene('admin')],
    [4640, () => moveTo('page', 630)],
    [5410, () => click('page')],
    [5910, () => showScene('editor')],

    [6500, () => moveTo('insert', 570)],
    [7180, () => click('insert')],
    [7460, () => {
      demo.classList.add('is-inserting');
      clearHover();
    }],
    [7920, () => moveTo('html-block', 560)],
    [8600, () => click('html-block')],
    [9100, () => {
      demo.classList.replace('is-inserting', 'is-inserted');
      clearHover();
    }],
    [9500, () => moveTo('mode', 620)],
    [10250, () => click('mode')],
    [10690, () => {
      setEditor('code', 'Редактор кода', 'Визуально');
      clearHover();
    }],
    [11230, () => type(codeLines[0], '<!-- wp:html -->', 360)],
    [11690, () => type(codeLines[1], '<section class="ocean-note">', 560)],
    [12360, () => type(codeLines[2], '  <h2>Из глубины</h2>', 530)],
    [13000, () => type(codeLines[3], '  <p>Три рыбы, три мира под водой.</p>', 850)],
    [13980, () => type(codeLines[4], '</section>', 390)],
    [14480, () => type(codeLines[5], '<!-- /wp:html -->', 430)],
    [15570, () => moveTo('mode', 450)],
    [16130, () => click('mode')],
    [16580, () => {
      setEditor('check', 'Визуальный редактор', 'Код');
      clearHover();
    }],

    [17110, () => moveTo('cover', 610)],
    [17835, () => click('cover')],
    [17975, () => { demo.dataset.inspected = 'cover'; }],
    [18630, () => moveTo('new-block', 410)],
    [19160, () => click('new-block')],
    [19310, () => { demo.dataset.inspected = 'new-block'; }],
    [20200, () => moveTo('publish', 680)],
    [21000, () => click('publish')],
    [21450, () => {
      demo.classList.add('is-publishing');
      clearHover();
    }],
    [22860, () => {
      demo.classList.replace('is-publishing', 'is-published');
      field('publish-title').textContent = 'Страница опубликована';
      field('publish-mark').textContent = '✓';
    }],
    [23270, () => moveTo('open', 580)],
    [23970, () => click('open')],
    [24510, () => showScene('live')],
    [26440, () => scroll(track, 3610)],
    [31390, () => demo.classList.add('is-ending')],
  ],
});
