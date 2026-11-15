const host = document.querySelector('.landing-question-model');

if (host && 'IntersectionObserver' in window && 'ResizeObserver' in window) {
  observeModel(host);
}

function observeModel(host) {
  let visible = false;
  let loading = false;
  let syncMotion;
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !loading) {
      loading = true;
      import('./vendor/three/three.module.min.js')
        .then(three => {
          syncMotion = setupModel(three, host, () => visible);
          syncMotion();
        })
        .catch(() => observer.disconnect());
    }
    syncMotion?.();
  });
  observer.observe(host);
}

function createQuestion(three) {
  const hook = new three.Shape();
  hook.moveTo(-1.12, .78);
  hook.bezierCurveTo(-1.05, 1.46, -.55, 1.84, .1, 1.84);
  hook.bezierCurveTo(.76, 1.84, 1.17, 1.43, 1.17, .84);
  hook.bezierCurveTo(1.17, .34, .94, .03, .48, -.25);
  hook.bezierCurveTo(.18, -.43, .12, -.57, .1, -.79);
  hook.bezierCurveTo(.09, -.9, .03, -.95, -.08, -.95);
  hook.lineTo(-.43, -.95);
  hook.quadraticCurveTo(-.61, -.95, -.6, -.78);
  hook.bezierCurveTo(-.57, -.34, -.39, -.03, .06, .24);
  hook.bezierCurveTo(.32, .4, .47, .56, .47, .8);
  hook.bezierCurveTo(.47, 1.03, .31, 1.17, .07, 1.17);
  hook.bezierCurveTo(-.19, 1.17, -.36, 1.03, -.4, .78);
  hook.quadraticCurveTo(-.43, .64, -.57, .64);
  hook.lineTo(-.96, .64);
  hook.quadraticCurveTo(-1.14, .64, -1.12, .78);

  const dot = new three.Shape();
  dot.moveTo(-.48, -1.18);
  dot.lineTo(-.06, -1.18);
  dot.quadraticCurveTo(.08, -1.18, .08, -1.32);
  dot.lineTo(.08, -1.67);
  dot.quadraticCurveTo(.08, -1.81, -.06, -1.81);
  dot.lineTo(-.48, -1.81);
  dot.quadraticCurveTo(-.62, -1.81, -.62, -1.67);
  dot.lineTo(-.62, -1.32);
  dot.quadraticCurveTo(-.62, -1.18, -.48, -1.18);

  const depth = .34;
  const geometry = new three.ExtrudeGeometry([hook, dot], {
    depth,
    bevelThickness: .1,
    bevelSize: .068,
    bevelSegments: 6,
    curveSegments: 12,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);

  const face = new three.MeshStandardMaterial({ color: 0xb2caff, roughness: .36 });
  const side = new three.MeshStandardMaterial({ color: 0x658cf4, roughness: .32 });
  return new three.Mesh(geometry, [face, side]);
}

function setupModel(three, host, isVisible) {
  const canvas = host.querySelector('canvas');
  const renderer = new three.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.toneMapping = three.ACESFilmicToneMapping;

  const scene = new three.Scene();
  const camera = new three.OrthographicCamera(-3, 3, 2.75, -2.75, .1, 30);
  camera.position.z = 8;

  const question = createQuestion(three);
  question.rotation.set(.15, -.48, -.08);
  scene.add(question, new three.HemisphereLight(0xf6faff, 0x86a6f4, 1.45));

  const key = new three.DirectionalLight(0xf4f8ff, 2.25);
  key.position.set(-3, 5, 6);
  const rim = new three.DirectionalLight(0xc4d8ff, 1.05);
  rim.position.set(4, 1, -4);
  scene.add(key, rim);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cycle = 11000;
  let elapsed = 0;
  let frame = 0;
  let previousTime = 0;
  let contextLost = false;

  function resize() {
    if (contextLost) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    const halfWidth = Math.max(1.75, camera.top * width / height);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
    host.classList.add('is-ready');
  }

  function pose() {
    const angle = elapsed / cycle * Math.PI * 2;
    question.rotation.y = -.48 + angle;
    question.position.y = .065 * Math.sin(angle * 2);
  }

  function tick(time) {
    if (previousTime) elapsed = (elapsed + Math.min(time - previousTime, 50)) % cycle;
    previousTime = time;
    pose();
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    if (contextLost || !isVisible() || document.hidden || motion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    host.classList.remove('is-ready');
    syncMotion();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    resize();
    syncMotion();
  });
  motion.addEventListener('change', () => {
    if (motion.matches && !contextLost) {
      elapsed = 0;
      pose();
      renderer.render(scene, camera);
    }
    syncMotion();
  });
  document.addEventListener('visibilitychange', syncMotion);
  new ResizeObserver(resize).observe(host);
  resize();
  return syncMotion;
}
