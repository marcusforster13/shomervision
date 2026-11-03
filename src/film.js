// O filme do Shomer Vision: o totem com os anúncios e as quatro domes; o carro passando; as câmeras de perto; a missão
// do drone (detecção, a doca abre, decolagem, acompanhamento do alto, à noite, retorno, pouso, a doca fecha); a vista
// explodida. Uma função pura de t: o mesmo SCRIPT vira o passeio automático da página ao vivo.
import * as THREE from 'three';
import {runSim} from 'teardown-kit/runtime.js';
import {createConsole, DISPLAY, FEED} from './console.js';
import {captionOf, phaseOf, SEQ, stateAt, statusOf} from './kin.js';
import {createXptoStage} from './stage.js';

export const SCRIPT = [
  // o totem: publicidade e vigilância
  {t: 0, seq: 'patrol', view: 'hero'},
  {t: 1.6, display: 'labels'},
  {t: 6.0, display: 'labels'},
  // o carro na rua, acompanhado pela dome da frente
  {t: 6.2, view: 'rua'},
  {t: 6.8, display: 'cover'},
  // as câmeras de perto, com os nomes
  {t: 13.0, view: 'cameras'},
  {t: 13.4, display: 'labels'},
  {t: 19.4, display: 'labels'},
  // a missão: a dome vê a pessoa
  {t: 19.8, view: 'alvo'},
  {t: 21.0, seq: 'mission'},
  // a doca abre e o drone decola
  {t: 23.8, view: 'doca'},
  // o drone sobe e vai até o local
  {t: 30.0, view: 'drone'},
  // do alto, o drone acompanha a pessoa; parte à noite
  {t: 36.0, view: 'alvo'},
  {t: 43.6, display: 'night'},
  {t: 50.2, display: 'night'},
  // volta, pousa e a doca fecha
  {t: 50.8, view: 'drone'},
  {t: 55.4, view: 'doca'},
  {t: 55.8, display: 'cover'},
  // a vista explodida, com os nomes
  {t: 64.6, view: 'hero'},
  {t: 65.0, display: 'labels'},
  {t: 65.4, display: 'exploded'},
  {t: 71.2, display: 'exploded'},
  {t: 71.8, display: 'labels'},
  {t: 72.0, display: 'orbit'},
];
export const DURATION = 78;
export const DEFAULTS = {duration: DURATION, fps: 60, theme: 'light', hud: {enabled: false, title: 'shomer', subtitle: ''}, director: {enabled: false}, watermark: ''};
const D2R = Math.PI / 180;
const smoother = (x) => {
  const u = Math.min(1, Math.max(0, x));
  return u * u * u * (u * (u * 6 - 15) + 10);
};
export const ss = (a, b, t) => smoother((t - a) / (b - a));

// ------------------------------------------------------------ a sequência e a exibição no instante t do filme
export const seqAt = (t) => {
  const e = SCRIPT.filter((x) => x.seq && x.t <= t).pop();
  return {seq: e.seq, tau: Math.min(SEQ[e.seq].dur, t - e.t)};
};
export const displayAt = (t) => {
  const out = Object.fromEntries(DISPLAY.map((k) => [k, 0]));
  for (const e of SCRIPT) if (e.display && e.t <= t) out[e.display] = out[e.display] ? 0 : 1;
  return out;
};
const lastFlip = (key, t) => SCRIPT.filter((e) => e.display === key && e.t <= t).pop()?.t ?? -9;
export const easedDisplay = (key, t, dur = 0.7) => {
  const on = displayAt(t)[key];
  const k = ss(lastFlip(key, t), lastFlip(key, t) + dur, t);
  return on ? k : 1 - k;
};
/** O estado do Shomer e a velocidade de pan da dome ativa (derivada numérica do mesmo modelo). */
export const mechAt = (seq, tau) => {
  const m = stateAt(seq, tau);
  const n = stateAt(seq, Math.min(SEQ[seq].dur, tau + 0.04));
  const d = (n.domes[m.active].pan - m.domes[m.active].pan) / 0.04;
  return {m, panRate: tau + 0.04 <= SEQ[seq].dur ? d : 0};
};

// ------------------------------------------------------------ vistas: {tx, ty, tz, az, el, d (graus, m), sx, sy, drone}
// drone: 1 soma a posição do drone ao alvo (a câmera acompanha o drone)
export const VIEW_FN = {
  hero: (u) => ({tx: 0, ty: 1.95, tz: 0, az: 34 + 1.2 * u, el: 10, d: 10.5, sx: 10, sy: -18}),
  // atrás do totem, olhando a rua por onde o carro vem: o totem, o leque da dome e o carro chegando
  rua: (u) => ({tx: -6, ty: 1.4, tz: 4.2, az: 112 - 0.6 * u, el: 14, d: 19, sx: 10, sy: -20}),
  cameras: (u) => ({tx: 0, ty: 2.85, tz: 0, az: 28 + 2 * u, el: 10, d: 6.4, sx: 10, sy: -20}),
  doca: (u) => ({tx: 0, ty: 3.35, tz: 0, az: 26 + 1.5 * u, el: 18, d: 3.6, sx: 10, sy: -22}),
  drone: (u) => ({tx: 0, ty: 0.1, tz: 0, az: 32 + 2 * u, el: 14, d: 3.4, sx: 10, sy: -20, drone: 1}),
  // o totem, a pessoa e o drone no mesmo quadro
  alvo: (u) => ({tx: 9.5, ty: 5.6, tz: 3, az: 12 + 0.5 * u, el: 9, d: 34, sx: 10, sy: -20}),
  ceu: (u) => ({tx: 0, ty: 5, tz: 0, az: 30 + 1 * u, el: 30, d: 46, sx: 10, sy: -16}),
  planta: (u) => ({tx: 2, ty: 0, tz: 3, az: 2 * u, el: 82, d: 34, sx: 10, sy: -16}),
};
/** Uma vista com o alvo em coordenadas do mundo: as vistas do drone somam a posição dele. */
export const absView = (c, d) => (c.drone ? {...c, tx: c.tx + d.x, ty: c.ty + d.y, tz: c.tz + d.z, drone: 0} : c);
const VIEWS_T = SCRIPT.filter((e) => e.view).map((e) => [e.t, e.view]);
// no meio de uma troca de vista o olhar curva na direção da torre, para a câmera nunca atravessar rua vazia
const TOWER = {tx: 0, ty: 2.4, tz: 0};
const blend = (a, b, k, pullOn = 1) => {
  const o = {};
  for (const key in b) o[key] = key === 'az' ? a.az + ((((b.az - a.az + 540) % 360) - 180) * k) : a[key] + (b[key] - a[key]) * k;
  const pull = Math.sin(Math.PI * k) * 0.75 * pullOn;
  for (const key of ['tx', 'ty', 'tz']) o[key] += (TOWER[key] - o[key]) * pull;
  // e afasta um pouco, para a torre caber inteira enquanto gira
  o.d = Math.exp(Math.log(a.d) + (Math.log(b.d) - Math.log(a.d)) * k) + Math.sin(Math.PI * k) * 3;
  return o;
};
export const BLEND = 2.4;
export const camAt = (t, orbit = 0) => {
  let i = 0;
  while (i < VIEWS_T.length - 1 && VIEWS_T[i + 1][0] <= t) i++;
  const {seq, tau} = seqAt(t);
  const h = stateAt(seq, tau).drone;
  const cur = absView(VIEW_FN[VIEWS_T[i][1]](t - VIEWS_T[i][0]), h);
  let o = cur;
  if (i > 0) {
    const k = ss(VIEWS_T[i][0], VIEWS_T[i][0] + BLEND, t);
    const prev = VIEW_FN[VIEWS_T[i - 1][1]](t - VIEWS_T[i - 1][0]);
    // nas trocas que envolvem a vista do drone o olhar não curva para o totem: o drone pode estar no alto
    const pullOn = prev.drone || VIEW_FN[VIEWS_T[i][1]](0).drone ? 0 : 1;
    if (k < 1) o = blend(absView(prev, h), cur, k, pullOn);
  }
  if (orbit > 0) o = {...o, az: o.az + 9 * Math.max(0, t - lastFlip('orbit', t)) * orbit};
  return o;
};
export const viewAt = (t) => VIEWS_T.filter(([a]) => a <= t).pop();

// ------------------------------------------------------------ o ponteiro do operador
const REST = [[860, 470], [760, 420], [940, 520], [820, 380]];
export function makeCursor(ui) {
  const EV = SCRIPT.filter((e) => e.t > 0).flatMap((e) => {
    const out = [];
    if (e.seq) out.push({t: e.t, spot: ui.spots[e.seq]});
    if (e.view) out.push({t: e.t + (e.seq ? 0.35 : 0), spot: ui.spots[e.view]});
    if (e.display) out.push({t: e.t, spot: ui.spots[e.display]});
    return out;
  });
  const WP = [[0, 900, 600]];
  EV.forEach((e, i) => {
    WP.push([e.t - 0.16, ...e.spot], [e.t + 0.22, ...e.spot]);
    WP.push([e.t + 1.4, ...REST[i % REST.length]]);
  });
  WP.sort((a, b) => a[0] - b[0]);
  return (t) => {
    let i = 0;
    while (i < WP.length - 2 && t > WP[i + 1][0]) i++;
    const [t0, x0, y0] = WP[i];
    const [t1, x1, y1] = WP[i + 1];
    const k = ss(t0, t1, t);
    const len = Math.hypot(x1 - x0, y1 - y0);
    const bow = Math.sin(Math.PI * k) * Math.min(24, len * 0.07);
    let press = false;
    let ring = 0;
    let rx = 0;
    let ry = 0;
    for (const e of EV) {
      if (t >= e.t - 0.07 && t < e.t + 0.09) press = true;
      if (t >= e.t && t < e.t + 0.55) {
        ring = 1 - (t - e.t) / 0.55;
        [rx, ry] = e.spot;
      }
    }
    return {x: x0 + (x1 - x0) * k + (len ? (-(y1 - y0) / len) * bow : 0), y: y0 + (y1 - y0) * k + (len ? ((x1 - x0) / len) * bow : 0), press, ring, ringX: rx, ringY: ry};
  };
}

// ------------------------------------------------------------ os rótulos: de perto a doca e as câmeras, de longe o totem
const NEAR = [
  {name: 'CÂMERA DOME · FRENTE', sub: '4 MP · 100° · UMA EM CADA FACE', at: 'dome'},
  {name: 'CÂMERA DOME · DIREITA', sub: 'PTZ COMPACTA · CÚPULA FUMÊ', at: 'dome2'},
  {name: 'DOCA DO DRONE', sub: 'DUAS TAMPAS · ABRE 90° PARA OS LADOS', at: 'dock'},
  {name: 'BOTÃO DE EMERGÊNCIA', sub: 'PARADA IMEDIATA DA DOCA', at: 'estop'},
  {name: 'SENSOR DE VENTO', sub: 'DECOLAGEM SÓ COM VENTO SEGURO', at: 'wind'},
  {name: 'DRONE', sub: 'DJI MAVIC 3 CLASSIC · CÂMERA 20 MP', at: 'drone'},
  {name: 'PAINEL DE LED', sub: '2.500 NITS · ANÚNCIOS', at: 'led'},
];
const FAR = [
  {name: 'DOCA DO DRONE', sub: 'ABRE, LANÇA E RECOLHE O DRONE', at: 'dock'},
  {name: 'CÂMERAS DOME (4×)', sub: 'UMA EM CADA FACE · 360°', at: 'dome'},
  {name: 'PAINÉIS DE LED (4×)', sub: 'PUBLICIDADE NAS QUATRO FACES', at: 'led'},
  {name: 'RODÍZIOS', sub: 'TOTEM MÓVEL, SEM OBRA', at: 'caster'},
  {name: 'DRONE', sub: 'DJI MAVIC 3 CLASSIC', at: 'drone'},
  {name: 'PESSOA DETECTADA', sub: 'ACOMPANHADA PELA DOME E PELO DRONE', at: 'person', person: true},
];
// area: onde os rótulos podem ficar (a mesa usa o centro do console 1600 x 900; o celular passa a sua cena)
const DESK_AREA = {x0: 330, x1: 1290, y0: 110, y1: 740, mid: 800, left: 340, right: 1078, rightNear: 1104, w: 200, gap: 36};
export function makeLabels(st, area = DESK_AREA) {
  return (near, o) => {
    if (o < 0.02) return [];
    const A = typeof area === 'function' ? area() : area;
    const pts = (near ? NEAR : FAR)
      .filter((p) => !p.person || st.rig.ped.g.visible)
      .map((p) => ({p, at: st.project(st.rig.anchors[p.at]())}))
      .filter((x) => x.at && x.at[0] > A.x0 && x.at[0] < A.x1 && x.at[1] > A.y0 && x.at[1] < A.y1);
    const L = pts.filter((x) => x.at[0] < A.mid).sort((a, b) => a.at[1] - b.at[1]);
    const R = pts.filter((x) => x.at[0] >= A.mid).sort((a, b) => a.at[1] - b.at[1]);
    const out = [];
    const stack = (col, x, w) => {
      let y = A.y0 + 20;
      for (const c of col) {
        y = Math.max(y, Math.min(A.y1 - 40, c.at[1] - 10));
        out.push({name: c.p.name, sub: c.p.sub, at: c.at, label: [x, y], w, o});
        y += A.gap;
      }
    };
    stack(L, A.left, A.w);
    stack(R, near ? A.rightNear : A.right, A.w);
    return out;
  };
}

// nas cenas de apresentação do passeio a legenda fala do que a câmera mostra; no resto, do que o Shomer está fazendo
const SHOW = {
  cameras: 'Uma câmera dome em cada face: vigilância de 360°.',
};
function captionFor(s) {
  if (s.tour && SHOW[s.view] && s.since !== undefined && s.seq === 'patrol') return {caption: SHOW[s.view], captionAge: s.since - BLEND * 0.6};
  if (s.tour && s.display?.exploded) return {caption: 'Vista explodida: a doca, o drone e o totem.', captionAge: 1};
  const c = captionOf(s.m);
  return {caption: c.text, captionAge: s.tau - c.t0};
}

/** Os dados do console para um quadro. */
export function makeConsoleFrame(ui, st) {
  const labels = makeLabels(st, ui.labelArea);
  // as miniaturas dos anúncios, para o painel de publicidade
  const adThumbs = st.rig.ads.map((t) => {
    const c = document.createElement('canvas');
    c.width = 60;
    c.height = 144;
    try {
      const g = c.getContext('2d');
      // a textura do GLB vem com flipY falso: a imagem está de pé como na tela
      g.drawImage(t.image, 0, 0, 60, 144);
      return c.toDataURL();
    } catch {
      return null;
    }
  });
  return (s) => {
    const S = SEQ[s.seq];
    const m = s.m;
    ui.update({
      m,
      status: statusOf(m),
      seq: s.seq,
      prog: s.tau / S.dur,
      tau: s.tau,
      dur: S.dur,
      from: S.from,
      to: S.to,
      phase: phaseOf(s.seq, s.tau),
      ...captionFor(s),
      view: s.view,
      display: s.display,
      night: s.night,
      panRate: s.panRate,
      personBox: s.personBox,
      droneBox: s.droneBox,
      adThumbs,
      droneTag: m.flight.flying && s.view !== 'drone' ? st.project(st.rig.anchors.drone()) : null,
      paused: s.paused ?? false,
      speed: s.speed ?? 1,
      speedK: s.speedK ?? 0.47,
      callouts: labels(s.near, s.labels),
      cursor: s.cursor,
    });
  };
}
export const isNear = (view) => view === 'doca' || view === 'cameras' || view === 'drone';

export function makeFilm() {
  return async ({canvas, capture}) => {
    const st = await createXptoStage({canvas});
    const resize = () => st.resize(1600, 900, capture ? devicePixelRatio || 1 : Math.min(devicePixelRatio || 1, 2));
    resize();
    const ui = createConsole(document.getElementById('app'));
    const cursorAt = makeCursor(ui);
    const frame = makeConsoleFrame(ui, st);
    return {
      resize,
      render(t) {
        const {seq, tau} = seqAt(t);
        const {m, panRate} = mechAt(seq, tau);
        const disp = displayAt(t);
        const cam = camAt(t, disp.orbit);
        const night = easedDisplay('night', t, 0.9);
        const out = st.frame(m, {...cam, az: cam.az * D2R, el: cam.el * D2R}, {explode: easedDisplay('exploded', t, 0.8), cover: easedDisplay('cover', t), night, feeds: {dome: FEED.dome, drone: FEED.drone}});
        const [vt0, view] = viewAt(t);
        frame({seq, tau, m, panRate, view, display: disp, night, near: isNear(view), labels: easedDisplay('labels', t, 0.6) * ss(vt0 + BLEND, vt0 + BLEND + 0.6, t), cursor: cursorAt(t), personBox: out.personBox, droneBox: out.droneBox, tour: true, since: t - vt0});
        return {};
      },
    };
  };
}

export const run = () => runSim(DEFAULTS, makeFilm());
void THREE;
