(() => {
  const dashboard = document.querySelector('.saas-dashboard');
  if (!dashboard) return;

  const art = dashboard.closest('.dev-hero-art');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const number = new Intl.NumberFormat('en-US');
  const decimal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const field = name => dashboard.querySelector('[data-saas-' + name + ']');
  const metrics = {
    revenue: field('revenue'),
    orders: field('orders'),
    conversion: field('conversion'),
    visits: field('visits'),
    online: field('online'),
  };
  const rows = [...dashboard.querySelectorAll('.saas-source-table tbody tr')];
  const cells = rows.map(row => ({
    visits: row.querySelector('[data-saas-source-visits]'),
    orders: row.querySelector('[data-saas-source-orders]'),
    bar: row.querySelector('.saas-cell-bar'),
  }));
  const profiles = [
    {
      name: 'revenue',
      type: 'area',
      count: 31,
      samples: [20, 27, 35, 52, 71, 57, 40, 29, 34, 58, 73, 81, 62, 47, 31, 39, 54, 72, 88, 70, 53, 37, 28, 46, 65, 79, 71, 51, 35, 43, 60, 76, 81, 62, 40, 29, 46, 66, 74, 55, 37, 22, 36, 57, 69, 48],
    },
    {
      name: 'orders',
      type: 'bars',
      count: 20,
      samples: [82, 64, 39, 21, 35, 71, 89, 56, 27, 14, 34, 58, 31, 20, 48, 76, 61, 43, 26, 17, 44, 81, 52, 24, 66, 36, 18, 59, 87, 42, 23, 54, 33, 72, 49, 20, 63],
    },
    {
      name: 'conversion',
      type: 'curve',
      count: 25,
      samples: [73, 79, 83, 81, 70, 54, 39, 29, 31, 44, 60, 69, 65, 54, 42, 33, 32, 40, 50, 53, 45, 32, 24, 22, 30, 44, 58, 63, 55, 40, 27, 24, 33, 47, 54, 49, 36, 26, 29, 42, 56],
    },
  ];
  const changes = [
    { visits: 24, orders: 2 },
    { visits: -31, orders: -2 },
    { visits: 44, orders: 3 },
    { visits: -18, orders: -1 },
    { visits: 20, orders: 1 },
    { visits: -39, orders: -3 },
    { visits: 27, orders: 2 },
  ];
  const charts = profiles.map(profile => {
    const { name, type, count, samples } = profile;
    const values = samples.slice(0, count);
    const bars = dashboard.querySelector('[data-saas-bars="' + name + '"]');
    const columns = type === 'bars' ? values.map((_, index) => {
      const column = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      column.setAttribute('x', (2 + index * 162 / count).toFixed(2));
      column.setAttribute('width', (162 / count - 2).toFixed(2));
      column.setAttribute('rx', '1');
      bars.append(column);
      return column;
    }) : [];
    return {
      ...profile,
      line: dashboard.querySelector('[data-saas-line="' + name + '"]'),
      area: dashboard.querySelector('[data-saas-area="' + name + '"]'),
      tip: dashboard.querySelector('[data-saas-tip="' + name + '"]'),
      previous: dashboard.querySelector('[data-saas-previous="' + name + '"]'),
      growth: dashboard.querySelector('[data-saas-growth="' + name + '"]'),
      columns,
      from: values,
      to: values,
      past: values.map((_, point) => samples[(point + 7) % samples.length] * .76 + 8),
    };
  });

  let before = {
    sources: [{ visits: 1428, orders: 86 }, { visits: 759, orders: 48 }, { visits: 426, orders: 34 }, { visits: 262, orders: 16 }],
    revenue: 284760,
    online: 207,
  };
  let after = before;
  let updateIndex = 0;
  let elapsed = 0;
  let changeStart = -1000;
  let nextUpdate = 2400;
  let visible = false;
  let frame = 0;
  let previousTime = 0;
  let lastPaint = -50;

  function text(node, value) {
    if (node.textContent !== value) node.textContent = value;
  }

  function pathFor(values, curved = false) {
    const points = values.map((value, index) => ({
      x: 1 + index * 162 / (values.length - 1),
      y: 61 - value * .56,
    }));
    if (!curved) {
      return points.map((point, index) =>
        (index ? 'L' : 'M') + point.x.toFixed(2) + ' ' + point.y.toFixed(2)).join('');
    }

    let path = 'M' + points[0].x.toFixed(2) + ' ' + points[0].y.toFixed(2);
    for (let index = 1; index < points.length; index++) {
      const previous = points[Math.max(0, index - 2)];
      const start = points[index - 1];
      const end = points[index];
      const next = points[Math.min(points.length - 1, index + 1)];
      const controlStartX = start.x + (end.x - previous.x) / 6;
      const controlStartY = start.y + (end.y - previous.y) / 6;
      const controlEndX = end.x - (next.x - start.x) / 6;
      const controlEndY = end.y - (next.y - start.y) / 6;
      path += 'C' + [controlStartX, controlStartY, controlEndX, controlEndY, end.x, end.y]
        .map(value => value.toFixed(2)).join(' ');
    }
    return path;
  }

  for (const chart of charts) {
    chart.previous.setAttribute('d', pathFor(chart.past, chart.type === 'curve'));
  }

  function advance() {
    const source = updateIndex % rows.length;
    const change = changes[updateIndex % changes.length];
    before = after;
    after = {
      sources: before.sources.map((row, index) => index === source
        ? { visits: row.visits + change.visits, orders: row.orders + change.orders }
        : row),
      revenue: before.revenue + change.orders * (1470 + updateIndex % 4 * 215),
      online: 207 + Math.round(24 * Math.sin(updateIndex * .7) + 14 * Math.sin(updateIndex * 1.8)),
    };
    charts.forEach(chart => {
      chart.from = chart.to;
      const value = chart.samples[(chart.count + updateIndex) % chart.samples.length];
      chart.to = chart.to.slice(1).concat(value);
    });
    rows.forEach((row, index) => row.classList.toggle('is-updated', index === source));
    changeStart = elapsed;
    updateIndex++;
  }

  function render() {
    const progress = Math.min(1, (elapsed - changeStart) / 950);
    const ratio = progress ** 2 * (3 - 2 * progress);
    const interpolate = (from, to) => Math.round(from + (to - from) * ratio);
    const sources = after.sources.map((source, index) => ({
      visits: interpolate(before.sources[index].visits, source.visits),
      orders: interpolate(before.sources[index].orders, source.orders),
    }));
    const visits = sources.reduce((sum, source) => sum + source.visits, 0);
    const orders = sources.reduce((sum, source) => sum + source.orders, 0);
    const conversion = 100 * orders / visits;
    const revenue = interpolate(before.revenue, after.revenue);
    const largest = Math.max(...sources.map(source => source.visits));

    text(metrics.revenue, number.format(revenue));
    text(metrics.orders, number.format(orders));
    text(metrics.conversion, decimal.format(conversion) + '%');
    text(metrics.visits, number.format(visits) + ' sessions');
    text(metrics.online, number.format(interpolate(before.online, after.online)));
    const growth = [100 * (revenue / 252446 - 1), 100 * (orders / 205 - 1), 100 * (conversion / 6.9 - 1)];

    sources.forEach((source, index) => {
      text(cells[index].visits, number.format(source.visits));
      text(cells[index].orders, number.format(source.orders));
      cells[index].bar.style.setProperty('--bar-share', (source.visits / largest).toFixed(3));
    });

    charts.forEach((chart, index) => {
      const values = chart.to.map((value, point) => chart.from[point] + (value - chart.from[point]) * ratio);
      if (chart.type === 'bars') {
        chart.columns.forEach((column, point) => {
          const height = values[point] * .56;
          column.setAttribute('y', (61 - height).toFixed(2));
          column.setAttribute('height', height.toFixed(2));
        });
      } else {
        const line = pathFor(values, chart.type === 'curve');
        chart.line.setAttribute('d', line);
        chart.area.setAttribute('d', line + 'L163 65H1Z');
        chart.tip.setAttribute('cx', '163');
        chart.tip.setAttribute('cy', (61 - values.at(-1) * .56).toFixed(2));
      }
      const declining = growth[index] < 0;
      text(chart.growth, (declining ? '↘ -' : '↗ +') + decimal.format(Math.abs(growth[index])) + '%');
      chart.growth.classList.toggle('is-declining', declining);
    });

    if (elapsed - changeStart > 1350) rows.forEach(row => row.classList.remove('is-updated'));
  }

  const drawGlobe = createGlobe(dashboard.querySelector('.saas-globe'));

  function tick(now) {
    if (previousTime) elapsed += Math.min(now - previousTime, 80);
    previousTime = now;
    if (elapsed >= nextUpdate) {
      advance();
      nextUpdate = elapsed + 3200;
    }
    // Twenty frames per second keeps the small projected dashboard lightweight.
    if (elapsed - lastPaint >= 50) {
      render();
      drawGlobe(elapsed);
      lastPaint = elapsed;
    }
    frame = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    const playing = visible && !document.hidden && !motion.matches;
    art.classList.toggle('is-laptop-visible', playing);
    if (!playing) {
      cancelAnimationFrame(frame);
      frame = previousTime = 0;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  render();
  drawGlobe(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .12 }).observe(art);
  } else {
    visible = true;
    syncPlayback();
  }
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', syncPlayback);

  function createGlobe(canvas) {
    const context = canvas.getContext('2d');
    if (!context) return () => {};

    const width = 200;
    const height = 150;
    canvas.width = width * 2;
    canvas.height = height * 2;
    context.setTransform(2, 0, 0, 2, 0, 0);
    const radians = Math.PI / 180;
    const cx = 95;
    const cy = 74;
    const radius = 61;
    const continents = [
      [[-168,70],[-145,61],[-126,49],[-124,31],[-111,26],[-100,16],[-85,9],[-77,9],[-81,22],[-97,27],[-86,30],[-80,25],[-69,45],[-54,49],[-65,62],[-93,70],[-125,73]],
      [[-80,10],[-66,11],[-48,-1],[-36,-9],[-41,-23],[-53,-36],[-68,-55],[-75,-43],[-71,-28],[-81,-5]],
      [[-12,36],[-10,60],[8,72],[35,67],[56,74],[90,73],[130,65],[171,66],[164,55],[140,40],[125,31],[121,20],[109,10],[96,3],[89,22],[77,8],[67,24],[48,12],[35,31],[21,38],[10,44],[0,42]],
      [[-17,31],[8,37],[31,31],[42,11],[51,8],[42,-11],[28,-34],[15,-35],[10,-17],[-2,0],[-16,7]],
      [[114,-22],[129,-11],[144,-16],[154,-26],[147,-38],[129,-35],[113,-29]],
      [[-54,59],[-43,60],[-21,73],[-27,82],[-49,83],[-60,74]],
      [[129,32],[133,35],[142,45],[146,43],[140,34],[132,30]],
      [[166,-35],[174,-42],[170,-47],[166,-43]],
      [[46,-13],[50,-17],[47,-26],[43,-24]],
    ];

    function inside(longitude, latitude, polygon) {
      let contained = false;
      for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
        const [x, y] = polygon[index];
        const [px, py] = polygon[previous];
        if ((y > latitude) !== (py > latitude) &&
            longitude < (px - x) * (latitude - y) / (py - y) + x) contained = !contained;
      }
      return contained;
    }

    const land = [];
    for (let latitude = -54; latitude <= 78; latitude += 5) {
      for (let longitude = -177; longitude <= 177; longitude += 5) {
        if (continents.some(polygon => inside(longitude, latitude, polygon))) land.push([longitude, latitude]);
      }
    }
    const cities = [[-74,41],[-.1,51.5],[37.6,55.8],[139.7,35.7],[151.2,-33.8]];

    function project(longitude, latitude, rotation) {
      const lon = longitude * radians + rotation;
      const lat = latitude * radians;
      const depth = Math.cos(lat) * Math.cos(lon);
      return { x: cx + radius * Math.cos(lat) * Math.sin(lon), y: cy - radius * Math.sin(lat), depth };
    }

    function gridLine(points, rotation) {
      context.beginPath();
      let wasVisible = false;
      for (const [longitude, latitude] of points) {
        const point = project(longitude, latitude, rotation);
        if (point.depth > 0) {
          if (wasVisible) context.lineTo(point.x, point.y);
          else context.moveTo(point.x, point.y);
          wasVisible = true;
        } else {
          wasVisible = false;
        }
      }
      context.stroke();
    }

    const parallels = [-60,-30,0,30,60].map(lat =>
      Array.from({length:91}, (_, index) => [-180 + index * 4, lat]));
    const meridians = Array.from({length:12}, (_, index) =>
      Array.from({length:46}, (_, point) => [index * 30 - 180, -90 + point * 4]));

    return milliseconds => {
      const rotation = -.4 + milliseconds * Math.PI * 2 / 34000;
      context.clearRect(0, 0, width, height);
      context.strokeStyle = '#778dae47';
      context.lineWidth = .65;
      context.beginPath();
      context.ellipse(cx, cy, 86, 28, -.4, 0, Math.PI * 2);
      context.stroke();

      const glow = context.createRadialGradient(cx, cy, radius - 6, cx, cy, radius + 12);
      glow.addColorStop(0, '#8e9ef71a');
      glow.addColorStop(.65, '#708cc31a');
      glow.addColorStop(1, '#708cc300');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(cx, cy, radius + 12, 0, Math.PI * 2);
      context.fill();

      context.save();
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.clip();
      const ocean = context.createRadialGradient(cx - 20, cy - 24, 7, cx + 10, cy + 15, 84);
      ocean.addColorStop(0, '#33445f');
      ocean.addColorStop(.7, '#1b293d');
      ocean.addColorStop(1, '#101925');
      context.fillStyle = ocean;
      context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      context.strokeStyle = '#9bb1da32';
      context.lineWidth = .55;
      for (const line of [...parallels, ...meridians]) gridLine(line, rotation);

      for (const [longitude, latitude] of land) {
        const point = project(longitude, latitude, rotation);
        if (point.depth <= 0) continue;
        context.globalAlpha = .4 + point.depth * .6;
        context.fillStyle = '#c2baf1';
        context.beginPath();
        context.arc(point.x, point.y, .7 + point.depth * .63, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      cities.forEach(([longitude, latitude], index) => {
        const point = project(longitude, latitude, rotation);
        if (point.depth <= .08) return;
        const pulse = (milliseconds / 1700 + index * .2) % 1;
        context.strokeStyle = 'rgba(108,219,239,' + ((1 - pulse) * .8).toFixed(2) + ')';
        context.lineWidth = .85;
        context.beginPath();
        context.arc(point.x, point.y, 2 + pulse * 7, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = '#b0fbff';
        context.beginPath();
        context.arc(point.x, point.y, 1.9, 0, Math.PI * 2);
        context.fill();
      });
      context.restore();

      context.strokeStyle = '#adb8e357';
      context.lineWidth = .75;
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();
      const orbit = milliseconds / 3400;
      const ox = Math.cos(orbit) * 86;
      const oy = Math.sin(orbit) * 28;
      context.fillStyle = '#c8f8ff';
      context.beginPath();
      context.arc(cx + ox * Math.cos(-.4) - oy * Math.sin(-.4), cy + ox * Math.sin(-.4) + oy * Math.cos(-.4), 2.2, 0, Math.PI * 2);
      context.fill();
    };
  }
})();
