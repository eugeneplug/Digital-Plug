const fleet = [
  { id: 'kestrel', name: 'Kestrel I-7', role: 'Interceptor', price: 28400, yaw: .04 },
  { id: 'tern', name: 'Tern S-3', role: 'Scout', price: 18900, yaw: -.18 },
  { id: 'atlas', name: 'Atlas C-8', role: 'Freighter', price: 51200, yaw: .31 },
  { id: 'meridian', name: 'Meridian X-4', role: 'Explorer', price: 37600, yaw: -.25 },
];

const timeline = [
  { stage: 'browse', view: 'hangar', status: 'Browsing fleet', duration: 1600 },
  { stage: 'select', view: 'hangar', status: 'Hull selected', duration: 900 },
  { stage: 'launch', view: 'hangar', status: 'Adding to cart', duration: 680 },
  { stage: 'added', view: 'hangar', status: 'Hull added', duration: 760 },
  { stage: 'select', view: 'hangar', status: 'Hull selected', duration: 1300 },
  { stage: 'launch', view: 'hangar', status: 'Adding to cart', duration: 680 },
  { stage: 'added', view: 'hangar', status: 'Hull added', duration: 820 },
  { stage: 'review', view: 'cart', status: 'Reviewing order', duration: 2170 },
  { stage: 'checkout', view: 'cart', status: 'Opening SpaceKassa', duration: 500 },
  { stage: 'authorize', view: 'payment', status: 'Processing payment', duration: 2300 },
  { stage: 'complete', view: 'receipt', status: 'Order confirmed', duration: 2850 },
];

const currency = new Intl.NumberFormat('en-US');
const money = value => currency.format(value) + ' CR';
const image = ship => new URL('web-development/spectrum-galaxy/' + ship.id + '.webp', import.meta.url).href;
const screen = document.querySelector('.spectrum-screen');

if (screen) {
  const art = screen.closest('.spectrum-art');
  const deck = screen.querySelector('.spectrum-deck');
  const field = name => screen.querySelector('[data-sg-' + name + ']');
  const setText = (name, value) => { field(name).textContent = value; };
  const steps = [...screen.querySelectorAll('[data-sg-step]')];
  const scenes = ['hangar', 'cart', 'payment', 'receipt'];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const rows = fleet.map(ship => {
    const row = document.createElement('li');
    row.innerHTML = '<img width="46" height="36" alt=""><span><strong>' + ship.name + '</strong><small>' + ship.role + '</small></span>';
    row.querySelector('img').src = image(ship);
    return row;
  });
  field('fleet').append(...rows);

  let visible = false;
  let viewer;
  let viewerRequested = false;
  let order = 0;
  let step = 0;
  let selected = fleet[0];
  let cart = [];
  let timer = 0;
  let remaining = 0;
  let deadline = 0;

  function selectShip(ship) {
    selected = ship;
    rows.forEach((row, index) => row.classList.toggle('is-selected', fleet[index] === ship));
    field('model-image').src = image(ship);
    field('flight').src = image(ship);
    setText('hull', ship.name);
    setText('price', money(ship.price));
    viewer?.showShip(ship.id, ship.yaw);
  }

  function updateOrder() {
    const total = money(cart.reduce((sum, ship) => sum + ship.price, 0));
    setText('count', cart.length);
    setText('total', total);
    setText('payment', total);
    setText('receipt', cart.length + ' hulls reserved · ' + total);
    field('lines').replaceChildren(...cart.map(ship => {
      const row = document.createElement('li');
      row.innerHTML = '<img width="70" height="48" alt=""><div><strong>' + ship.name + '</strong><small>' + ship.role + '</small></div><span>' + money(ship.price) + '</span>';
      row.querySelector('img').src = image(ship);
      return row;
    }));
  }

  function render() {
    const { stage, view, status, duration } = timeline[step];
    if (stage === 'browse') {
      if (cart.length) {
        cart = [];
        order++;
        setText('count', 0);
      }
      selectShip(fleet[order % fleet.length]);
    }
    if (stage === 'select') {
      selectShip(fleet[(order + (cart.length ? 2 : 0)) % fleet.length]);
    }
    if (stage === 'added') {
      cart.push(selected);
      setText('count', cart.length);
    }
    if (stage === 'review') updateOrder();

    screen.dataset.stage = stage;
    deck.dataset.view = view;
    setText('status', status);
    setText('add-label', stage === 'added' ? 'Added to cart' : 'Add to cart');
    steps.forEach((item, index) => item.classList.toggle('is-active', scenes[index] === view));
    viewer?.setActive(visible && view === 'hangar');
    remaining = duration;
  }

  function syncPlayback() {
    const onScreen = visible && !document.hidden;
    art.classList.toggle('is-laptop-visible', onScreen);
    const playing = onScreen && !reduceMotion.matches;

    if (!playing && timer) {
      clearTimeout(timer);
      timer = 0;
      remaining = Math.max(0, deadline - performance.now());
    }
    if (playing && !timer) {
      deadline = performance.now() + remaining;
      timer = setTimeout(() => {
        timer = 0;
        step = (step + 1) % timeline.length;
        render();
        syncPlayback();
      }, remaining);
    }

    if (onScreen && !viewerRequested) {
      viewerRequested = true;
      import('./spectrum-ship-viewer.js?v=2').then(({ createShipViewer }) => {
        viewer = createShipViewer(field('canvas'), ready => {
          screen.classList.toggle('is-model-ready', ready);
        });
        viewer.showShip(selected.id, selected.yaw);
        viewer.setActive(visible && deck.dataset.view === 'hangar');
      }).catch(() => {
        // The rendered thumbnail remains visible if WebGL is unavailable.
      });
    }
  }

  render();
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    viewer?.setActive(visible && deck.dataset.view === 'hangar');
    syncPlayback();
  }).observe(art);

  document.addEventListener('visibilitychange', syncPlayback);
  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) {
      clearTimeout(timer);
      timer = 0;
      step = 0;
      cart = [];
      setText('count', 0);
      render();
    }
    syncPlayback();
  });
}
