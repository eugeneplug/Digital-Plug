const fleet = [
  {
    "id": "kestrel",
    "name": "Kestrel I-7",
    "role": "Interceptor",
    "drive": "Twin vector thrusters",
    "price": 28400,
    "stock": 3,
    "yaw": 0.04,
    "description": "A fast-response interceptor with swept wings, a low cockpit and thrust nozzles set wide for tight turns.",
    "facts": [
      [
        "Top speed",
        "490 m/s"
      ],
      [
        "Cargo bay",
        "12 t"
      ],
      [
        "Jump range",
        "3.2 ly"
      ],
      [
        "Crew",
        "1 pilot"
      ],
      [
        "Shielding",
        "Light · 18 MJ"
      ],
      [
        "Hardpoints",
        "2 wing mounts"
      ]
    ],
    "systems": [
      [
        "Vector drive",
        "Independent engine nozzles help the pilot correct yaw on final approach."
      ],
      [
        "Role",
        "Short-range patrols, courier escort and rapid pursuits."
      ]
    ]
  },
  {
    "id": "tern",
    "name": "Tern S-3",
    "role": "Scout",
    "drive": "Low-signature pulse drive",
    "price": 18900,
    "stock": 5,
    "yaw": -0.18,
    "description": "A narrow survey craft with a panoramic canopy and sensor pods at each wingtip. Built for mapping quiet routes.",
    "facts": [
      [
        "Top speed",
        "362 m/s"
      ],
      [
        "Cargo bay",
        "24 t"
      ],
      [
        "Jump range",
        "6.8 ly"
      ],
      [
        "Crew",
        "1 pilot"
      ],
      [
        "Shielding",
        "Light · 12 MJ"
      ],
      [
        "Sensor range",
        "48,000 km"
      ]
    ],
    "systems": [
      [
        "Passive array",
        "The paired pods track traffic and chart debris without an active scan."
      ],
      [
        "Role",
        "Route mapping, beacon surveys and low-signature reconnaissance."
      ]
    ]
  },
  {
    "id": "atlas",
    "name": "Atlas C-8",
    "role": "Freighter",
    "drive": "Triple heavy plasma drive",
    "price": 51200,
    "stock": 2,
    "yaw": 0.31,
    "description": "A twin-pod hauler with reinforced load rails, a raised bridge and a dedicated engine for each cargo module.",
    "facts": [
      [
        "Top speed",
        "184 m/s"
      ],
      [
        "Cargo bay",
        "940 t"
      ],
      [
        "Jump range",
        "4.9 ly"
      ],
      [
        "Crew",
        "4 operators"
      ],
      [
        "Shielding",
        "Heavy · 68 MJ"
      ],
      [
        "Load system",
        "Twin ISO pods"
      ]
    ],
    "systems": [
      [
        "Cargo rails",
        "The external pods release independently, so a dock can unload one side at a time."
      ],
      [
        "Role",
        "Bulk contracts, regional supply runs and orbital construction freight."
      ]
    ]
  },
  {
    "id": "meridian",
    "name": "Meridian X-4",
    "role": "Explorer",
    "drive": "Long-range ion drive",
    "price": 37600,
    "stock": 3,
    "yaw": -0.25,
    "description": "A long-range explorer with an articulated scanner and open outrigger frames sized for deep-field instruments.",
    "facts": [
      [
        "Top speed",
        "284 m/s"
      ],
      [
        "Cargo bay",
        "132 t"
      ],
      [
        "Jump range",
        "11.4 ly"
      ],
      [
        "Crew",
        "2 operators"
      ],
      [
        "Shielding",
        "Medium · 36 MJ"
      ],
      [
        "Survey kit",
        "Spectrometer array"
      ]
    ],
    "systems": [
      [
        "Field instruments",
        "A gimballed bow scanner records spectral data from distant signals and wreckage."
      ],
      [
        "Role",
        "Deep-space surveys and expeditions beyond established relay routes."
      ]
    ]
  }
];

const assetBase = new URL('web-development/spectrum-galaxy/', import.meta.url);
const format = new Intl.NumberFormat('en-US');
const money = amount => format.format(amount) + ' CR';
const shipCount = count => count + (count === 1 ? ' ship' : ' ships');
const imageUrl = ship => new URL(ship.id + '.webp', assetBase).href;

const terminal = document.querySelector('.spectrum-screen');
if (terminal) activateTerminal(terminal);

function activateTerminal(terminal) {
  const deck = terminal.querySelector('[data-laptop-scroll]');
  const panels = [...deck.querySelectorAll('[data-sg-view]')];
  const registry = terminal.querySelector('[data-sg-ships]');
  const roster = terminal.querySelector('[data-sg-roster]');
  const cartItems = terminal.querySelector('[data-sg-cart]');
  const status = terminal.querySelector('[data-sg-status]');
  const added = terminal.querySelector('[data-sg-added]');
  const canvas = terminal.querySelector('[data-sg-canvas]');
  const feature = terminal.querySelector('.spectrum-feature');
  const hangarStage = terminal.querySelector('.spectrum-feature-model');
  const viewer = terminal.querySelector('.spectrum-viewer');
  const detailStage = canvas.parentElement;
  const preview = terminal.querySelector('[data-sg-feature-image]');
  const image = terminal.querySelector('[data-sg-fallback]');
  const hints = [terminal.querySelector('#spectrum-hangar-hint'),terminal.querySelector('#spectrum-model-hint')];
  const rotateButtons = [...terminal.querySelectorAll('[data-sg-rotate]')];
  const addButton = terminal.querySelector('[data-sg-action="add"]');
  const count = terminal.querySelector('[data-sg-count]');
  const shipById = new Map(fleet.map(ship => [ship.id, ship]));
  const cart = new Map();
  const inventory = new Map(fleet.map(ship => [ship.id, ship.stock]));
  const available = ship => inventory.get(ship.id);

  let selected = fleet[0];
  let renderer = null;
  let loading = null;
  let current = 'catalog';
  let rendererView = 'catalog';
  let catalogTop = 0;

  roster.innerHTML = fleet.map(ship => `
    <button type="button" data-sg-select="${ship.id}" aria-pressed="${ship === selected}">
      <img src="${imageUrl(ship)}" alt="" width="480" height="330">
      <span><strong>${ship.name}</strong><small>${ship.role}</small></span>
    </button>`).join('');

  registry.innerHTML = fleet.map(ship => `
    <button class="spectrum-card" type="button" data-sg-inspect="${ship.id}">
      <img src="${imageUrl(ship)}" alt="" width="480" height="330">
      <strong>${ship.name}</strong>
      <small>${ship.role}</small>
      <span class="spectrum-price">${money(ship.price)}</span>
    </button>`).join('');

  function text(selector, value) {
    terminal.querySelector(selector).textContent = value;
  }

  function show(view, top = 0, focus) {
    if (current === 'catalog' && view !== 'catalog') catalogTop = deck.scrollTop;
    current = view;
    deck.toggleAttribute('data-laptop-autoplay-disabled', view !== 'catalog');
    for (const panel of panels) panel.hidden = panel.dataset.sgView !== view;
    deck.scrollTo({ top: typeof top === 'function' ? top() : top, behavior: 'instant' });
    syncModel();
    const panel = panels.find(item => item.dataset.sgView === view);
    (focus ?? panel.querySelector('h2')).focus({ preventScroll: true });
    deck.dispatchEvent(new Event('laptop-autoplay-change'));
  }

  function openRegistry() {
    show('catalog', () => registry.parentElement.offsetTop, terminal.querySelector('#spectrum-fleet-title'));
  }

  function modelReady(ready, message = 'Drag to rotate') {
    feature.classList.toggle('has-model', ready && rendererView === 'catalog');
    viewer.classList.toggle('has-model', ready && rendererView === 'detail');
    for (const hint of hints) hint.textContent = message;
    for (const button of rotateButtons) button.disabled = !ready;
  }

  function syncModel() {
    if (current !== 'catalog' && current !== 'detail') {
      renderer?.setActive(false);
      return;
    }

    if (!renderer) {
      if (loading) return;
      modelReady(false, 'Loading 3D model…');
      loading = import('./spectrum-ship-viewer.js?v=1')
        .then(({createShipViewer}) => {
          renderer = createShipViewer(canvas, modelReady);
          syncModel();
        })
        .catch(() => modelReady(false, 'Ship image'));
      return;
    }

    rendererView = current;
    const inDetail = current === 'detail';
    canvas.setAttribute('aria-describedby', inDetail ? 'spectrum-model-hint' : 'spectrum-hangar-hint');
    canvas.setAttribute('aria-label', '3D model of ' + selected.name + '. Drag or use the arrow keys to rotate.');
    renderer.attach(inDetail ? detailStage : hangarStage);
    renderer.showShip(selected.id, selected.yaw);
    renderer.setActive(true);
  }

  function choose(ship) {
    selected = ship;
    preview.src = imageUrl(ship);
    text('[data-sg-feature-name]', ship.name);
    text('[data-sg-feature-price]', money(ship.price));
    for (const button of roster.querySelectorAll('[data-sg-select]')) {
      button.setAttribute('aria-pressed', String(button.dataset.sgSelect === ship.id));
    }
  }

  function inspect(ship) {
    choose(ship);
    added.hidden = true;
    const remaining = available(ship);
    const full = (cart.get(ship.id) ?? 0) >= remaining;
    addButton.disabled = full;
    addButton.firstElementChild.textContent = remaining === 0 ? 'Out of stock' : full ? 'Stock limit reached' : 'Add to cart';
    image.src = imageUrl(ship);
    text('#spectrum-ship-title', ship.name);
    text('[data-sg-kind]', ship.role);
    text('[data-sg-description]', ship.description);
    text('[data-sg-meta]', ship.drive + ' · ' + remaining + ' in stock');
    text('[data-sg-detail-price]', money(ship.price));
    terminal.querySelector('[data-sg-facts]').innerHTML = ship.facts.map(([term,value]) =>
      '<div><dt>' + term + '</dt><dd>' + value + '</dd></div>').join('');
    terminal.querySelector('[data-sg-systems]').innerHTML = ship.systems.map(([label,description]) =>
      '<li><strong>' + label + '</strong><span>' + description + '</span></li>').join('');
    show('detail');
  }

  function order() {
    const lines = [...cart].map(([id, quantity]) => ({ ship: shipById.get(id), quantity }));
    return {
      lines,
      units: lines.reduce((sum, line) => sum + line.quantity, 0),
      total: lines.reduce((sum, line) => sum + line.quantity * line.ship.price, 0),
    };
  }

  function renderCart(focusShip, action) {
    const {lines, units, total} = order();
    if (!lines.length) {
      cartItems.innerHTML = '<p class="spectrum-muted">Your cart is empty.</p><button class="spectrum-button" type="button" data-sg-action="fleet">Browse the fleet</button>';
      if (focusShip) cartItems.querySelector('button').focus({ preventScroll: true });
      return;
    }

    const rows = lines.map(({ship,quantity}) => `
      <li>
        <div><strong>${ship.name}</strong><small>${money(ship.price)} each</small></div>
        <div class="spectrum-quantity" aria-label="${ship.name} quantity">
          <button type="button" data-sg-action="fewer" data-sg-item="${ship.id}" aria-label="Remove one ${ship.name}">−</button>
          <span>${quantity}</span>
          <button type="button" data-sg-action="more" data-sg-item="${ship.id}" aria-label="Add one ${ship.name}" ${quantity >= available(ship) ? 'disabled' : ''}>+</button>
        </div>
        <strong>${money(ship.price * quantity)}</strong>
      </li>`).join('');
    cartItems.innerHTML = `<ul class="spectrum-order-list">${rows}</ul>
      <div class="spectrum-summary-row"><span>${shipCount(units)}</span><strong>${money(total)}</strong></div>
      <button class="spectrum-button" type="button" data-sg-action="checkout">Continue to SpaceKassa <span aria-hidden="true">↗</span></button>`;
    if (!focusShip) return;
    const sameRow = [...cartItems.querySelectorAll('[data-sg-item]')].filter(button => button.dataset.sgItem === focusShip && !button.disabled);
    (sameRow.find(button => button.dataset.sgAction === action) ?? sameRow[0] ??
      cartItems.querySelector('[data-sg-action="checkout"]')).focus({ preventScroll: true });
  }

  function setQuantity(ship, next) {
    if (!ship) return;
    const quantity = Math.max(0, Math.min(available(ship), next));
    if (quantity === 0) cart.delete(ship.id);
    else cart.set(ship.id, quantity);
    count.textContent = order().units;
    status.textContent = ship.name + ': ' + shipCount(quantity) + ' in cart.';
  }

  function openCart() {
    renderCart();
    show('cart');
  }

  function checkout() {
    const {lines, total} = order();
    if (!lines.length) {
      openCart();
      return;
    }
    terminal.querySelector('[data-sg-payment]').innerHTML = `
      <ul class="spectrum-order-list">${lines.map(({ship,quantity}) =>
        '<li><span>' + ship.name + ' · ' + shipCount(quantity) + '</span><strong>' +
        money(ship.price * quantity) + '</strong></li>').join('')}</ul>`;
    text('[data-sg-pay-amount]', money(total));
    show('payment');
  }

  function pay() {
    if (current !== 'payment') return;
    const {lines, units, total} = order();
    if (!units) return;
    const ref = Math.floor(Math.random() * 36 ** 6).toString(36).padStart(6, '0').toUpperCase();
    text('[data-sg-confirmation]', shipCount(units) + ' cleared for collection: ' + lines.map(line => line.ship.name).join(', ') + '.');
    text('[data-sg-reference]', 'SG-' + ref);
    text('[data-sg-paid]', money(total));
    for (const {ship, quantity} of lines) inventory.set(ship.id, available(ship) - quantity);
    cart.clear();
    count.textContent = '0';
    show('confirmation');
  }

  terminal.addEventListener('click', event => {
    const select = event.target.closest('[data-sg-select]');
    if (select) {
      const ship = shipById.get(select.dataset.sgSelect);
      if (!ship) return;
      choose(ship);
      syncModel();
      return;
    }
    const card = event.target.closest('[data-sg-inspect]');
    if (card) {
      const ship = shipById.get(card.dataset.sgInspect);
      if (ship) inspect(ship);
      return;
    }
    const rotate = event.target.closest('[data-sg-rotate]');
    if (rotate) {
      renderer?.rotate(Number(rotate.dataset.sgRotate) * .31);
      return;
    }
    const button = event.target.closest('[data-sg-action]');
    if (!button) return;
    const {sgAction: action, sgItem: id} = button.dataset;
    switch (action) {
      case 'home': show('catalog'); break;
      case 'fleet': openRegistry(); break;
      case 'catalog': show('catalog', catalogTop); break;
      case 'inspect': inspect(selected); break;
      case 'add': {
        const quantity = (cart.get(selected.id) ?? 0) + 1;
        setQuantity(selected, quantity);
        added.hidden = false;
        if (quantity >= available(selected)) {
          addButton.disabled = true;
          addButton.firstElementChild.textContent = 'Stock limit reached';
          added.querySelector('button').focus({ preventScroll: true });
        }
        break;
      }
      case 'cart': openCart(); break;
      case 'fewer':
      case 'more':
        setQuantity(shipById.get(id), (cart.get(id) ?? 0) + (action === 'more' ? 1 : -1));
        renderCart(id, action);
        break;
      case 'checkout': checkout(); break;
      case 'pay': pay(); break;
    }
  });

  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    syncModel();
  }).observe(hangarStage);
}
