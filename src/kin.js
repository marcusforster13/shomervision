// A matemática do Shomer Vision: dimensões, uma entrada (a sequência e o tempo dentro dela) e todas as poses e leituras
// como função dela. Nada de three.js aqui. Mundo em metros: o totem na origem, y para cima, a frente (+z) virada para a
// rua (faixas em z = 5,75 e 9,25), a calçada entre o totem e a guia (z < 4).

const D2R = Math.PI / 180;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smoother = (x) => {
  const u = clamp(x, 0, 1);
  return u * u * u * (u * (u * 6 - 15) + 10);
};
export const ss = (a, b, t) => smoother((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;

// ------------------------------------------------------------ especificações (modelo representativo)
export const SPEC = {
  totem: {w: 1.365, h: 2.82},
  led: {n: 4, w: 1.138, h: 2.11, nits: 2500, slot: 7},
  dome: {n: 4, hfov: 100, mp: 4, px: 2688, y: 2.65, r: 0.8},
  pad: 3.345, // altura da pista de pouso
  drone: {name: 'DJI Mavic 3 Classic', hfov: 84, px: 5280, cruise: 8, climb: 3, alt: 10.5, flightMin: 46},
  lane: [5.75, 9.25],
  curb: 4.0,
  carLen: 4.4,
};
export const FACES = [
  {name: 'FRENTE', yaw: 0},
  {name: 'DIREITA', yaw: 90},
  {name: 'FUNDOS', yaw: 180},
  {name: 'ESQUERDA', yaw: 270},
];
/** A posição e a direção (para fora) da câmera dome da face k. Yaw 0 = +z (a rua), 90 = +x. */
export const domeAt = (k) => {
  const a = FACES[k].yaw * D2R;
  return {x: Math.sin(a) * SPEC.dome.r, y: SPEC.dome.y, z: Math.cos(a) * SPEC.dome.r, yaw: FACES[k].yaw};
};

// ------------------------------------------------------------ o carro (vigiar) e o pedestre (missão)
export const CARS = [{plate: 'SHM2A26', model: 'seda', len: 4.36, color: '#c9ced6', lane: 0, dir: 1, v: 36 / 3.6, t0: 2.0, x0: -60}];
export const PERSON = {x0: 24, z: 2.6, v: 0.85, head: 1.62};
export function carAt(c, tau) {
  const s = tau - c.t0;
  if (s < 0) return null;
  const x = c.x0 + c.dir * c.v * s;
  if (Math.abs(x) > 70) return null;
  return {x, z: SPEC.lane[c.lane], dir: c.dir, s};
}

// ------------------------------------------------------------ sequências
export const SEQ = {
  patrol: {dur: 26, from: 'VIGILÂNCIA', to: 'FIM DO CICLO'},
  mission: {dur: 48, from: 'DETECÇÃO', to: 'DRONE NA DOCA'},
  round: {dur: 40, from: 'DECOLAGEM', to: 'POUSO'},
};
// a missão: a dome da direita vê a pessoa, a doca abre, o drone decola, vai até a pessoa, acompanha, volta e pousa
export const MISSION_T = {detect: 0.8, open: [4.0, 6.6], spin: [6.6, 7.8], climb: [7.8, 12.2], go: [12.2, 17.2], follow: [17.2, 29.6], back: [29.6, 34.6], land: [34.6, 39.6], stop: [39.6, 40.4], close: [40.4, 43.0]};
// a ronda: decola e dá duas voltas em torno do totem, a 18 m de raio
export const ROUND_T = {open: [0.4, 3.0], spin: [3.0, 4.2], climb: [4.2, 8.4], out: [8.4, 11.4], orbit: [11.4, 28.4], in: [28.4, 31.4], land: [31.4, 36.2], stop: [36.2, 37.0], close: [37.0, 39.6]};
const ROUND_R = 18;

const personAt = (tau) => ({x: PERSON.x0 - PERSON.v * tau, z: PERSON.z + 0.5 * Math.sin(tau * 0.25), s: tau});

/** A posição do drone (x, y, z), o rumo (graus) e a hélice (0..1) numa sequência. */
function droneAt(seq, tau) {
  const home = {x: 0, y: SPEC.pad, z: 0};
  if (seq === 'mission') {
    const T = MISSION_T;
    const p = personAt(tau);
    const over = (q) => ({x: q.x, y: SPEC.drone.alt, z: q.z + 3});
    const up = {x: 0, y: SPEC.drone.alt, z: 0};
    let pos = home;
    if (tau >= T.climb[0]) pos = {x: 0, y: lerp(SPEC.pad, SPEC.drone.alt, ss(...T.climb, tau)), z: 0};
    if (tau >= T.go[0]) {
      const a = over(personAt(T.go[1]));
      const k = ss(...T.go, tau);
      pos = {x: lerp(up.x, a.x, k), y: SPEC.drone.alt, z: lerp(up.z, a.z, k)};
    }
    if (tau >= T.follow[0]) pos = over(p);
    if (tau >= T.back[0]) {
      const a = over(personAt(T.back[0]));
      const k = ss(...T.back, tau);
      pos = {x: lerp(a.x, 0, k), y: SPEC.drone.alt, z: lerp(a.z, 0, k)};
    }
    if (tau >= T.land[0]) pos = {x: 0, y: lerp(SPEC.drone.alt, SPEC.pad, ss(...T.land, tau)), z: 0};
    const spin = ss(...T.spin, tau) * (1 - ss(...T.stop, tau));
    const heading = tau < T.back[0] ? Math.atan2(over(personAt(T.go[1])).x, over(personAt(T.go[1])).z) / D2R : tau < T.land[0] ? 180 + Math.atan2(over(personAt(T.back[0])).x, over(personAt(T.back[0])).z) / D2R : 0;
    const flying = tau >= T.climb[0] && tau < T.land[1];
    return {...pos, heading: flying ? heading : 0, spin, target: tau >= T.go[0] && tau < T.back[0] ? p : null};
  }
  if (seq === 'round') {
    const T = ROUND_T;
    let pos = home;
    if (tau >= T.climb[0]) pos = {x: 0, y: lerp(SPEC.pad, SPEC.drone.alt + 4, ss(...T.climb, tau)), z: 0};
    const ang = (u) => (u * 2 * 360) * D2R; // duas voltas
    const orbitK = (tau - T.orbit[0]) / (T.orbit[1] - T.orbit[0]);
    const onRing = (a) => ({x: Math.sin(a) * ROUND_R, y: SPEC.drone.alt + 4, z: Math.cos(a) * ROUND_R});
    if (tau >= T.out[0]) {
      const k = ss(...T.out, tau);
      const a = onRing(0);
      pos = {x: lerp(0, a.x, k), y: a.y, z: lerp(0, a.z, k)};
    }
    if (tau >= T.orbit[0]) pos = onRing(ang(clamp(orbitK, 0, 1)));
    if (tau >= T.in[0]) {
      const a = onRing(ang(1));
      const k = ss(...T.in, tau);
      pos = {x: lerp(a.x, 0, k), y: a.y, z: lerp(a.z, 0, k)};
    }
    if (tau >= T.land[0]) pos = {x: 0, y: lerp(SPEC.drone.alt + 4, SPEC.pad, ss(...T.land, tau)), z: 0};
    const spin = ss(...T.spin, tau) * (1 - ss(...T.stop, tau));
    const heading = tau >= T.orbit[0] && tau < T.in[0] ? ang(clamp(orbitK, 0, 1)) / D2R + 90 : 0;
    return {...pos, heading, spin, target: null};
  }
  return {...home, heading: 0, spin: 0, target: null};
}

function lidsAt(seq, tau) {
  if (seq === 'mission') return ss(...MISSION_T.open, tau) * (1 - ss(...MISSION_T.close, tau));
  if (seq === 'round') return ss(...ROUND_T.open, tau) * (1 - ss(...ROUND_T.close, tau));
  return 0;
}

/** O estado completo de uma sequência no instante tau: tudo que move e tudo que os painéis mostram. */
export function stateAt(seq, tau) {
  const drone = droneAt(seq, tau);
  const lids = lidsAt(seq, tau);
  const out = {seq, tau, lids, drone, domes: [], active: 0, cars: [], person: null, alert: null, reads: []};
  // as quatro domes: cada uma varre ±35° em torno da sua face; a ativa segue o alvo
  for (let k = 0; k < 4; k++) out.domes.push({pan: 35 * Math.sin(tau * 0.35 + k * 1.7), tilt: 18, zoom: 1, track: false});
  const aimDome = (k, q, y, frame = 1.6) => {
    const d = domeAt(k);
    const dx = q.x - d.x;
    const dz = q.z - d.z;
    const g = Math.hypot(dx, dz);
    let rel = Math.atan2(dx, dz) / D2R - d.yaw;
    rel = ((((rel + 180) % 360) + 360) % 360) - 180;
    const dist = Math.hypot(g, d.y - y);
    const want = 2 * Math.atan(frame / 2 / dist);
    const zoom = clamp(Math.tan((SPEC.dome.hfov / 2) * D2R) / Math.tan(want / 2), 1, 12);
    return {pan: clamp(rel, -80, 80), tilt: Math.atan2(d.y - y, g) / D2R, zoom, track: Math.abs(rel) < 80, d: dist};
  };
  const faceOf = (q) => {
    const a = ((Math.atan2(q.x, q.z) / D2R) % 360 + 360) % 360;
    return Math.round(a / 90) % 4;
  };
  if (seq === 'patrol') {
    const c = carAt(CARS[0], tau);
    out.cars = [c ? {...c, i: 0} : null];
    if (c && Math.abs(c.x) < 40) {
      out.active = 0;
      out.domes[0] = aimDome(0, c, 0.8, 7);
    }
  }
  if (seq === 'mission') {
    const p = personAt(tau);
    out.person = p;
    const k = faceOf(p);
    out.active = k;
    const a = aimDome(k, p, PERSON.head);
    const lock = ss(0, 0.8, tau);
    out.domes[k] = {...a, pan: lerp(out.domes[k].pan, a.pan, lock), zoom: lerp(1, a.zoom, lock)};
    if (tau >= MISSION_T.detect) out.alert = {t: MISSION_T.detect, age: tau - MISSION_T.detect, face: k};
  }
  // o drone: altura sobre o chão, distância da doca, velocidade (derivada do mesmo modelo), bateria, tempo de voo
  const n = droneAt(seq, Math.min(SEQ[seq].dur, tau + 0.05));
  const v = Math.hypot(n.x - drone.x, n.y - drone.y, n.z - drone.z) / 0.05;
  const T = seq === 'mission' ? MISSION_T : seq === 'round' ? ROUND_T : null;
  const airborne = T ? clamp(tau - T.climb[0], 0, (T.land[1] ?? 0) - T.climb[0]) : 0;
  out.flight = {alt: drone.y, agl: drone.y - SPEC.pad, dist: Math.hypot(drone.x, drone.z), speed: tau + 0.05 <= SEQ[seq].dur ? v : 0, battery: 0.97 - airborne / (SPEC.drone.flightMin * 60), time: airborne, flying: drone.y > SPEC.pad + 0.05};
  // o anúncio no painel LED
  out.ad = Math.floor(tau / SPEC.led.slot) % 4;
  out.adAge = tau % SPEC.led.slot;
  return out;
}

/** Uma linha curta para o painel de estado. */
export function statusOf(s) {
  const f = s.flight;
  const alt = `${f.agl.toFixed(1).replace('.', ',')} m`;
  if (s.seq === 'mission') {
    const T = MISSION_T;
    if (s.tau < T.open[0]) return ['Pessoa detectada', `DOME ${FACES[s.active].name} · ACIONANDO O DRONE`, 'alert'];
    if (s.tau < T.spin[0]) return ['Abrindo a doca', 'TAMPAS A 90° PARA OS LADOS', 'move'];
    if (s.tau < T.go[0]) return ['Decolando', `DRONE A ${alt}`, 'move'];
    if (s.tau < T.follow[0]) return ['A caminho do alvo', `${Math.round(f.speed)} m/s · ${Math.round(f.dist)} m DA DOCA`, 'move'];
    if (s.tau < T.back[0]) return ['Acompanhando a pessoa', 'IMAGEM AO VIVO NA CENTRAL', 'alert'];
    if (s.tau < T.land[0]) return ['Voltando à doca', `${Math.round(f.dist)} m DA DOCA`, 'move'];
    if (s.tau < T.close[0]) return ['Pousando', `DRONE A ${alt}`, 'move'];
    if (s.tau < T.close[1]) return ['Fechando a doca', 'DRONE PROTEGIDO', 'move'];
    return ['Drone recarregando', `BATERIA ${Math.round(f.battery * 100)}%`, 'ok'];
  }
  if (s.seq === 'round') {
    const T = ROUND_T;
    if (s.tau < T.spin[0]) return ['Abrindo a doca', 'RONDA AÉREA PROGRAMADA', 'move'];
    if (s.tau < T.orbit[0]) return ['Decolando', `DRONE A ${alt}`, 'move'];
    if (s.tau < T.in[0]) return ['Ronda aérea', `RAIO DE ${ROUND_R} m · ${alt} DE ALTURA`, 'ok'];
    if (s.tau < T.close[0]) return ['Pousando', `DRONE A ${alt}`, 'move'];
    if (s.tau < T.close[1]) return ['Fechando a doca', 'DRONE PROTEGIDO', 'move'];
    return ['Drone recarregando', `BATERIA ${Math.round(f.battery * 100)}%`, 'ok'];
  }
  if (s.cars[0] && Math.abs(s.cars[0].x) < 40) return ['Veículo na área', 'DOME FRENTE ACOMPANHANDO', 'ok'];
  return ['Vigilância 360°', '4 DOMES · PAINÉIS COM ANÚNCIOS', 'ok'];
}

/** A legenda da barra de operação: uma frase por cena e o instante em que ela começou. */
export function captionOf(s) {
  const {seq, tau} = s;
  const seg = (list) => {
    let cur = list[0];
    for (const x of list) if (tau >= x[0]) cur = x;
    return {text: cur[1], t0: cur[0]};
  };
  if (seq === 'mission') {
    const T = MISSION_T;
    return seg([
      [0, `A câmera da face ${FACES[s.active].name.toLowerCase()} detecta uma pessoa.`],
      [T.open[0], 'A doca abre as duas tampas para os lados.'],
      [T.spin[0], 'O drone liga as hélices e decola da doca.'],
      [T.go[0], `O drone voa até o local, a ${SPEC.drone.alt - SPEC.pad > 10 ? Math.round(SPEC.drone.alt) : 10} metros de altura.`],
      [T.follow[0], 'O drone acompanha a pessoa e envia a imagem à central.'],
      [T.follow[0] + 6, 'A câmera do totem e a do drone mostram a mesma cena.'],
      [T.back[0], 'Missão cumprida: o drone volta sozinho para a doca.'],
      [T.land[0], 'Pouso de precisão na pista da doca.'],
      [T.close[0], 'A doca fecha e o drone começa a recarregar.'],
    ]);
  }
  if (seq === 'round') {
    const T = ROUND_T;
    return seg([
      [0, 'Ronda aérea programada: a doca abre.'],
      [T.spin[0], 'O drone decola e sobe acima do totem.'],
      [T.orbit[0], 'Duas voltas de ronda em volta do totem, a 18 metros.'],
      [T.orbit[0] + 8, 'Do alto, o drone vê o que as câmeras do totem não alcançam.'],
      [T.in[0], 'Fim da ronda: retorno e pouso automático.'],
      [T.close[0], 'Doca fechada: drone protegido e recarregando.'],
    ]);
  }
  const c = s.cars[0];
  return seg([
    [0, 'Quatro painéis de LED mostram os anúncios dos parceiros.'],
    [CARS[0].t0 + 3, 'Uma câmera dome em cada face: vigilância de 360°.'],
    [CARS[0].t0 + 6.5, c ? 'A câmera da frente acompanha o veículo na rua.' : 'As câmeras gravam e enviam tudo para a central.'],
    [16, 'Publicidade e segurança no mesmo equipamento.'],
  ]);
}

/** A fase escrita na barra de operação (o texto técnico, para o rodapé da legenda). */
export function phaseOf(seq, tau) {
  return seq === 'mission' ? 'MISSÃO DO DRONE' : seq === 'round' ? 'RONDA AÉREA' : 'VIGILÂNCIA';
}
