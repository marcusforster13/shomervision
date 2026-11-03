// A geometria: o Shomer Vision do Blender (gabinete com quatro painéis de LED, uma câmera dome em cada face, rodízios,
// a doca com as duas tampas e o drone), o pedestre, o carro e as coberturas no chão. update(s) posa tudo a partir do
// estado de kin.js: as tampas, o drone e as hélices, as domes, o anúncio dos painéis.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {adSlides, loadLogo, mercosulPlate} from './brand.js';
import {CARS, domeAt, FACES, PERSON, SPEC} from './kin.js';
import carSeda from './carro_seda.glb';
import pedestre from './pedestre.glb';
import shomer from './shomer.glb';

const V3 = THREE.Vector3;
const D2R = Math.PI / 180;
const parse = async (b64) => new GLTFLoader().parseAsync(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer, '');
const mesh = (geo, mat, f) => {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  f?.(m);
  return m;
};

export async function buildRig() {
  const root = new THREE.Group();
  const logo = await loadLogo();
  // ------------------------------------------------------------ o Shomer
  const gl = await parse(shomer);
  const model = gl.scene;
  root.add(model);
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) if (m.roughness !== undefined) m.envMapIntensity = 0.7;
  });
  model.updateMatrixWorld(true);
  const byName = (n) => model.getObjectByName(n.replace(/ /g, '_')) ?? model.getObjectByName(n);
  const lidL = byName('Doca | tampa esquerda');
  const lidR = byName('Doca | tampa direita');
  const qL = lidL.quaternion.clone();
  const qR = lidR.quaternion.clone();
  const drone = byName('Drone | decolagem e retorno');
  const drone0 = drone.position.clone();
  const tq = new THREE.Quaternion();
  const Z = new V3(0, 0, 1);

  // as hélices: os ossos de hélice do esqueleto do drone, e um disco translúcido em cada rotor quando giram
  const props = [];
  drone.traverse((o) => o.isBone && /propel/i.test(o.name) && props.push({b: o, q: o.quaternion.clone()}));
  const rotors = [];
  {
    drone.updateMatrixWorld(true);
    const inv = drone.matrixWorld.clone().invert();
    const centers = props.map((p) => p.b.getWorldPosition(new V3()).applyMatrix4(inv));
    // um por osso e o espelhado do outro lado (o lado direito vem do espelhamento da malha)
    const pts = [];
    for (const c of centers) pts.push(c, new V3(-c.x, c.y, c.z));
    const uniq = pts.filter((p, i) => pts.findIndex((q) => q.distanceTo(p) < 0.05) === i);
    const discMat = new THREE.MeshBasicMaterial({color: '#1b1f27', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide});
    for (const p of uniq) {
      const d = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), discMat);
      d.rotation.x = -Math.PI / 2;
      d.position.copy(p).add(new V3(0, 0.012, 0));
      d.renderOrder = 4;
      drone.add(d);
      rotors.push(d);
    }
    rotors.mat = discMat;
  }

  // as domes: o módulo PTZ, a lente e a óptica de cada face giram em torno do centro da cúpula
  const domes = FACES.map((f, k) => {
    const sfx = k === 0 ? '' : ` | face ${k + 1}`;
    const cup = byName(`Camera dome | cupula${sfx}`);
    const c = new THREE.Box3().setFromObject(cup).getCenter(new V3());
    const pivot = new THREE.Group();
    pivot.position.copy(c);
    model.add(pivot);
    pivot.updateMatrixWorld(true);
    for (const n of ['modulo PTZ', 'lente', 'optica']) {
      const o = byName(`Camera dome | ${n}${sfx}`);
      if (o) pivot.attach(o);
    }
    return {pivot, center: c, yaw: f.yaw};
  });

  // os painéis de LED: o anúncio 1 é a arte original; os outros trocam a textura das quatro telas
  const screens = [];
  model.traverse((o) => o.isMesh && /Tela_LED|Tela LED/.test(o.name) && screens.push(o));
  const ledMat = screens[0].material;
  const tex0 = ledMat.map;
  const ads = [tex0, ...adSlides(logo).map((cv) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.flipY = tex0.flipY;
    t.anisotropy = 8;
    return t;
  })];
  ledMat.emissive = new THREE.Color('#ffffff');
  ledMat.emissiveMap = tex0;
  ledMat.emissiveIntensity = 0.85;
  ledMat.roughness = 0.35;

  // ------------------------------------------------------------ o carro (Comrade1280, CC-BY, via projeto Lei Seca)
  const cars = [];
  for (const c of CARS) {
    const g = new THREE.Group();
    const s = (await parse(carSeda)).scene;
    g.add(s);
    const wheels = [];
    s.traverse((o) => {
      if (o.name.startsWith('Roda_')) wheels.push(o);
      if (!o.isMesh) return;
      o.castShadow = true;
      if (/^Body/.test(o.material.name)) {
        o.material = o.material.clone();
        o.material.map = null;
        o.material.color.set(c.color);
      }
    });
    const box = new THREE.Box3().setFromObject(s);
    const tex = new THREE.CanvasTexture(mercosulPlate(c.plate));
    tex.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.MeshStandardMaterial({map: tex, roughness: 0.35, polygonOffset: true, polygonOffsetFactor: -2});
    for (const sg of [1, -1]) g.add(mesh(new THREE.PlaneGeometry(0.4, 0.13), pm, (m) => {
      m.position.set(sg > 0 ? box.max.x + 0.012 : box.min.x - 0.012, 0.45, 0);
      m.rotation.y = (sg * Math.PI) / 2;
    }));
    g.visible = false;
    root.add(g);
    cars.push({g, wheels});
  }

  // ------------------------------------------------------------ o pedestre (Microsoft Rocketbox, MIT, via projeto Lei Seca)
  const ped = {};
  {
    const g = new THREE.Group();
    const gltf = await parse(pedestre);
    g.add(gltf.scene);
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.frustumCulled = false;
    });
    const mixer = new THREE.AnimationMixer(gltf.scene);
    const clip = gltf.animations.find((c) => c.name === 'andando') ?? gltf.animations[0];
    clip.tracks = clip.tracks.filter((t) => !/\.position$/.test(t.name) || !/hips|pelvis|root/i.test(t.name));
    mixer.clipAction(clip).play();
    const ringMat = new THREE.MeshBasicMaterial({color: '#e5484d', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6});
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.52, 48), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    g.add(ring);
    g.visible = false;
    root.add(g);
    Object.assign(ped, {g, mixer, clip, ring, ringMat});
  }

  // ------------------------------------------------------------ coberturas: o leque de cada dome, o raio do drone
  const coverMat = (col, a) => new THREE.MeshBasicMaterial({color: col, transparent: true, opacity: a, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6});
  const cover = new THREE.Group();
  cover.userData.cover = true;
  root.add(cover);
  const fans = FACES.map((f) => {
    const m = coverMat('#2f7fd8', 0.1);
    const geo = new THREE.RingGeometry(0.9, 14, 48, 1, (-SPEC.dome.hfov / 2) * D2R, SPEC.dome.hfov * D2R);
    const fan = new THREE.Mesh(geo, m);
    fan.rotation.x = -Math.PI / 2;
    // o leque aponta para +x da geometria; vira para a direção da face
    fan.rotation.z = (90 - f.yaw) * D2R;
    fan.position.y = 0.012 + f.yaw * 0.00002;
    fan.renderOrder = 2;
    cover.add(fan);
    return {fan, m};
  });
  const beamMat = (col) => new THREE.MeshBasicMaterial({color: col, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide});
  const coneGeo = new THREE.ConeGeometry(1, 1, 4, 1, true);
  coneGeo.rotateY(Math.PI / 4);
  coneGeo.translate(0, -0.5, 0);
  coneGeo.rotateX(-Math.PI / 2);
  const domeBeam = new THREE.Mesh(coneGeo, beamMat('#2f7fd8'));
  const droneBeam = new THREE.Mesh(coneGeo, beamMat('#4b3bc4'));
  for (const b of [domeBeam, droneBeam]) {
    b.renderOrder = 4;
    b.userData.cover = true;
    root.add(b);
  }
  const setBeam = (m, a, b, half, o) => {
    m.visible = o > 0.01;
    m.material.opacity = 0.12 * Math.min(1, o);
    const len = a.distanceTo(b);
    m.position.copy(a);
    m.lookAt(b);
    m.scale.set(Math.tan(half) * len, Math.tan(half) * len * 0.5625, len);
  };

  // ------------------------------------------------------------ a pose
  const right = new V3();
  const tmp = new V3();
  const droneCamPos = new V3();
  const update = (s, opt = {}) => {
    const explode = opt.explode ?? 0;
    const cov = opt.cover ?? 0;
    // a doca: cada tampa gira 90° para o seu lado na dobradiça
    lidL.quaternion.copy(qL).multiply(tq.setFromAxisAngle(Z, s.lids * Math.PI / 2 + explode * 0.4));
    lidR.quaternion.copy(qR).multiply(tq.setFromAxisAngle(Z, -s.lids * Math.PI / 2 - explode * 0.4));
    // o drone: posição, rumo, uma leve inclinação para a frente quando anda; explodida, sobe acima da doca
    const d = s.drone;
    drone.position.set(d.x, d.y + explode * 0.7 * (d.y < SPEC.pad + 0.05 ? 1 : 0), d.z);
    drone.rotation.set(Math.min(0.22, (s.flight.speed ?? 0) * 0.02), d.heading * D2R, 0, 'YXZ');
    const spinA = (s.tau * 70) % (Math.PI * 2);
    for (const p of props) p.b.quaternion.copy(p.q).multiply(tq.setFromAxisAngle(new V3(0, 1, 0), d.spin * spinA));
    rotors.mat.opacity = 0.32 * d.spin;
    // as domes: pan em torno do eixo vertical, tilt para baixo
    domes.forEach((dm, k) => {
      const a = s.domes[k];
      right.set(Math.cos(dm.yaw * D2R), 0, -Math.sin(dm.yaw * D2R));
      dm.pivot.quaternion.setFromAxisAngle(new V3(0, 1, 0), a.pan * D2R).multiply(tq.setFromAxisAngle(right, a.tilt * D2R * 0.6));
    });
    // os anúncios
    const ad = ads[s.ad ?? 0];
    if (ledMat.map !== ad) {
      ledMat.map = ad;
      ledMat.emissiveMap = ad;
      ledMat.needsUpdate = true;
    }
    ledMat.emissiveIntensity = 0.85 + 0.6 * (opt.night ?? 0);
    // o carro
    cars.forEach((c, i) => {
      const p = s.cars[i];
      c.g.visible = !!p;
      if (!p) return;
      c.g.position.set(p.x, 0, p.z);
      c.g.rotation.y = p.dir > 0 ? 0 : Math.PI;
      for (const w of c.wheels) w.rotation.z = -(p.s * CARS[i].v) / 0.3;
    });
    // o pedestre e o anel de alerta
    const pp = s.person;
    ped.g.visible = !!pp;
    if (pp) {
      ped.g.position.set(pp.x, 0, pp.z);
      ped.g.rotation.y = -Math.PI / 2;
      ped.mixer.setTime(pp.s % ped.clip.duration);
      const pulse = 0.6 + 0.4 * Math.sin(s.tau * 7);
      ped.ringMat.opacity = (s.alert ? 0.85 : 0) * pulse;
      ped.ring.scale.setScalar(1 + 0.15 * pulse);
    }
    // coberturas
    cover.visible = cov > 0.01;
    fans.forEach((f, k) => (f.m.opacity = cov * (k === s.active ? 0.2 : 0.08)));
    root.updateMatrixWorld(true);
    const dm = domes[s.active];
    const a = s.domes[s.active];
    const yaw = (dm.yaw + a.pan) * D2R;
    const tilt = a.tilt * D2R;
    const end = s.person && s.seq === 'mission' ? new V3(s.person.x, 1.2, s.person.z) : s.cars[0] && a.track ? new V3(s.cars[0].x, 0.8, s.cars[0].z) : tmp.copy(dm.center).add(new V3(Math.sin(yaw) * Math.cos(tilt) * 10, -Math.sin(tilt) * 10, Math.cos(yaw) * Math.cos(tilt) * 10));
    const hf = Math.atan(Math.tan((SPEC.dome.hfov / 2) * D2R) / a.zoom);
    setBeam(domeBeam, dm.center, end, hf, cov);
    drone.getWorldPosition(droneCamPos);
    const tgt = d.target ? new V3(d.target.x, 1, d.target.z) : new V3(droneCamPos.x, 0, droneCamPos.z + 0.01);
    setBeam(droneBeam, droneCamPos, tgt, (SPEC.drone.hfov / 2) * D2R * 0.6, cov * (s.flight.flying ? 1 : 0));
  };

  const anchors = {
    dome: () => domes[0].center.clone(),
    dome2: () => domes[1].center.clone(),
    led: () => new V3(0, 1.5, 0.78),
    ledSide: () => new V3(0.78, 1.5, 0),
    dock: () => new V3(-0.2, 3.1, 0.52),
    lid: () => new THREE.Box3().setFromObject(lidL).getCenter(new V3()),
    drone: () => drone.getWorldPosition(new V3()).add(new V3(0, 0.06, 0)),
    wind: () => byName('Doca | sensor vento').getWorldPosition(new V3()),
    caster: () => new V3(0.59, 0.07, 0.59),
    estop: () => new V3(-0.3, 3.19, 0.57),
    person: () => ped.g.localToWorld(new V3(0, 1.95, 0)),
  };
  return {root, model, update, anchors, drone, droneCamPos, domes, lidL, lidR, cars, ped, ads};
}
