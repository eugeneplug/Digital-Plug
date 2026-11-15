import * as THREE from './vendor/three/three.module.min.js';
import { createShip, lightHangar } from './spectrum-ship-models.js';

export function createShipViewer(canvas, reportReady) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  lightHangar(scene);
  const camera = new THREE.OrthographicCamera(-2.6, 2.6, 1.75, -1.75, .1, 40);
  camera.position.set(4.3, 3.1, 6);
  camera.lookAt(0, 0, 0);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const ships = new Map();

  let stage = canvas.parentElement;
  let ship = null;
  let activeId = null;
  let active = false;
  let visible = false;
  let contextLost = false;
  let hasSize = false;
  let frame = 0;
  let previousTime = 0;
  let resumeSpin = 0;
  let initialYaw = 0;
  let yaw = 0;
  let pitch = 0;
  let pointer = null;

  function render() {
    if (!ship || !hasSize || contextLost) return;
    ship.rotation.set(pitch, yaw, -.10);
    renderer.render(scene, camera);
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    hasSize = width > 0 && height > 0;
    if (!hasSize || contextLost) return;
    const aspect = width / height;
    const halfHeight = Math.max(1.66, 2.55 / aspect);
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }

  function tick(now) {
    const delta = previousTime ? Math.min(now - previousTime, 50) : 0;
    previousTime = now;
    if (!pointer && now >= resumeSpin) {
      yaw += delta * .00025;
      render();
    }
    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    const play = active && visible && ship && !contextLost && !document.hidden && !motion.matches;
    if (!play) {
      cancelAnimationFrame(frame);
      frame = previousTime = 0;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  function showShip(id, heading) {
    if (id !== activeId) {
      if (ship) scene.remove(ship);
      if (!ships.has(id)) ships.set(id, createShip(id));
      ship = ships.get(id);
      scene.add(ship);
      activeId = id;
      initialYaw = yaw = heading;
      pitch = .11;
      resumeSpin = 0;
    }
    resize();
    if (!contextLost) reportReady(true);
    syncMotion();
  }

  function rotate(horizontal, vertical = 0) {
    if (!ship) return;
    yaw += horizontal;
    pitch = Math.max(-.7, Math.min(.7, pitch + vertical));
    resumeSpin = performance.now() + 1600;
    render();
  }

  const sizeObserver = new ResizeObserver(resize);
  const viewObserver = new IntersectionObserver(entries => {
    const entry = entries.find(item => item.target === stage);
    if (!entry) return;
    visible = entry.isIntersecting;
    syncMotion();
  });
  sizeObserver.observe(stage);
  viewObserver.observe(stage);

  function attach(nextStage) {
    if (nextStage === stage) return;
    sizeObserver.unobserve(stage);
    viewObserver.unobserve(stage);
    pointer = null;
    visible = false;
    stage = nextStage;
    stage.append(canvas);
    sizeObserver.observe(stage);
    viewObserver.observe(stage);
    syncMotion();
  }

  function setActive(value) {
    active = value;
    syncMotion();
  }

  canvas.addEventListener('pointerdown', event => {
    if (!ship || pointer || !event.isPrimary || event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (pointer?.id !== event.pointerId) return;
    rotate((event.clientX - pointer.x) * .016, (event.clientY - pointer.y) * .013);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  function release(event) {
    if (pointer?.id !== event.pointerId) return;
    pointer = null;
    resumeSpin = performance.now() + 1600;
  }
  for (const event of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(event, release);

  canvas.addEventListener('keydown', event => {
    switch (event.key) {
      case 'ArrowLeft': rotate(-.31); break;
      case 'ArrowRight': rotate(.31); break;
      case 'ArrowUp': rotate(0,-.15); break;
      case 'ArrowDown': rotate(0,.15); break;
      case 'Home':
        yaw = initialYaw;
        pitch = .11;
        rotate(0);
        break;
      default: return;
    }
    event.preventDefault();
  });

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    reportReady(false, 'Ship image');
    syncMotion();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    resize();
    if (ship) reportReady(true);
    syncMotion();
  });
  document.addEventListener('visibilitychange', syncMotion);
  motion.addEventListener('change', syncMotion);

  return { attach, rotate, setActive, showShip };
}
