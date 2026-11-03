// O console do Shomer Vision no celular: a cena 3D em cima, com as imagens ao vivo da dome ativa e do drone numa faixa
// embaixo dela e o alerta no alto; logo abaixo a legenda com o play e o progresso; depois abas (Estado, Drone,
// Publicidade, Controles). Recebe os mesmos dados do console de mesa (update(s)) e expõe os mesmos botões (btn).
import {AD_NAMES, BRAND, logoImg} from './brand.js';
import {C, DISPLAY, DISPLAY_LABEL, SEQ_LABEL, SEQS, VIEW_LABEL, VIEWS} from './console.js';
import {FACES, SPEC} from './kin.js';

const fmtN = (v, d = 0) => v.toFixed(d).replace('.', ',');
const GLASS = `background:linear-gradient(160deg,rgba(255,255,255,.72),rgba(255,255,255,.45));-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);border:1px solid rgba(255,255,255,.85);box-shadow:inset 0 1px 0 #fff,0 6px 20px rgba(20,40,90,.1)`;
const CSS = `
html,body{overflow:auto!important;height:auto!important;background:#e9eef2;-webkit-text-size-adjust:100%}
#app{position:relative!important;inset:auto!important;width:100%!important;height:auto!important;min-height:100vh;overflow:visible!important;transform:none!important;font-family:Inter,system-ui,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.mx-head{display:flex;align-items:center;gap:12px;padding:12px 16px 10px}
.mx-head .t{font:700 15px/1.15 Inter,sans-serif;letter-spacing:-.2px}
.mx-head .s{font:600 9px 'JetBrains Mono',monospace;letter-spacing:1.4px;color:${C.mute};margin-top:3px;text-transform:uppercase}
.mx-stage{position:relative;width:100%;overflow:hidden}
.mx-stage #gl{position:absolute!important;inset:0;width:100%!important;height:100%!important;touch-action:none}
.mx-fd{position:absolute;border:1px solid rgba(255,255,255,.9);border-radius:6px;box-shadow:0 0 0 1px rgba(11,21,48,.25),0 4px 14px rgba(20,40,90,.18);pointer-events:none;box-sizing:border-box}
.mx-tag{position:absolute;font:700 8.5px 'JetBrains Mono',monospace;letter-spacing:.8px;color:#fff;background:rgba(11,21,48,.6);padding:2px 6px;border-radius:999px;white-space:nowrap;pointer-events:none;max-width:calc(50% - 20px);overflow:hidden;text-overflow:ellipsis}
.mx-off{position:absolute;display:flex;align-items:center;justify-content:center;background:#0e1430;color:#7d8bb3;font:600 9px 'JetBrains Mono',monospace;letter-spacing:2px;border-radius:6px;pointer-events:none}
.mx-night{position:absolute;background:#808080;mix-blend-mode:saturation;opacity:0;pointer-events:none;border-radius:6px}
.mx-alert{position:absolute;left:10px;right:10px;top:46px;padding:9px 12px;border-radius:14px;${GLASS};background:linear-gradient(160deg,rgba(255,236,236,.9),rgba(255,214,214,.7));box-shadow:inset 0 1px 0 #fff,0 0 0 1.5px rgba(229,72,77,.55),0 10px 24px rgba(229,72,77,.25);opacity:0;pointer-events:none}
.mx-alert b{display:block;font:800 13px Inter,sans-serif;color:#b4232a}
.mx-alert span{display:block;font:600 9px 'JetBrains Mono',monospace;letter-spacing:.6px;color:#8a4b4e;margin-top:3px}
.mx-chip{position:absolute;left:50%;top:10px;transform:translateX(-50%);display:flex;align-items:center;gap:7px;height:26px;padding:0 12px;border-radius:999px;${GLASS};font:700 9px 'JetBrains Mono',monospace;letter-spacing:1px;white-space:nowrap;cursor:pointer}
.mx-chip i{display:block;width:6px;height:6px;border-radius:50%;background:${C.rec}}
.mx-chip.on i{animation:mxb 1.2s steps(2) infinite}
@keyframes mxb{50%{opacity:.15}}
.mx-cap{margin:10px 12px 0;padding:12px 14px;border-radius:18px;${GLASS};display:grid;grid-template-columns:44px 1fr;gap:6px 12px;align-items:center}
.mx-play{grid-row:span 2;width:44px;height:44px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;background:linear-gradient(180deg,rgba(40,52,120,.95),rgba(11,21,48,.9));box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 4px 12px rgba(11,21,48,.28);cursor:pointer}
.mx-txt{font:600 15px/1.3 Inter,sans-serif;min-height:39px;display:flex;align-items:center}
.mx-tl{position:relative;height:22px;cursor:pointer;touch-action:none}
.mx-tl i{position:absolute;left:0;right:0;top:9px;height:4px;border-radius:2px;background:rgba(11,21,48,.1)}
.mx-tl b{position:absolute;left:0;top:9px;height:4px;border-radius:2px;background:linear-gradient(90deg,${C.ac},${C.purple})}
.mx-tl em{position:absolute;top:3px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px ${C.acInk},0 2px 6px rgba(20,40,90,.25)}
.mx-tl span{position:absolute;right:0;top:-12px;font:500 9px 'JetBrains Mono',monospace;color:${C.mute};letter-spacing:.6px}
.mx-tabs{display:flex;gap:6px;margin:12px 12px 0;padding:4px;border-radius:999px;background:rgba(11,21,48,.06);box-shadow:inset 0 1px 2px rgba(11,21,48,.1)}
.mx-tabs button{flex:1;height:34px;border:none;border-radius:999px;background:transparent;font:700 10px 'JetBrains Mono',monospace;letter-spacing:1px;color:#6f7a8c;cursor:pointer}
.mx-tabs button.on{background:linear-gradient(180deg,rgba(40,52,120,.95),rgba(11,21,48,.9));color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.45)}
.mx-pane{margin:10px 12px 0;padding:14px;border-radius:18px;${GLASS};display:none}
.mx-pane.on{display:block}
.mx-h{font:700 10px 'JetBrains Mono',monospace;letter-spacing:1.6px;margin:2px 0 10px;display:flex;align-items:center;gap:8px}
.mx-h i{display:block;width:3px;height:12px;background:linear-gradient(${C.ac},${C.purple})}
.mx-row{display:grid;grid-template-columns:78px 1fr 92px;align-items:center;gap:10px;margin:9px 0}
.mx-row .k{font:500 9px 'JetBrains Mono',monospace;letter-spacing:1.2px;color:${C.mute};text-transform:uppercase}
.mx-row .v{font:600 12px 'JetBrains Mono',monospace;text-align:right;white-space:nowrap}
.mx-bar{height:5px;border-radius:3px;background:rgba(11,21,48,.09);overflow:hidden}
.mx-bar b{display:block;height:100%;border-radius:3px;background:${C.ac}}
.mx-st{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.mx-st i{display:block;width:12px;height:26px;border-radius:2px}
.mx-st b{display:block;font:600 16px Inter,sans-serif}
.mx-st span{display:block;font:500 9px 'JetBrains Mono',monospace;letter-spacing:1px;color:${C.mute};text-transform:uppercase;margin-top:2px}
.mx-kv{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin-top:6px}
.mx-kv div{display:flex;justify-content:space-between;font:500 9px 'JetBrains Mono',monospace;letter-spacing:1px;color:${C.mute}}
.mx-kv div b{font:700 12px 'JetBrains Mono',monospace;color:${C.ink};letter-spacing:0}
.mx-read{display:flex;align-items:center;gap:12px;margin:10px 0}
.mx-ad{display:flex;gap:14px;align-items:center}
.mx-ad img{width:56px;height:134px;border-radius:4px;background:#05070b;object-fit:cover;box-shadow:0 0 0 1px rgba(11,21,48,.2)}
.mx-dtag{position:absolute;display:none;transform:translate(-50%,-100%);padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.9);box-shadow:0 0 0 1.5px ${C.purple};font:700 8.5px 'JetBrains Mono',monospace;letter-spacing:.8px;color:${C.ink};white-space:nowrap;pointer-events:none}
.mx-read b{display:block;font:700 14px 'JetBrains Mono',monospace;letter-spacing:1px}
.mx-read span{display:block;font:500 9px 'JetBrains Mono',monospace;letter-spacing:.6px;color:${C.mute};margin-top:3px}
.mx-big{font:700 26px Inter,sans-serif;letter-spacing:-.5px;margin-top:6px}
.mx-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.mx-pills button{height:36px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.85);background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.45));box-shadow:inset 0 1px 0 #fff,0 2px 6px rgba(20,40,90,.1);font:700 10px 'JetBrains Mono',monospace;letter-spacing:1px;color:${C.ink};cursor:pointer}
.mx-pills button.on{background:linear-gradient(180deg,rgba(40,52,120,.95),rgba(11,21,48,.9));color:#fff;border-color:rgba(255,255,255,.35)}
.mx-call{position:absolute;padding:3px 7px;border-radius:999px;background:rgba(255,255,255,.88);box-shadow:0 0 0 1px rgba(11,21,48,.12),0 2px 6px rgba(20,40,90,.12);font:700 8px 'JetBrains Mono',monospace;letter-spacing:.3px;color:${C.ink};white-space:nowrap;pointer-events:none}
.mx-call i{display:inline-block;width:5px;height:5px;margin-right:5px;background:${C.ac};vertical-align:1px}
.mx-foot{margin:14px 16px 24px;font:500 8.5px/1.6 'JetBrains Mono',monospace;letter-spacing:1px;color:${C.mute};text-transform:uppercase}
.lite .mx-cap,.lite .mx-pane,.lite .mx-chip,.lite .mx-alert{-webkit-backdrop-filter:none;backdrop-filter:none}
`;
const el = (h) => {
  const d = document.createElement('div');
  d.innerHTML = h.trim();
  return d.firstElementChild;
};

/** Monta o console de celular dentro de app; canvas é o da cena 3D. */
export function createMobileConsole(app, canvas) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  const root = el(`<div class="mx"></div>`);
  app.appendChild(root);
  const add = (parent, h) => {
    const n = el(h);
    parent.appendChild(n);
    return n;
  };
  add(root, `<div class="mx-head">${logoImg(46)}<div><div class="t">Shomer Vision</div><div class="s">Totem · LED · 4 câmeras · drone</div></div></div>`);

  // ------------------------------------------------------------ a cena e o que vai por cima dela
  const stage = add(root, `<div class="mx-stage"></div>`);
  stage.appendChild(canvas);
  const fdPtz = add(stage, `<div class="mx-fd"></div>`);
  const fdLpr = add(stage, `<div class="mx-fd"></div>`);
  const nPtz = add(stage, `<div class="mx-night"></div>`);
  const nLpr = add(stage, `<div class="mx-night"></div>`);
  const offPtz = add(stage, `<div class="mx-off" style="display:none">SEM SINAL</div>`);
  const offLpr = add(stage, `<div class="mx-off" style="text-align:center;line-height:1.6">DRONE NA DOCA<br>CARREGANDO</div>`);
  const tPtz = add(stage, `<div class="mx-tag"></div>`);
  const tLpr = add(stage, `<div class="mx-tag"></div>`);
  const faceBox = add(stage, `<div style="position:absolute;border:1.5px solid ${C.rec};display:none;pointer-events:none"></div>`);
  const plateBox = add(stage, `<div style="position:absolute;border:1.5px solid ${C.rec};display:none;pointer-events:none"></div>`);
  const alert = add(stage, `<div class="mx-alert"><b>⚠ Pessoa detectada</b><span data-a>DRONE ACIONADO · IMAGEM NA CENTRAL</span></div>`);
  const alertSub = alert.querySelector('[data-a]');
  const dTag = add(stage, `<div class="mx-dtag"></div>`);
  const callSvg = add(stage, `<svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none"></svg>`);
  const callG = add(stage, `<div style="position:absolute;inset:0;pointer-events:none"></div>`);
  const chip = add(stage, `<div class="mx-chip"></div>`);

  // ------------------------------------------------------------ a legenda, o play e o progresso
  const cap = add(root, `<div class="mx-cap"></div>`);
  const play = add(cap, `<button class="mx-play" aria-label="Pausar"></button>`);
  const txt = add(cap, `<div class="mx-txt"></div>`);
  const tl = add(cap, `<div class="mx-tl"><i></i><b></b><em></em><span></span></div>`);
  const tlFill = tl.querySelector('b');
  const tlKnob = tl.querySelector('em');
  const tlTime = tl.querySelector('span');

  // ------------------------------------------------------------ as abas
  const TABS = [['estado', 'ESTADO'], ['drone', 'DRONE'], ['pub', 'ANÚNCIOS'], ['ctl', 'CONTROLES']];
  const tabs = add(root, `<div class="mx-tabs"></div>`);
  const panes = {};
  const tabBtn = {};
  for (const [k, n] of TABS) {
    tabBtn[k] = add(tabs, `<button>${n}</button>`);
    panes[k] = add(root, `<div class="mx-pane"></div>`);
  }
  const showTab = (k) => {
    for (const [x] of TABS) {
      tabBtn[x].classList.toggle('on', x === k);
      panes[x].classList.toggle('on', x === k);
    }
  };
  for (const [k] of TABS) tabBtn[k].addEventListener('click', () => showTab(k));
  showTab('estado');

  const row = (parent, label) => {
    const r = add(parent, `<div class="mx-row"><span class="k">${label}</span><div class="mx-bar"><b></b></div><span class="v"></span></div>`);
    const f = r.querySelector('b');
    const v = r.querySelector('.v');
    return {set: (k, t, col = C.ac) => {
      f.style.width = `${(Math.max(0, Math.min(1, k)) * 100).toFixed(1)}%`;
      f.style.background = col;
      v.textContent = t;
    }};
  };
  // estado
  const P = panes.estado;
  const st = add(P, `<div class="mx-st"><i></i><div><b></b><span></span></div></div>`);
  const stI = st.querySelector('i');
  const stB = st.querySelector('b');
  const stS = st.querySelector('span');
  const bDock = row(P, 'Doca');
  const bAlt = row(P, 'Altura');
  const bBat = row(P, 'Bateria');
  const bLink = row(P, 'Link 4G');
  add(P, `<div class="mx-h" style="margin-top:14px"><i></i>CÂMERA DOME ATIVA</div>`);
  const kv = add(P, `<div class="mx-kv"></div>`);
  const domeV = ['FACE', 'PAN', 'ZOOM', 'COBERTURA'].map((n) => add(kv, `<div>${n}<b></b></div>`).querySelector('b'));
  // drone
  const D = panes.drone;
  add(D, `<div class="mx-h"><i></i>${SPEC.drone.name.toUpperCase()}</div>`);
  const kv2 = add(D, `<div class="mx-kv"></div>`);
  const tele = ['ALTURA', 'VELOCIDADE', 'DISTÂNCIA', 'BATERIA', 'TEMPO DE VOO', 'CÂMERA'].map((n) => add(kv2, `<div>${n}<b></b></div>`).querySelector('b'));
  add(D, `<div style="font:500 9px/1.6 'JetBrains Mono',monospace;letter-spacing:1px;color:${C.mute};text-transform:uppercase;margin-top:12px">${SPEC.drone.flightMin} min de voo · decolagem e pouso automáticos na doca</div>`);
  // publicidade
  const A = panes.pub;
  add(A, `<div class="mx-h"><i></i>PUBLICIDADE · LED</div>`);
  const adBox = add(A, `<div class="mx-ad"><img alt=""><div style="flex:1;min-width:0"><div class="mx-st" style="margin:0"><div><b data-n></b><span data-s></span></div></div><div class="mx-bar" style="margin:10px 0"><b data-f style="background:${C.purple}"></b></div><div data-d style="display:flex;gap:6px"></div><div style="font:500 9px/1.6 'JetBrains Mono',monospace;letter-spacing:1px;color:${C.mute};text-transform:uppercase;margin-top:10px">${SPEC.led.n} telas · ${SPEC.led.nits} nits<br>troca a cada ${SPEC.led.slot} s</div></div></div>`);
  const adImg = adBox.querySelector('img');
  const adName = adBox.querySelector('[data-n]');
  const adSub = adBox.querySelector('[data-s]');
  const adFill = adBox.querySelector('[data-f]');
  const adDots = adBox.querySelector('[data-d]');
  let adShown = -1;
  // controles
  const K = panes.ctl;
  const btn = {play};
  const pills = (title, keys, labels) => {
    add(K, `<div class="mx-h"><i></i>${title}</div>`);
    const box = add(K, `<div class="mx-pills"></div>`);
    for (const k of keys) btn[k] = add(box, `<button>${labels[k]}</button>`);
  };
  pills('SEQUÊNCIA', SEQS, SEQ_LABEL);
  pills('VISTAS', VIEWS, VIEW_LABEL);
  pills('EXIBIÇÃO', DISPLAY, DISPLAY_LABEL);
  add(root, `<div class="mx-foot">Shomer Vision · modelo representativo<br>Drone: DJI Mavic 3 Classic (BlenderKit) · Carro: Comrade1280 (CC-BY) · Pedestre: Rocketbox (MIT)<br>Arraste para girar · pinça para zoom</div>`);

  // ------------------------------------------------------------ medidas: a cena e a faixa das imagens ao vivo
  const feeds = {dome: {x: 0, y: 0, w: 0, h: 0}, drone: {x: 0, y: 0, w: 0, h: 0}};
  // os nomes antigos (ptz/lpr) apontam para os mesmos retângulos: a dome à esquerda, o drone à direita
  feeds.ptz = feeds.dome;
  feeds.lpr = feeds.drone;
  const labelArea = {x0: 4, x1: 386, y0: 44, y1: 300, mid: 195, left: 6, right: 250, rightNear: 250, w: 134, gap: 24};
  const layout = () => {
    const W = stage.clientWidth || innerWidth;
    // as telinhas: metade da largura em pé, no máximo 210 px (deitado elas ficam nos cantos)
    const fw = Math.round(Math.min((W - 30) / 2, 210));
    const fh = Math.round((fw * 9) / 16);
    const land = innerWidth > innerHeight;
    const sceneH = Math.round(land ? Math.max(200, innerHeight - fh - 40) : Math.min(innerHeight * 0.5, W * 1.05));
    const H = sceneH + fh + 12;
    stage.style.height = `${H}px`;
    Object.assign(feeds.ptz, {x: 10, y: H - fh - 10, w: fw, h: fh});
    Object.assign(feeds.lpr, {x: W - fw - 10, y: H - fh - 10, w: fw, h: fh});
    for (const [f, a, b, c, t] of [[feeds.ptz, fdPtz, nPtz, offPtz, tPtz], [feeds.lpr, fdLpr, nLpr, offLpr, tLpr]]) {
      for (const n of [a, b, c]) Object.assign(n.style, {left: `${f.x}px`, top: `${f.y}px`, width: `${f.w}px`, height: `${f.h}px`});
      Object.assign(t.style, {left: `${f.x + 5}px`, top: `${f.y + 5}px`});
    }
    Object.assign(labelArea, {x1: W - 4, y1: H - fh - 16, mid: W / 2, right: W - 140, rightNear: W - 140});
    return {W, H, strip: fh + 12};
  };
  const clock = (s) => `00:${String(Math.floor(s)).padStart(2, '0')}`;
  const onPill = (k, on) => btn[k].classList.toggle('on', on);
  let seekCb = null;
  const seek = (e) => {
    const r = tl.getBoundingClientRect();
    seekCb?.(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  };
  tl.addEventListener('pointerdown', (e) => {
    tl.setPointerCapture(e.pointerId);
    seek(e);
    const mv = (ev) => seek(ev);
    tl.addEventListener('pointermove', mv);
    tl.addEventListener('pointerup', () => tl.removeEventListener('pointermove', mv), {once: true});
  });

  return {
    mobile: true,
    root,
    stage,
    btn,
    chip,
    feeds,
    layout,
    labelArea,
    spots: new Proxy({}, {get: () => [0, 0]}),
    onSeek: (f) => (seekCb = f),
    update(s) {
      const m = s.m;
      const f = m.flight;
      const k = m.active;
      const dm = m.domes[k];
      // cena
      const droneOn = f.flying || m.lids > 0.5;
      offLpr.style.display = droneOn ? 'none' : 'flex';
      tLpr.style.display = droneOn ? 'block' : 'none';
      nPtz.style.opacity = nLpr.style.opacity = String(s.night);
      tPtz.textContent = `DOME ${FACES[k].name} · ${fmtN(dm.zoom, 1)}×`;
      tLpr.textContent = `DRONE · ${f.flying ? (m.drone.target ? 'ACOMPANHANDO' : 'EM VOO') : 'NA DOCA'}`;
      const box = (n, b, area) => {
        if (!b) return (n.style.display = 'none');
        const [x, y, w, h] = b;
        const inside = x > area.x && x + w < area.x + area.w && y > area.y && y + h < area.y + area.h && w > 3;
        n.style.display = inside ? 'block' : 'none';
        Object.assign(n.style, {left: `${x - 2}px`, top: `${y - 2}px`, width: `${w + 4}px`, height: `${h + 4}px`});
      };
      box(faceBox, s.personBox, feeds.dome);
      box(plateBox, s.droneBox, feeds.drone);
      const a = m.alert;
      alert.style.opacity = (a ? Math.min(1, a.age / 0.35) * (1 - Math.max(0, Math.min(1, (a.age - 6) / 0.6))) : 0).toFixed(3);
      if (a) alertSub.textContent = `DOME ${FACES[a.face].name} · DRONE ACIONADO`;
      // a etiqueta do drone em voo
      {
        const p = s.droneTag;
        const inside = p && p[0] > 30 && p[0] < labelArea.x1 - 30 && p[1] > 60 && p[1] < labelArea.y1;
        dTag.style.display = inside ? 'block' : 'none';
        if (inside) {
          dTag.style.left = `${p[0].toFixed(1)}px`;
          dTag.style.top = `${(p[1] - 10).toFixed(1)}px`;
          dTag.innerHTML = `<span style="color:${C.purple}">◆</span> DRONE · ${fmtN(f.agl, 0)} m`;
        }
      }
      // rótulos: só o nome, numa pílula na borda, com uma linha fina até a peça
      let lh = '';
      let ch = '';
      for (const c of s.callouts) {
        if (c.o < 0.02 || !c.at) continue;
        const [ax, ay] = c.at;
        const [lx, ly] = c.label;
        // a coluna da direita liga pela borda esquerda da pílula; a da esquerda, pela direita
        const right = lx > labelArea.mid;
        const ex = right ? lx : lx + 134;
        lh += `<polyline points="${ax.toFixed(1)},${ay.toFixed(1)} ${ex.toFixed(1)},${(ly + 8).toFixed(1)}" fill="none" stroke="${C.acInk}" stroke-width=".9" opacity="${c.o.toFixed(2)}"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.2" fill="${C.acInk}" opacity="${c.o.toFixed(2)}"/>`;
        ch += `<div class="mx-call" style="left:${lx.toFixed(1)}px;top:${ly.toFixed(1)}px;opacity:${c.o.toFixed(2)};max-width:134px;overflow:hidden;text-overflow:ellipsis"><i></i>${c.name}</div>`;
      }
      callSvg.innerHTML = lh;
      callG.innerHTML = ch;
      // legenda e progresso
      if (txt.textContent !== s.caption) txt.textContent = s.caption;
      const ck = Math.max(0, Math.min(1, s.captionAge / 0.5));
      txt.style.opacity = (ck * ck * (3 - 2 * ck)).toFixed(3);
      play.innerHTML = s.paused ? '▶' : '❚❚';
      tlFill.style.width = `${(s.prog * 100).toFixed(1)}%`;
      tlKnob.style.left = `${(s.prog * 100).toFixed(1)}%`;
      tlTime.textContent = `${clock(s.tau)} / ${clock(s.dur)}`;
      // estado
      const [title, sub, kind] = s.status;
      stI.style.background = kind === 'alert' ? C.rec : kind === 'ok' ? C.ok : kind === 'move' ? C.ac : C.mute;
      stB.textContent = title;
      stB.style.color = kind === 'alert' ? '#b4232a' : '';
      stS.textContent = sub;
      bDock.set(m.lids, m.lids > 0.99 ? 'ABERTA' : m.lids < 0.01 ? 'FECHADA' : `${Math.round(m.lids * 90)}°`, m.lids > 0.99 ? C.ok : C.ac);
      bAlt.set(f.agl / 16, `${fmtN(f.agl, 1)} m`, C.purple);
      bBat.set(f.battery, `${Math.round(f.battery * 100)}%`, C.ok);
      bLink.set(0.86, 'LTE · −68', C.ok);
      domeV[0].textContent = FACES[k].name;
      domeV[1].textContent = `${fmtN(dm.pan, 0)}°`;
      domeV[2].textContent = `${fmtN(dm.zoom, 1)}×`;
      domeV[3].textContent = `4 × ${SPEC.dome.hfov}°`;
      // drone
      tele[0].textContent = `${fmtN(f.agl, 1)} m`;
      tele[1].textContent = `${fmtN(f.speed * 3.6, 0)} km/h`;
      tele[2].textContent = `${fmtN(f.dist, 0)} m`;
      tele[3].textContent = `${Math.round(f.battery * 100)}%`;
      tele[4].textContent = `${Math.floor(f.time / 60)}:${String(Math.floor(f.time % 60)).padStart(2, '0')}`;
      tele[5].textContent = '20 MP';
      // publicidade
      if (adShown !== m.ad) {
        adShown = m.ad;
        if (s.adThumbs?.[m.ad]) adImg.src = s.adThumbs[m.ad];
        adName.textContent = AD_NAMES[m.ad];
        adDots.innerHTML = AD_NAMES.map((_, i) => `<i style="display:block;width:${i === m.ad ? 16 : 6}px;height:6px;border-radius:3px;background:${i === m.ad ? C.purple : C.faint}"></i>`).join('');
      }
      adSub.textContent = `ANÚNCIO ${m.ad + 1}/${AD_NAMES.length} · 4 FACES`;
      adFill.style.width = `${((m.adAge / SPEC.led.slot) * 100).toFixed(1)}%`;
      // controles
      for (const k of SEQS) onPill(k, s.seq === k);
      for (const k of VIEWS) onPill(k, s.view === k);
      for (const k of DISPLAY) onPill(k, !!s.display[k]);
    },
  };
}
void BRAND;
