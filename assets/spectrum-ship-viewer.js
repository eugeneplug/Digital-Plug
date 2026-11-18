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

  const stage = canvas.parentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const ships = new Map();
  let ship;
  let activeId;
  let active = false;
  let contextLost = false;
  let hasSize = false;
  let frame = 0;
  let previousTime = 0;

  function render() {
    if (ship && hasSize && !contextLost) renderer.render(scene, camera);
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
    ship.rotation.y += delta * .00034;
    render();
    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    const play = active && ship && !contextLost && !document.hidden && !motion.matches;
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
      ship.rotation.set(.11, heading, -.10);
      scene.add(ship);
      activeId = id;
    }
    resize();
    if (!contextLost) reportReady(true);
    syncMotion();
  }

  function setActive(value) {
    active = value;
    syncMotion();
  }

  new ResizeObserver(resize).observe(stage);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    reportReady(false);
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

  return { setActive, showShip };
}
