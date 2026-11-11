(() => {
  const host = document.querySelector('.dev-code-model');
  const canvas = host?.querySelector('canvas');
  if (!canvas) return;
  const libraryUrl = new URL('vendor/three/three.classic.min.js', document.currentScript.src);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let loading = false;
  let updateMotion = () => {};

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !loading) {
      loading = true;
      initialize().catch(error => {
        host.dataset.modelError = error.message;
        console.warn('DigitalPlug 3D:', error);
        canvas.hidden = true;
        canvas.tabIndex = -1;
      });
    }
    updateMotion();
  });
  observer.observe(host);

  async function initialize() {
    if (!window.DigitalPlugThree) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = libraryUrl.href;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Cannot load the local 3D library'));
        document.head.append(script);
      });
    }
    const THREE = window.DigitalPlugThree;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .95;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
    const model = new THREE.Group();
    scene.add(model);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x344867, 1.2));
    const keyLight = new THREE.DirectionalLight(0xfffaf2, 2.1);
    keyLight.position.set(-3, 5, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x92b7ff, 2);
    rimLight.position.set(4, 1, -3);
    scene.add(rimLight);

    const material = new THREE.MeshPhongMaterial({
      color: 0xe9eef7,
      specular: 0xdce8ff,
      shininess: 75,
    });
    const edgeMaterial = material.clone();
    edgeMaterial.color.setHex(0x9cabc3);
    edgeMaterial.shininess = 55;
    const surfaces = [material, edgeMaterial];

    function roundedShape(points, radius) {
      const shape = new THREE.Shape();
      const corners = points.map((point, index) => {
        const vertex = new THREE.Vector2(...point);
        const previous = new THREE.Vector2(...points[(index + points.length - 1) % points.length]);
        const next = new THREE.Vector2(...points[(index + 1) % points.length]);
        const offset = Math.min(radius, vertex.distanceTo(previous) / 3, vertex.distanceTo(next) / 3);
        return {
          vertex,
          before: previous.sub(vertex).setLength(offset).add(vertex),
          after: next.sub(vertex).setLength(offset).add(vertex),
        };
      });
      shape.moveTo(corners[0].before.x, corners[0].before.y);
      for (const { vertex, before, after } of corners) {
        shape.lineTo(before.x, before.y);
        shape.quadraticCurveTo(vertex.x, vertex.y, after.x, after.y);
      }
      shape.closePath();
      return shape;
    }

    const chevron = roundedShape([
      [.28, .78], [-.48, .13], [-.48, -.13], [.28, -.78],
      [.53, -.45], [.02, 0], [.53, .45],
    ], .16);
    const slash = roundedShape([
      [-.48, -1.16], [-.12, -1.16], [.48, 1.16], [.12, 1.16],
    ], .12);
    const options = {
      depth: .44, steps: 1, bevelEnabled: true,
      bevelThickness: .12, bevelSize: .09, bevelSegments: 4, curveSegments: 6,
    };
    function smoothBevels(geometry) {
      const positions = geometry.attributes.position;
      const normals = geometry.attributes.normal;
      const shared = new Map();
      const vertexNormals = [];
      for (let index = 0; index < positions.count; index++) {
        const key = [positions.getX(index), positions.getY(index), positions.getZ(index)]
          .map(value => Math.round(value * 100000)).join(',');
        if (!shared.has(key)) shared.set(key, new THREE.Vector3());
        const normal = shared.get(key);
        normal.x += normals.getX(index);
        normal.y += normals.getY(index);
        normal.z += normals.getZ(index);
        vertexNormals.push(normal);
      }
      for (const normal of shared.values()) normal.normalize();
      for (const [index, normal] of vertexNormals.entries()) {
        normals.setXYZ(index, normal.x, normal.y, normal.z);
      }
    }
    const chevronGeometry = new THREE.ExtrudeGeometry(chevron, options);
    smoothBevels(chevronGeometry);
    chevronGeometry.translate(0, 0, -.22);
    const slashGeometry = new THREE.ExtrudeGeometry(slash, options);
    smoothBevels(slashGeometry);
    slashGeometry.translate(0, 0, -.22);
    const left = new THREE.Mesh(chevronGeometry, surfaces);
    left.position.x = -1.2;
    const right = new THREE.Mesh(chevronGeometry, surfaces);
    right.rotation.z = Math.PI;
    right.position.x = 1.2;
    model.add(left, new THREE.Mesh(slashGeometry, surfaces), right);

    const initialYaw = -.55;
    let targetYaw = initialYaw;
    model.rotation.set(.22, initialYaw, -.1);
    let frame = 0;
    let previousTime = 0;
    let lastInteraction = 0;
    let pointer = null;
    let contextLost = false;

    function render() {
      renderer.render(scene, camera);
    }

    function resize() {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height || contextLost) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = Math.max(5.6, 2.45 / (Math.tan(Math.PI * 34 / 360) * camera.aspect));
      camera.updateProjectionMatrix();
      render();
    }
    new ResizeObserver(resize).observe(host);
    resize();
    host.classList.add('is-ready');

    function tick(time) {
      const delta = Math.min((time - previousTime) / 1000, .06);
      previousTime = time;
      if (!reducedMotion.matches && !pointer && time - lastInteraction > 2200) {
        targetYaw += delta * .18;
      }
      const damping = 1 - Math.exp(-14 * delta);
      model.rotation.y += (targetYaw - model.rotation.y) * damping;
      render();
      const settling = Math.abs(targetYaw - model.rotation.y) > .001;
      frame = !reducedMotion.matches || settling ? requestAnimationFrame(tick) : 0;
    }

    updateMotion = () => {
      if (!visible || document.hidden || contextLost) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame) {
        previousTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    canvas.addEventListener('pointerdown', event => {
      if (pointer || !event.isPrimary || event.button !== 0) return;
      pointer = { id: event.pointerId, x: event.clientX };
      lastInteraction = performance.now();
      canvas.setPointerCapture(event.pointerId);
      updateMotion();
    });
    canvas.addEventListener('pointermove', event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      targetYaw += (event.clientX - pointer.x) * .012;
      pointer.x = event.clientX;
      lastInteraction = performance.now();
      updateMotion();
    });
    function release(event) {
      if (pointer?.id !== event.pointerId) return;
      pointer = null;
      lastInteraction = performance.now();
      updateMotion();
    }
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('lostpointercapture', release);
    canvas.addEventListener('keydown', event => {
      if (event.key === 'Home') targetYaw = initialYaw;
      else if (event.key === 'ArrowLeft') targetYaw -= .25;
      else if (event.key === 'ArrowRight') targetYaw += .25;
      else return;
      event.preventDefault();
      lastInteraction = performance.now();
      updateMotion();
    });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      contextLost = true;
      host.classList.remove('is-ready');
      updateMotion();
    });
    canvas.addEventListener('webglcontextrestored', () => {
      contextLost = false;
      resize();
      host.classList.add('is-ready');
      updateMotion();
    });
    document.addEventListener('visibilitychange', updateMotion);
    reducedMotion.addEventListener('change', updateMotion);
    updateMotion();
  }
})();
