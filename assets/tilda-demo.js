import { playLaptopDemo } from './laptop-demo.js?v=1';

const demo = document.querySelector('.tilda-demo');
const track = demo.querySelector('.td-live-track');
const field = name => demo.querySelector('[data-td-' + name + ']');
const updateTitles = title => demo.querySelectorAll('[data-td-title]').forEach(node => { node.textContent = title; });
const draftTitle = 'Рыбный портал';
const finalTitle = 'Речной атлас';

playLaptopDemo(demo, {
  targetAttribute: 'data-td-target',
  duration: 24900,
  resetContent(ready) {
    demo.classList.remove('is-editing', 'is-publishing', 'is-published', 'is-ending');
    field('email').textContent = '';
    field('password').textContent = '';
    field('edit-title').textContent = draftTitle;
    field('saved').textContent = 'Черновик';
    field('publish-title').textContent = 'Публикуем страницу';
    field('publish-symbol').textContent = '↑';
    track.style.transform = '';
    updateTitles(ready ? finalTitle : draftTitle);
    return ready ? 'live' : 'login';
  },
  buildTimeline: ({ showScene, moveTo, click, type, scroll, clearHover }) => [
    [420, () => moveTo('email', 570)],
    [1040, () => click('email')],
    [1130, () => type(field('email'), 'admin@admin.ru', 970)],
    [2200, () => moveTo('password', 420)],
    [2690, () => click('password')],
    [2780, () => type(field('password'), '••••••••', 570)],
    [3420, () => moveTo('signin', 490)],
    [3980, () => click('signin')],
    [4450, () => showScene('projects')],
    [4910, () => moveTo('project', 660)],
    [5700, () => click('project')],
    [6200, () => showScene('pages')],
    [6590, () => moveTo('page', 540)],
    [7270, () => click('page')],
    [7770, () => showScene('editor')],
    [8220, () => moveTo('block', 590)],
    [8930, () => click('block')],
    [9270, () => demo.classList.add('is-editing')],
    [9780, () => moveTo('title', 490)],
    [10380, () => click('title')],
    [10500, () => type(field('edit-title'), finalTitle, 1190)],
    [11860, () => moveTo('save', 510)],
    [12500, () => click('save')],
    [12990, () => {
      demo.classList.remove('is-editing');
      clearHover();
      updateTitles(finalTitle);
      field('saved').textContent = 'Сохранено';
    }],
    [13540, () => moveTo('publish', 640)],
    [14300, () => click('publish')],
    [14790, () => {
      demo.classList.add('is-publishing');
      clearHover();
    }],
    [16280, () => {
      demo.classList.replace('is-publishing', 'is-published');
      field('publish-title').textContent = 'Сайт опубликован';
      field('publish-symbol').textContent = '✓';
    }],
    [16680, () => moveTo('open', 580)],
    [17410, () => click('open')],
    [17910, () => showScene('live')],
    [19700, () => scroll(track, 3550)],
    [24400, () => demo.classList.add('is-ending')],
  ]
});
