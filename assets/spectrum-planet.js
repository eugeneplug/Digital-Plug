import * as THREE from './vendor/three/three.module.min.js';

export function createPlanetViewer(canvas, reportReady) {
  let stage = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 1.4, -1.4, .1, 25);
  camera.position.set(0, .09, 5);
  camera.lookAt(0, 0, 0);

  const rig = new THREE.Group();
  scene.add(rig, new THREE.HemisphereLight(0xe7defd, 0x635097, .83));
  const key = new THREE.DirectionalLight(0xffe8dc, 2.35);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(0x8e69ff, 1.65);
  rim.position.set(4, 1, -4);
  scene.add(key, rim);

  const sphere = new THREE.SphereGeometry(1, 64, 40);
  const surface = new THREE.MeshStandardMaterial({ roughness: .92, metalness: 0 });
  const globe = new THREE.Mesh(sphere, surface);
  rig.add(globe);
  const haze = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { tint: { value: new THREE.Color('#bd8bff') } },
    vertexShader: `
      varying vec3 viewPosition;
      varying vec3 viewNormal;
      void main() {
        vec4 view = modelViewMatrix * vec4(position, 1.0);
        viewPosition = -view.xyz;
        viewNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * view;
      }`,
    fragmentShader: `
      uniform vec3 tint;
      varying vec3 viewPosition;
      varying vec3 viewNormal;
      void main() {
        float edge = pow(1.0 - max(dot(normalize(viewNormal), normalize(viewPosition)), 0.0), 3.0);
        gl_FragColor = vec4(tint, edge * 0.46);
        #include <colorspace_fragment>
      }`,
  });
  const atmosphere = new THREE.Mesh(sphere, haze);
  atmosphere.scale.setScalar(1.018);
  rig.add(atmosphere);

  const ringGeometry = new THREE.RingGeometry(1.18, 1.78, 96);
  const ringMaterial = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    vertexShader: `
      varying vec2 ringPoint;
      void main() {
        ringPoint = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 ringPoint;
      void main() {
        float r = length(ringPoint);
        float edge = smoothstep(1.18, 1.26, r) * (1.0 - smoothstep(1.65, 1.78, r));
        float strata = .56 + .20 * sin(r * 111.0) + .16 * sin(r * 217.0);
        float offset = (r - 1.56) * 67.0;
        float gap = 1.0 - .82 * exp(-offset * offset);
        float light = .54 + .31 * clamp(-ringPoint.x / 1.78, -1.0, 1.0);
        gl_FragColor = vec4(vec3(.72, .51, .91) * light, edge * strata * gap);
        #include <colorspace_fragment>
      }`,
  });
  const rings = new THREE.Mesh(ringGeometry, ringMaterial);
  rings.rotation.set(-1.22, 0, -.12);
  rig.add(rings);

  const loader = new THREE.TextureLoader();
  const textures = new Map();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let visible = false;
  let ready = false;
  let contextLost = false;
  let sequence = 0;
  let frame = 0;
  let previousTime = 0;
  let nextSpin = 0;
  let initialYaw = 0;
  let yaw = 0;
  let pitch = 0;
  let pointer = null;

  function render() {
    if (!ready || contextLost || !stage.clientHeight) return;
    rig.rotation.x = pitch;
    rig.rotation.z = rings.visible ? -.29 : -.12;
    globe.rotation.y = yaw;
    renderer.render(scene, camera);
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height || contextLost) return;
    const aspect = width / height;
    const halfHeight = Math.max(1.19, (rings.visible ? 1.83 : 1.12) / aspect);
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
    if (!pointer && now >= nextSpin) {
      yaw += delta * .00017;
      render();
    }
    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    const play = active && visible && ready && !contextLost && !document.hidden && !motion.matches;
    if (!play) {
      cancelAnimationFrame(frame);
      frame = previousTime = 0;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  function setActive(value) {
    active = value;
    if (active) resize();
    syncMotion();
  }

  async function showPlanet(world, textureUrl) {
    const id = ++sequence;
    ready = false;
    pointer = null;
    reportReady(false, 'Loading 3D globe…');
    syncMotion();
    if (!textures.has(textureUrl)) {
      textures.set(textureUrl, loader.loadAsync(textureUrl).then(texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        return texture;
      }).catch(error => {
        textures.delete(textureUrl);
        throw error;
      }));
    }

    try {
      const map = await textures.get(textureUrl);
      if (id !== sequence) return;
      surface.map = map;
      surface.needsUpdate = true;
      haze.uniforms.tint.value.set(world.rim);
      rings.visible = Boolean(world.ring);
      initialYaw = yaw = world.heading;
      pitch = 0;
      nextSpin = 0;
      ready = true;
      resize();
      if (!contextLost) reportReady(true);
      syncMotion();
    } catch {
      if (id === sequence) reportReady(false, 'Planet image');
    }
  }

  function rotate(direction) {
    if (!ready) return;
    yaw += direction * .31;
    nextSpin = performance.now() + 1600;
    render();
  }

  canvas.addEventListener('pointerdown', event => {
    if (!ready || pointer || !event.isPrimary || event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (pointer?.id !== event.pointerId) return;
    yaw += (event.clientX - pointer.x) * .015;
    pitch = Math.max(-.65, Math.min(.65, pitch + (event.clientY - pointer.y) * .009));
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    render();
  });
  function release(event) {
    if (pointer?.id !== event.pointerId) return;
    pointer = null;
    nextSpin = performance.now() + 1600;
  }
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, release);
  canvas.addEventListener('keydown', event => {
    if (!ready) return;
    switch (event.key) {
      case 'ArrowLeft': rotate(-1); break;
      case 'ArrowRight': rotate(1); break;
      case 'ArrowUp': pitch = Math.max(-.65, pitch - .15); break;
      case 'ArrowDown': pitch = Math.min(.65, pitch + .15); break;
      case 'Home': yaw = initialYaw; pitch = 0; break;
      default: return;
    }
    event.preventDefault();
    nextSpin = performance.now() + 1600;
    render();
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    reportReady(false, 'Planet image');
    syncMotion();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    resize();
    if (ready) reportReady(true);
    syncMotion();
  });

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
    visible = false;
    stage = nextStage;
    stage.append(canvas);
    sizeObserver.observe(stage);
    viewObserver.observe(stage);
    resize();
    syncMotion();
  }
  document.addEventListener('visibilitychange', syncMotion);
  motion.addEventListener('change', syncMotion);

  return { attach, showPlanet, setActive, rotate };
}
