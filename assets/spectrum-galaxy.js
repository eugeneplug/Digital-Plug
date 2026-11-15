const worlds = [
  {
    "id": "mars",
    "name": "Mars",
    "kind": "Solar system · Rocky world",
    "tagline": "The red canyons",
    "price": 2490,
    "nights": 4,
    "group": 8,
    "color": "#642b3f",
    "rim": "#f28075",
    "heading": 1.1,
    "description": "Cross the red dunes in a pressurized rover and watch the sunset from the rim of Valles Marineris.",
    "facts": [
      [
        "Weather",
        "Cold, dry air and seasonal dust storms. Typical surface temperature: about -60°C."
      ],
      [
        "Flora",
        "Native plant life remains unconfirmed. The fictional base grows greens in pressurized greenhouses."
      ],
      [
        "Fauna",
        "Native animal life remains unconfirmed. Follow rover tracks on the guided canyon route."
      ],
      [
        "Field notes",
        "Surface excursions use pressure suits. Routes shift when dust reduces visibility."
      ]
    ],
    "itinerary": [
      [
        "Arrival",
        "Acclimatize at Ares Station and fit your surface suit."
      ],
      [
        "Canyon traverse",
        "Ride to Valles Marineris and stop at sheltered overlooks."
      ],
      [
        "Blue sunset",
        "Watch the evening sky from a sealed observation dome."
      ]
    ]
  },
  {
    "id": "nibiru",
    "name": "Nibiru",
    "kind": "Imagined world · Ringed frontier",
    "tagline": "The violet ringlight",
    "price": 3890,
    "nights": 6,
    "group": 6,
    "color": "#5e328b",
    "rim": "#c79aff",
    "ring": true,
    "heading": 1.9,
    "description": "Land on a twilight plateau where violet auroras meet the shadow of a vast ring system.",
    "facts": [
      [
        "Weather",
        "The equatorial plateaus stay near 8°C. Aurora forecasts are best after the upper winds ease."
      ],
      [
        "Flora",
        "Glass ferns curl their leaves before ringfall. Indigo moss stores moisture in hollow stems."
      ],
      [
        "Fauna",
        "Silk gliders feed above the cliff forests. Dusk herds cross the plateau in small groups."
      ],
      [
        "Field notes",
        "Keep to lit trails at dusk. Watch gliders from the overlooks above the canopy."
      ]
    ],
    "itinerary": [
      [
        "Ring approach",
        "Follow the outer rings on a window-side arrival pass."
      ],
      [
        "Glass forest",
        "Walk a boardwalk through the fern groves with a local guide."
      ],
      [
        "Aurora watch",
        "Spend the last evening at a sheltered plateau observatory."
      ]
    ]
  },
  {
    "id": "vespera",
    "name": "Vespera",
    "kind": "Imagined world · Canopy reserve",
    "tagline": "Forests that glow",
    "price": 3190,
    "nights": 5,
    "group": 6,
    "color": "#244a61",
    "rim": "#86f1b9",
    "heading": 0.4,
    "description": "Float above an emerald forest, then descend into the canopy as the night-bloomers open.",
    "facts": [
      [
        "Weather",
        "About 24°C in the low canopy. Short warm rains arrive around dusk."
      ],
      [
        "Flora",
        "Lantern orchids glow after rain. Broadleaf towers collect water in deep crown pools."
      ],
      [
        "Fauna",
        "Ribbon moths pollinate the orchids. Mossbacks travel along branches high in the canopy."
      ],
      [
        "Field notes",
        "Stay on raised walkways. Guides use dim amber lamps to protect nocturnal pollinators."
      ]
    ],
    "itinerary": [
      [
        "Canopy lift",
        "Ascend from the river docks to the skybridge lodges."
      ],
      [
        "Dusk survey",
        "Follow a botanist to an orchid grove during the first bloom."
      ],
      [
        "River flight",
        "Trace the canopy line at sunrise before departure."
      ]
    ]
  },
  {
    "id": "thalassa",
    "name": "Thalassa",
    "kind": "Imagined world · Ocean sanctuary",
    "tagline": "Under a blue horizon",
    "price": 4290,
    "nights": 7,
    "group": 8,
    "color": "#254b84",
    "rim": "#85c9ff",
    "heading": -0.55,
    "description": "Sleep above an ocean with floating ice gardens and take a deep dive beneath its turquoise surface.",
    "facts": [
      [
        "Weather",
        "Upper water averages 12°C. Coastal platforms close when squalls cross the open sea."
      ],
      [
        "Flora",
        "Mirror kelp rises to the surface in silver ribbons. Ice gardens shelter cold-water algae."
      ],
      [
        "Fauna",
        "Glass rays glide between kelp beds. Chorus whales pass the sanctuary on migration."
      ],
      [
        "Field notes",
        "Dives use enclosed submersibles. Operators keep a quiet perimeter during whale season."
      ]
    ],
    "itinerary": [
      [
        "Floating harbor",
        "Board at the ocean platform and cross to the ice gardens."
      ],
      [
        "Kelp descent",
        "Take a guided submersible dive through the mirror forests."
      ],
      [
        "Whale watch",
        "Listen to migration calls from a pressurized observation cabin."
      ]
    ]
  }
];

const assetBase = new URL('web-development/spectrum-galaxy/', import.meta.url);
const credits = new Intl.NumberFormat('en-US');
function money(amount) {
  return credits.format(amount) + ' CR';
}
function asset(id, suffix = '') {
  return new URL(id + suffix + '.webp', assetBase).href;
}
function seatsLabel(count) {
  return count + (count === 1 ? ' seat' : ' seats');
}

const store = document.querySelector('.spectrum-screen');
if (store) activateStore(store);

function activateStore(store) {
  const deck = store.querySelector('[data-laptop-scroll]');
  const panels = [...deck.querySelectorAll('[data-sg-view]')];
  const catalog = store.querySelector('[data-sg-worlds]');
  const cartItems = store.querySelector('[data-sg-cart]');
  const status = store.querySelector('[data-sg-status]');
  const added = store.querySelector('[data-sg-added]');
  const canvas = store.querySelector('[data-sg-canvas]');
  const image = store.querySelector('[data-sg-fallback]');
  const viewer = store.querySelector('.spectrum-viewer');
  const detailStage = canvas.parentElement;
  const feature = store.querySelector('.spectrum-feature');
  const featureStage = feature.querySelector('.spectrum-feature-model');
  const orbitHint = store.querySelector('#spectrum-model-hint');
  const rotateButtons = [...store.querySelectorAll('[data-sg-rotate]')];
  const addButton = store.querySelector('[data-sg-action="add"]');
  const count = store.querySelector('[data-sg-count]');
  const planetById = new Map(worlds.map(world => [world.id, world]));
  const cart = new Map();
  let selected = null;
  let globe = null;
  let globeLoading = null;
  let globeMode = null;
  let current = 'catalog';
  let catalogTop = 0;

  catalog.innerHTML = worlds.map(world => `
    <button class="spectrum-card" type="button" data-sg-planet="${world.id}" style="--planet-glow:${world.color}">
      <img src="${asset(world.id)}" alt="" width="340" height="280">
      <strong>${world.name}</strong>
      <small>${world.tagline}</small>
      <span class="spectrum-price">${world.nights} nights · ${money(world.price)}</span>
    </button>`).join('');

  function setText(selector, value) {
    store.querySelector(selector).textContent = value;
  }

  function show(view, top = 0, focus) {
    if (current === 'catalog' && view !== 'catalog') catalogTop = deck.scrollTop;
    current = view;
    deck.toggleAttribute('data-laptop-autoplay-disabled', view !== 'catalog');
    for (const panel of panels) panel.hidden = panel.dataset.sgView !== view;
    deck.scrollTo({ top: typeof top === 'function' ? top() : top, behavior: 'instant' });
    syncGlobe();
    const panel = panels.find(item => item.dataset.sgView === view);
    (focus ?? panel.querySelector('h2')).focus({ preventScroll: true });
    deck.dispatchEvent(new Event('laptop-autoplay-change'));
  }

  function showDestinationSection() {
    const heading = store.querySelector('#spectrum-destinations-title');
    show('catalog', () => store.querySelector('.spectrum-catalog').offsetTop, heading);
  }

  function modelReady(ready, message = 'Drag to rotate') {
    feature.classList.toggle('has-model', ready && globeMode === 'catalog');
    viewer.classList.toggle('has-model', ready && globeMode === 'detail');
    orbitHint.textContent = message;
    for (const button of rotateButtons) button.disabled = !ready || globeMode !== 'detail';
  }

  function syncGlobe() {
    if (current !== 'catalog' && current !== 'detail') {
      globe?.setActive(false);
      return;
    }
    if (!globe) {
      if (globeLoading) return;
      modelReady(false, 'Loading 3D globe…');
      globeLoading = import('./spectrum-planet.js?v=2')
        .then(({createPlanetViewer}) => {
          globe = createPlanetViewer(canvas, modelReady);
          syncGlobe();
        })
        .catch(() => modelReady(false, 'Planet image'));
      return;
    }

    globeMode = current;
    const detail = globeMode === 'detail';
    const world = detail ? selected : planetById.get('nibiru');
    canvas.tabIndex = detail ? 0 : -1;
    if (detail) canvas.removeAttribute('aria-hidden');
    else canvas.setAttribute('aria-hidden', 'true');
    globe.attach(detail ? detailStage : featureStage);
    globe.showPlanet(world, asset(world.id, '-surface'));
    globe.setActive(true);
  }

  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    syncGlobe();
  }).observe(feature);

  function openPlanet(world) {
    selected = world;
    added.hidden = true;
    const full = (cart.get(world.id) ?? 0) >= world.group;
    addButton.disabled = full;
    addButton.firstElementChild.textContent = full ? 'Seat limit reached' : 'Add to cart';
    image.src = asset(world.id);
    canvas.setAttribute('aria-label', '3D globe of ' + world.name + '. Drag or use arrow keys to rotate.');
    setText('#spectrum-planet-title', world.name);
    setText('[data-sg-kind]', world.kind);
    setText('[data-sg-description]', world.description);
    setText('[data-sg-meta]', world.nights + ' nights · Groups of up to ' + world.group);
    setText('[data-sg-detail-price]', money(world.price));
    store.querySelector('[data-sg-facts]').innerHTML = world.facts.map(([term,value]) =>
      '<div><dt>' + term + '</dt><dd>' + value + '</dd></div>').join('');
    store.querySelector('[data-sg-itinerary]').innerHTML = world.itinerary.map(([step,description]) =>
      '<li><strong>' + step + '</strong><span>' + description + '</span></li>').join('');
    show('detail');
  }

  function order() {
    const lines = [...cart].map(([id, quantity]) => ({ world: planetById.get(id), quantity }));
    return {
      lines,
      seats: lines.reduce((sum, line) => sum + line.quantity, 0),
      total: lines.reduce((sum, line) => sum + line.quantity * line.world.price, 0),
    };
  }

  function renderCart(focusWorld, action) {
    const {lines, seats, total} = order();
    if (!lines.length) {
      cartItems.innerHTML = '<p class="spectrum-muted">Your cart is empty.</p><button class="spectrum-button" type="button" data-sg-action="destinations">Browse tours</button>';
      if (focusWorld) cartItems.querySelector('button').focus({ preventScroll: true });
      return;
    }

    const rows = lines.map(({world,quantity}) => `
      <li>
        <div><strong>${world.name}</strong><small>${money(world.price)} per seat</small></div>
        <div class="spectrum-quantity" aria-label="${world.name} seats">
          <button type="button" data-sg-action="fewer" data-sg-item="${world.id}" aria-label="Remove one ${world.name} seat">−</button>
          <span>${quantity}</span>
          <button type="button" data-sg-action="more" data-sg-item="${world.id}" aria-label="Add one ${world.name} seat" ${quantity >= world.group ? 'disabled' : ''}>+</button>
        </div>
        <strong>${money(world.price * quantity)}</strong>
      </li>`).join('');
    cartItems.innerHTML = `<ul class="spectrum-order-list">${rows}</ul>
      <div class="spectrum-summary-row"><span>${seatsLabel(seats)}</span><strong>${money(total)}</strong></div>
      <button class="spectrum-button" type="button" data-sg-action="checkout">Continue to SpaceKassa <span aria-hidden="true">↗</span></button>`;
    if (!focusWorld) return;
    const sameRow = [...cartItems.querySelectorAll('[data-sg-item]')].filter(button => button.dataset.sgItem === focusWorld && !button.disabled);
    (sameRow.find(button => button.dataset.sgAction === action) ?? sameRow[0] ??
      cartItems.querySelector('[data-sg-action="checkout"]')).focus({ preventScroll: true });
  }

  function setQuantity(id, next) {
    if (!planetById.has(id)) return;
    const quantity = Math.min(planetById.get(id).group, next);
    if (quantity <= 0) cart.delete(id);
    else cart.set(id, quantity);
    count.textContent = order().seats;
    status.textContent = planetById.get(id).name + ': ' + seatsLabel(Math.max(0, quantity)) + ' in cart.';
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
    store.querySelector('[data-sg-payment]').innerHTML = `
      <ul class="spectrum-order-list">${lines.map(({world,quantity}) =>
        '<li><span>' + world.name + ' · ' + seatsLabel(quantity) + '</span><strong>' +
        money(world.price * quantity) + '</strong></li>').join('')}</ul>`;
    setText('[data-sg-pay-amount]', money(total));
    show('payment');
  }

  function pay() {
    if (current !== 'payment') return;
    const {lines, seats, total} = order();
    if (!seats) return;
    const reference = 'SG-' + Math.floor(Math.random() * 36 ** 6).toString(36).padStart(6, '0').toUpperCase();
    setText('[data-sg-confirmation]', seatsLabel(seats) + ' reserved for ' + lines.map(line => line.world.name).join(', ') + '.');
    setText('[data-sg-reference]', reference);
    setText('[data-sg-paid]', money(total));
    cart.clear();
    count.textContent = '0';
    show('confirmation');
  }

  store.addEventListener('click', event => {
    const planet = event.target.closest('[data-sg-planet]');
    if (planet) {
      const world = planetById.get(planet.dataset.sgPlanet);
      if (world) openPlanet(world);
      return;
    }
    const rotate = event.target.closest('[data-sg-rotate]');
    if (rotate) {
      globe?.rotate(Number(rotate.dataset.sgRotate));
      return;
    }
    const button = event.target.closest('[data-sg-action]');
    if (!button) return;
    const {sgAction: action, sgItem: id} = button.dataset;
    switch (action) {
      case 'home': show('catalog'); break;
      case 'destinations': showDestinationSection(); break;
      case 'catalog': {
        const target = selected ? [...catalog.querySelectorAll('[data-sg-planet]')].find(card => card.dataset.sgPlanet === selected.id) : undefined;
        show('catalog', catalogTop, target && catalogTop > 0 ? target : undefined);
        break;
      }
      case 'add': {
        if (!selected) return;
        const quantity = (cart.get(selected.id) ?? 0) + 1;
        setQuantity(selected.id, quantity);
        added.hidden = false;
        if (quantity >= selected.group) {
          addButton.disabled = true;
          addButton.firstElementChild.textContent = 'Seat limit reached';
          added.querySelector('button').focus({ preventScroll: true });
        }
        break;
      }
      case 'cart': openCart(); break;
      case 'fewer':
      case 'more':
        setQuantity(id, (cart.get(id) ?? 0) + (action === 'more' ? 1 : -1));
        renderCart(id, action);
        break;
      case 'checkout': checkout(); break;
      case 'pay': pay(); break;
    }
  });
}
