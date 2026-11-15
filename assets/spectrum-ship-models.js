import * as THREE from './vendor/three/three.module.min.js';

const crossSection = [
  [-.55, .5], [.55, .5], [1, .21], [1, -.21],
  [.55, -.5], [-.55, -.5], [-1, -.21], [-1, .21],
];

function metal(color, roughness = .58) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: .28, flatShading: true });
}
function emission(color, intensity = 1.4) {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: .42 });
}
function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  parent.add(part);
  return part;
}
function box(group, material, x, y, z, width, height, length) {
  return mesh(group, new THREE.BoxGeometry(width, height, length), material, x, y, z);
}

function loft(group, sections, materials, x = 0, y = 0) {
  const rows = sections.map(([z, width, height, offset = 0]) =>
    crossSection.map(([u, v]) => [u * width, v * height + offset, z]));
  const vertices = [];
  const geometry = new THREE.BufferGeometry();

  function face(points, material) {
    const first = vertices.length / 3;
    for (let index = 1; index < points.length - 1; index++) {
      vertices.push(...points[0], ...points[index], ...points[index + 1]);
    }
    geometry.addGroup(first, vertices.length / 3 - first, material);
  }

  for (let index = 0; index < rows.length - 1; index++) {
    const back = rows[index];
    const front = rows[index + 1];
    for (let side = 0; side < back.length; side++) {
      const next = (side + 1) % back.length;
      const material = side === 0 ? 0 : side === 1 || side === 7 ? 1 : 2;
      face([back[next], back[side], front[side], front[next]], material);
    }
  }
  face(rows[0], 2);
  face([...rows.at(-1)].reverse(), 1);
  // Consolidate the facets into the three material groups used on each hull.
  const grouped = [];
  const groups = [...geometry.groups];
  geometry.clearGroups();
  for (let material = 0; material < 3; material++) {
    const start = grouped.length / 3;
    for (const range of groups) {
      if (range.materialIndex === material) grouped.push(...vertices.slice(range.start * 3, (range.start + range.count) * 3));
    }
    geometry.addGroup(start, grouped.length / 3 - start, material);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(grouped, 3));
  geometry.computeVertexNormals();
  return mesh(group, geometry, materials, x, y);
}

function plate(group, points, y, depth, materials) {
  const shape = new THREE.Shape();
  shape.moveTo(...points[0]);
  for (const point of points.slice(1)) shape.lineTo(...point);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: false, steps: 1, curveSegments: 1,
  });
  geometry.rotateX(Math.PI / 2);
  return mesh(group, geometry, materials, 0, y + depth / 2, 0);
}

function engine(group, paints, x, y, z, radius, length) {
  const barrel = mesh(group, new THREE.CylinderGeometry(radius * .83, radius, length, 12), paints.dark, x, y, z);
  barrel.rotation.x = Math.PI / 2;
  const exhaustZ = z - length / 2;
  mesh(group, new THREE.TorusGeometry(radius * .86, radius * .12, 5, 14), paints.edge, x, y, exhaustZ);
  const inner = mesh(group, new THREE.CircleGeometry(radius * .73, 14), paints.thrust, x, y, exhaustZ - .015);
  inner.rotation.y = Math.PI;
  const core = mesh(group, new THREE.CircleGeometry(radius * .41, 12), paints.core, x, y, exhaustZ - .027);
  core.rotation.y = Math.PI;
}

function canopy(group, paints, z, y, width = .34, length = 1) {
  loft(group, [
    [z - .60 * length, width * .26, .07, -.04],
    [z - .41 * length, width, .24, .04],
    [z + .15 * length, width * .91, .29, .08],
    [z + .60 * length, width * .27, .055, -.025],
  ], [paints.glassLight, paints.glass, paints.dark], 0, y);
  box(group, paints.edge, 0, y + .207, z + .05, width * 1.63, .043, .055);
}

function sidePair(group, shape, y, depth, materials) {
  plate(group, shape, y, depth, materials);
  plate(group, shape.map(([x, z]) => [-x, z]), y, depth, materials);
}
function vents(group, paints, x, y, z, count, width) {
  for (let row = 0; row < count; row++) box(group, paints.dark, x, y, z + row * .13, width, .025, .048);
}
function navigationLights(group, paints, width, z, y) {
  box(group, paints.signal, -width, y, z, .12, .065, .15);
  box(group, paints.thrust, width, y, z, .12, .065, .15);
}

function kestrel(group, p) {
  loft(group, [[-1.72,.54,.49],[-1.05,.67,.65],[-.06,.55,.63],[1.15,.35,.33],[2.08,.065,.10]], p.hull);
  sidePair(group, [[.36,.99],[1.98,-.62],[2.13,-1.12],[.92,-1.52],[.45,-1.10]], -.01, .12, [p.body,p.dark]);
  sidePair(group, [[.68,.57],[1.90,-.56],[2.02,-.83],[1.38,-.91]], .061, .03, [p.accent,p.dark]);
  canopy(group,p,.48,.34,.30,1.06);

  for (const sign of [-1,1]) {
    const x=sign*.63;
    loft(group,[[-1.76,.26,.48],[-1.29,.32,.49],[-.52,.25,.29],[-.13,.09,.10]],p.hull,x,-.07);
    engine(group,p,x,-.10,-1.63,.26,.52);
    const fin=box(group,p.accent,sign*.69,.48,-1.06,.085,.54,.48);
    fin.rotation.z=-sign*.25;
    vents(group,p,sign*.45,.289,-.88,3,.27);
  }
  navigationLights(group,p,1.89,-.82,.07);
  box(group,p.accent,0,.21,1.18,.15,.022,.30);
}

function tern(group, p) {
  loft(group,[[-1.64,.33,.45],[-.78,.47,.44],[.4,.38,.38],[1.62,.17,.17],[2.05,.07,.075]],p.hull);
  sidePair(group, [[.29,.66],[1.53,.29],[1.78,-1.04],[1.16,-1.29],[.68,-.49],[.29,-.61]],-.01,.09,[p.body,p.dark]);
  sidePair(group, [[.58,.43],[1.46,.22],[1.54,-.19],[.75,-.06]], .045,.024,[p.accent,p.dark]);
  canopy(group,p,.64,.21,.24,.96);
  for(const sign of [-1,1]) {
    loft(group,[[-1.39,.20,.30],[-.51,.27,.32],[.27,.23,.28],[.63,.08,.11]],p.hull,sign*1.31,-.005);
    engine(group,p,sign*1.31,-.02,-1.23,.19,.47);
    box(group,p.accent,sign*1.31,.165,-.45,.19,.04,.48);
    vents(group,p,sign*.29,.24,-.79,3,.16);
  }
  engine(group,p,0,-.02,-1.47,.25,.49);
  navigationLights(group,p,1.52,.08,.12);
}

function atlas(group, p) {
  loft(group,[[-2.12,.59,.56],[-1.42,.57,.63],[.46,.62,.62],[1.52,.66,.53],[2.01,.30,.34]],p.hull);
  const bridge=[p.edge,p.body,p.dark];
  loft(group, [[.77,.43,.32],[1.24,.52,.57],[1.70,.52,.49],[1.97,.40,.22]],bridge,0,.37);
  loft(group, [[1.50,.36,.20],[1.84,.36,.24],[2.00,.30,.16]], [p.glassLight,p.glass,p.dark],0,.54);
  box(group,p.accent,0,.397,.31,.22,.055,1.32);
  for(const sign of [-1,1]) {
    const x=sign*1.10;
    loft(group,[[-1.70,.39,.65],[-1.38,.52,.77],[.73,.52,.77],[1.08,.36,.60]],p.hull,x,-.12);
    loft(group,[[-1.36,.43,.38],[-1.27,.45,.45],[.67,.45,.45],[.82,.38,.36]],[p.accent,p.body,p.dark],x,.27);
    for(let i=0;i<5;i++){
      box(group,p.edge,x,.529,-1.22+i*.41,.86,.075,.13);
      box(group,p.dark,sign*1.605,-.08,-1.22+i*.41,.054,.32,.095);
    }
    engine(group,p,x,-.10,-1.72,.30,.59);
    vents(group,p,sign*.42,.336,-1.29,5,.19);
  }
  engine(group,p,0,-.04,-1.99,.32,.52);
  navigationLights(group,p,1.56,.58,.22);
}

function meridian(group, p) {
  loft(group,[[-1.46,.46,.48],[-.59,.49,.55],[.48,.53,.44],[1.51,.39,.28],[2.05,.12,.12]],p.hull);
  canopy(group,p,.59,.25,.33,1.02);
  sidePair(group,[[.43,.51],[1.11,.80],[1.96,.12],[1.80,-.64],[1.31,-1.25],[1.17,-.64],[1.42,-.05],[1.07,.39],[.43,.17]],0,.11,[p.body,p.dark]);
  sidePair(group,[[1.22,.45],[1.90,.11],[1.79,-.40],[1.63,-.22],[1.63,.06]],.060,.034,[p.accent,p.dark]);
  for(const sign of [-1,1]) {
    loft(group,[[-1.49,.21,.32],[-.96,.33,.31],[-.43,.33,.26],[.04,.19,.18]],p.hull,sign*1.26,-.04);
    engine(group,p,sign*1.26,-.05,-1.33,.235,.51);
    box(group,p.edge,sign*1.27,.18,-.83,.33,.05,.50);
    vents(group,p,sign*.26,.27,-.89,3,.18);
  }
  engine(group,p,0,-.05,-1.36,.29,.48);
  navigationLights(group,p,1.75,-.10,.075);
  mesh(group,new THREE.SphereGeometry(.14,8,6),p.glassLight,0,.29,1.52);
}

const designs = {
  kestrel: { build:kestrel, metal:0x80908d, side:0x4e6167, accent:0xc17f49, exhaust:0x67bed3 },
  tern: { build:tern, metal:0x919eaa, side:0x3c5967, accent:0x76a697, exhaust:0x75ead8 },
  atlas: { build:atlas, metal:0x8a8773, side:0x5b5b51, accent:0xbc8d39, exhaust:0xe7a26d },
  meridian: { build:meridian, metal:0x718e9a, side:0x456277, accent:0x78abc2, exhaust:0x7fd7f0 },
};

export function createShip(id) {
  const design=designs[id];
  const body=metal(design.metal);
  const edge=metal(design.side);
  const dark=metal(0x303943);
  const paints={
    body,edge,dark,
    hull:[body,edge,dark],
    accent:metal(design.accent,.65),
    glass:metal(0x182d38,.31),
    glassLight:metal(0x427481,.36),
    signal:emission(0xeb8f52,.70),
    thrust:emission(design.exhaust,1.04),
    core:emission(0xcaeff3,1.55),
  };
  const ship=new THREE.Group();
  design.build(ship,paints);
  return ship;
}

export function lightHangar(scene) {
  scene.add(new THREE.HemisphereLight(0xe2f1eb,0x5a6874,1.65));
  const key=new THREE.DirectionalLight(0xffeccc,2.6);
  key.position.set(-4,6,4);
  const fill=new THREE.DirectionalLight(0x7ebcc9,2.0);
  fill.position.set(4,2,-5);
  scene.add(key,fill);
}
