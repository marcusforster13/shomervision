// O console do Shomer Vision em 1600 x 900: o logo e o título, o estado com as barras da doca e do drone, a imagem ao
// vivo da dome ativa com a planta das quatro faces, a publicidade (o anúncio no ar), a imagem ao vivo do drone com a
// telemetria, as sequências, as vistas, a exibição, a barra de operação com a legenda e os rótulos com linhas até as
// peças. update(s) redesenha tudo a partir do quadro.
import {AD_NAMES, BRAND, logoImg} from './brand.js';
import {FACES, SPEC} from './kin.js';

export const C = {ink: BRAND.ink, mute: '#7d8696', faint: '#cdd4de', line: '#dfe5ec', panel: 'rgba(250,252,254,.95)', ac: BRAND.blue, acInk: BRAND.blueInk, ok: '#1fa971', warn: '#e8792b', rec: '#e5484d', purple: BRAND.purple};
export const SEQS = ['patrol', 'mission', 'round'];
export const SEQ_LABEL = {patrol: 'VIGIAR', mission: 'MISSÃO', round: 'RONDA'};
export const VIEWS = ['hero', 'rua', 'cameras', 'doca', 'drone', 'alvo', 'ceu', 'planta'];
export const VIEW_LABEL = {hero: 'GERAL', rua: 'RUA', doca: 'DOCA', drone: 'DRONE', alvo: 'ALVO', cameras: 'CÂMERAS', ceu: 'DO ALTO', planta: 'PLANTA'};
export const DISPLAY = ['labels', 'cover', 'exploded', 'night', 'orbit'];
export const DISPLAY_LABEL = {labels: 'RÓTULOS', cover: 'COBERTURA', exploded: 'EXPLODIDA', night: 'NOITE', orbit: 'ÓRBITA'};
export const FEED = {dome: {x: 42, y: 382, w: 254, h: 143}, drone: {x: 1327, y: 160, w: 230, h: 129}};

const fmtN = (v, d = 0) => v.toFixed(d).replace('.', ',');
const CSS = `
#app{font-family:Inter,system-ui,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.ui{position:absolute;inset:0;pointer-events:none}
.mo{font-family:'JetBrains Mono',ui-monospace,monospace}
/* vidro no estilo Liquid Glass: translúcido, desfoque e saturação do fundo, brilho na borda de cima, sombra macia */
.cp{position:absolute;background:linear-gradient(160deg,rgba(255,255,255,.62),rgba(255,255,255,.34));-webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);border:1px solid rgba(255,255,255,.75);border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(255,255,255,.3),inset 0 0 0 .5px rgba(11,21,48,.06),0 10px 30px rgba(20,40,90,.12),0 1px 3px rgba(20,40,90,.08)}
.lite .cp{-webkit-backdrop-filter:none;backdrop-filter:none;background:rgba(248,250,253,.9)}
.well{background:rgba(11,21,48,.06);box-shadow:inset 0 1px 2px rgba(11,21,48,.1),inset 0 -1px 0 rgba(255,255,255,.6)}
.ph{position:absolute;display:flex;align-items:center;gap:9px;font:700 10.5px 'JetBrains Mono',monospace;letter-spacing:1.8px}
.ph i{display:block;width:3px;height:13px;background:linear-gradient(${C.ac},${C.purple})}
.pn{position:absolute;font:500 9.5px 'JetBrains Mono',monospace;color:${C.mute};letter-spacing:1px}
.sm{font:500 9px 'JetBrains Mono',monospace;letter-spacing:1.5px;color:${C.mute};text-transform:uppercase;white-space:nowrap}
.ui .bt.on{background:linear-gradient(180deg,rgba(40,52,120,.95),rgba(11,21,48,.9));color:#fff;border-color:rgba(255,255,255,.35);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -1px 2px rgba(0,0,0,.25),0 4px 12px rgba(11,21,48,.28)}
.ui .bt.flat{background:transparent;border-color:transparent;box-shadow:none}
.bt{position:absolute;height:21px;padding:0 8px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.85);border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.36));box-shadow:inset 0 1px 0 #fff,inset 0 -1px 1px rgba(11,21,48,.07),0 2px 6px rgba(20,40,90,.1);transition:transform .12s;font:700 9.4px 'JetBrains Mono',monospace;letter-spacing:1.2px;color:${C.ink};white-space:nowrap;box-sizing:border-box}
.fd{position:absolute;border:1px solid rgba(255,255,255,.9);border-radius:4px;box-sizing:border-box;box-shadow:0 0 0 1px rgba(11,21,48,.25)}
.fdt{position:absolute;font:700 8.6px 'JetBrains Mono',monospace;letter-spacing:1.1px;color:#fff;background:rgba(11,21,48,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);padding:2px 6px;border-radius:999px;white-space:nowrap}
.alert{position:absolute;left:505px;top:112px;width:330px;transform:translateX(-50%);padding:12px 16px;border-radius:18px;background:linear-gradient(160deg,rgba(255,236,236,.82),rgba(255,214,214,.55));-webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 #fff,0 0 0 1.5px rgba(229,72,77,.55),0 12px 32px rgba(229,72,77,.25);opacity:0;pointer-events:none}
.alert b{display:block;font:800 13px Inter,sans-serif;letter-spacing:.4px;color:#b4232a}
.alert span{display:block;font:600 8.6px 'JetBrains Mono',monospace;letter-spacing:1.6px;color:#c4555a;margin:3px 0 8px}
.alert .ar{display:flex;justify-content:space-between;gap:10px;font:500 9px 'JetBrains Mono',monospace;letter-spacing:.8px;padding:3px 0;border-top:1px solid rgba(180,35,42,.12)}
.alert .ar i{font-style:normal;color:#9a6a6c}
.alert .ar em{font-style:normal;font-weight:700;color:${C.ink}}
.night{position:absolute;background:#808080;mix-blend-mode:saturation;opacity:0}
.call{position:absolute;white-space:nowrap}
.call b{display:flex;align-items:center;gap:6px;font:700 9.6px 'JetBrains Mono',monospace;letter-spacing:1.2px;color:${C.ink}}
.call b i{display:block;width:6px;height:6px;background:${C.ac}}
.call span{display:block;font:500 8px 'JetBrains Mono',monospace;letter-spacing:1.1px;color:${C.mute};margin-top:2px}
.cur{position:absolute;left:0;top:0;z-index:50;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))}
.ring{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:1.5px solid ${C.acInk};opacity:0;z-index:49}
`;
const el = (h) => {
  const d = document.createElement('div');
  d.innerHTML = h.trim();
  return d.firstElementChild;
};

export function createConsole(app) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  const ui = el(`<div class="ui"></div>`);
  app.appendChild(ui);
  const add = (h) => {
    const n = el(h);
    ui.appendChild(n);
    return n;
  };
  // hole: o retângulo da imagem ao vivo que o fundo do painel deixa vazado (o canvas aparece por baixo)
  const panel = (x, y, w, h, title, n, hole) => {
    const clip = hole ? `;clip-path:path(evenodd,'M-20 -20H${w + 20}V${h + 20}H-20Z M${hole.x - x} ${hole.y - y}h${hole.w}v${hole.h}h${-hole.w}Z');overflow:visible` : '';
    add(`<div class="cp" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px${clip}"></div>`);
    add(`<div class="ph" style="left:${x + 14}px;top:${y + 13}px"><i></i>${title}</div>`);
    add(`<div class="pn" style="right:${1600 - x - w + 14}px;top:${y + 15}px">${n}</div>`);
  };
  const bar = (x, y, w, label) => {
    add(`<div class="sm" style="position:absolute;left:${x}px;top:${y}px">${label}</div>`);
    add(`<div style="position:absolute;left:${x + 68}px;top:${y + 4}px;width:${w}px;height:4px;background:rgba(11,21,48,.09);border-radius:2px"></div>`);
    const f = add(`<div style="position:absolute;left:${x + 68}px;top:${y + 4}px;height:4px;background:${C.ac};border-radius:2px"></div>`);
    const v = add(`<div class="mo" style="position:absolute;left:${x + 74 + w}px;top:${y - 2}px;font-size:11px;font-weight:600"></div>`);
    return {set: (k, txt, col = C.ac) => {
      f.style.width = `${(Math.max(0, Math.min(1, k)) * w).toFixed(1)}px`;
      f.style.background = col;
      v.textContent = txt;
    }};
  };

  // ------------------------------------------------------------ cabeçalho
  add(`<div style="position:absolute;left:28px;top:16px">${logoImg(66)}</div>`);
  add(`<div style="position:absolute;left:110px;top:22px;width:1px;height:58px;background:${C.faint}"></div>`);
  add(`<div class="sm" style="position:absolute;left:130px;top:22px;letter-spacing:2.4px">PUBLICIDADE · SEGURANÇA · DRONE</div>`);
  add(`<div style="position:absolute;left:129px;top:37px;font-size:33px;font-weight:700;letter-spacing:-.6px;line-height:1">Shomer Vision <span style="background:linear-gradient(90deg,${C.ac},${C.purple});-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:400">/</span> Totem com Drone</div>`);
  add(`<div class="mo" style="position:absolute;left:130px;top:77px;font-size:11.2px;letter-spacing:2.2px;color:#55607a">4 PAINÉIS DE LED · 4 CÂMERAS DOME · DOCA · DRONE AUTÔNOMO</div>`);
  add(`<div class="sm" style="position:absolute;left:1118px;top:49px;letter-spacing:2.6px;font-size:9.6px">RESPOSTA AÉREA</div>`);
  add(`<div class="mo" style="position:absolute;left:1236px;top:47px;color:${C.ac};font-size:12px;letter-spacing:-1px">//////</div>`);
  add(`<div style="position:absolute;left:1300px;top:34px;color:${C.purple};font-size:39px;font-weight:700;letter-spacing:-.8px;line-height:1">360°</div>`);
  add(`<div style="position:absolute;left:1412px;top:33px;width:1px;height:44px;background:${C.faint}"></div>`);
  add(`<div class="sm" style="position:absolute;left:1428px;top:34px;line-height:14px;letter-spacing:2px">TECNOLOGIA<br>QUE PROTEGE<br>E COMUNICA</div>`);

  // ------------------------------------------------------------ 01 estado
  panel(28, 112, 282, 204, 'ESTADO', '01');
  const chip = add(`<div style="position:absolute;left:42px;top:150px;width:13px;height:24px;border-radius:2px"></div>`);
  const stTitle = add(`<div style="position:absolute;left:66px;top:148px;width:230px;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>`);
  const stSub = add(`<div class="sm" style="position:absolute;left:67px;top:167px;width:229px;overflow:hidden;text-overflow:ellipsis;letter-spacing:1px"></div>`);
  add(`<div style="position:absolute;left:42px;top:188px;width:254px;height:1px;background:${C.line}"></div>`);
  const bDock = bar(42, 202, 120, 'DOCA');
  const bAlt = bar(42, 226, 120, 'ALTURA');
  const bBat = bar(42, 250, 120, 'BATERIA');
  const bLink = bar(42, 274, 120, 'LINK 4G');
  add(`<div class="sm" style="position:absolute;left:42px;top:296px;font-size:8.2px">DRONE ${SPEC.drone.name.toUpperCase()}</div>`);

  // ------------------------------------------------------------ 02 dome ao vivo
  const F = FEED.dome;
  panel(28, 330, 282, 312, 'CÂMERA DOME · AO VIVO', '02', F);
  add(`<div class="fd" style="left:${F.x - 1}px;top:${F.y - 1}px;width:${F.w + 2}px;height:${F.h + 2}px"></div>`);
  const domeNight = add(`<div class="night" style="left:${F.x}px;top:${F.y}px;width:${F.w}px;height:${F.h}px"></div>`);
  const domeTag = add(`<div class="fdt" style="left:${F.x + 6}px;top:${F.y + 6}px"></div>`);
  add(`<div class="fdt" style="right:${1600 - F.x - F.w + 6}px;top:${F.y + 6}px"><span style="color:${C.rec}">●</span> REC</div>`);
  const domeBox = add(`<div style="position:absolute;border:1.5px solid ${C.rec};box-shadow:0 0 0 1px rgba(255,255,255,.6);display:none"></div>`);
  const plan = add(`<svg style="position:absolute;left:42px;top:540px" width="88" height="88"></svg>`);
  const domeVals = ['FACE', 'PAN', 'ZOOM', 'COBERTURA'].map((n, i) => {
    const y = 544 + i * 22;
    add(`<div class="sm" style="position:absolute;left:146px;top:${y}px">${n}</div>`);
    return add(`<div class="mo" style="position:absolute;right:${1600 - 296}px;top:${y - 2}px;font-size:11.5px;font-weight:700"></div>`);
  });

  // ------------------------------------------------------------ 03 publicidade
  panel(28, 656, 282, 204, 'PUBLICIDADE · LED', '03');
  const adThumb = add(`<div style="position:absolute;left:42px;top:692px;width:60px;height:144px;border-radius:4px;background:#05070b;overflow:hidden;box-shadow:0 0 0 1px rgba(11,21,48,.2)"></div>`);
  const adName = add(`<div style="position:absolute;left:116px;top:694px;width:180px;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>`);
  const adSub = add(`<div class="sm" style="position:absolute;left:116px;top:716px"></div>`);
  add(`<div style="position:absolute;left:116px;top:736px;width:180px;height:4px;background:rgba(11,21,48,.09);border-radius:2px"></div>`);
  const adFill = add(`<div style="position:absolute;left:116px;top:736px;height:4px;background:${C.purple};border-radius:2px"></div>`);
  add(`<div class="sm" style="position:absolute;left:116px;top:756px;line-height:15px;font-size:8.2px">${SPEC.led.n} TELAS · ${SPEC.led.nits} NITS<br>${fmtN(SPEC.led.w, 2)} × ${fmtN(SPEC.led.h, 2)} m CADA<br>TROCA A CADA ${SPEC.led.slot} s</div>`);
  const adDots = add(`<div style="position:absolute;left:116px;top:818px;display:flex;gap:6px"></div>`);

  // ------------------------------------------------------------ 04 drone ao vivo
  const L = FEED.drone;
  panel(1313, 112, 258, 330, 'DRONE · AO VIVO', '04', L);
  add(`<div class="fd" style="left:${L.x - 1}px;top:${L.y - 1}px;width:${L.w + 2}px;height:${L.h + 2}px"></div>`);
  const droneNight = add(`<div class="night" style="left:${L.x}px;top:${L.y}px;width:${L.w}px;height:${L.h}px"></div>`);
  const droneOff = add(`<div class="mo" style="position:absolute;left:${L.x}px;top:${L.y}px;width:${L.w}px;height:${L.h}px;background:#0e1430;color:#7d8bb3;font-size:9.5px;letter-spacing:2px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.6">DRONE NA DOCA<br>CARREGANDO</div>`);
  const droneTag = add(`<div class="fdt" style="left:${L.x + 6}px;top:${L.y + 6}px"></div>`);
  const droneBox = add(`<div style="position:absolute;border:1.5px solid ${C.rec};box-shadow:0 0 0 1px rgba(255,255,255,.6);display:none"></div>`);
  const tele = ['ALTURA', 'VELOCIDADE', 'DISTÂNCIA', 'BATERIA', 'TEMPO DE VOO'].map((n, i) => {
    const y = 302 + i * 25;
    add(`<div class="sm" style="position:absolute;left:1327px;top:${y}px">${n}</div>`);
    return add(`<div class="mo" style="position:absolute;right:${1600 - 1557}px;top:${y - 2}px;font-size:11.5px;font-weight:700"></div>`);
  });
  add(`<div class="sm" style="position:absolute;left:1327px;top:428px;font-size:7.8px">CÂMERA 4/3 · 20 MP · ${SPEC.drone.flightMin} MIN DE VOO</div>`);

  // ------------------------------------------------------------ 05 sequência, 06 vistas, 07 exibição
  const btn = {};
  panel(1313, 456, 258, 76, 'SEQUÊNCIA', '05');
  add(`<div class="well" style="position:absolute;left:1327px;top:491px;width:230px;height:28px;border-radius:999px"></div>`);
  SEQS.forEach((k, i) => (btn[k] = add(`<div class="bt flat" style="left:${1329 + i * 76}px;top:493px;width:74px;height:24px">${SEQ_LABEL[k]}</div>`)));
  const btnRow = (keys, labels, x0, y, wmax = 230) => {
    let x = x0;
    let yy = y;
    for (const k of keys) {
      const w = Math.round(labels[k].length * 7 + 18);
      if (x + w > x0 + wmax) {
        x = x0;
        yy += 30;
      }
      btn[k] = add(`<div class="bt" style="left:${x}px;top:${yy}px;width:${w}px;height:23px">${labels[k]}</div>`);
      x += w + 6;
    }
  };
  panel(1313, 546, 258, 136, 'VISTAS', '06');
  btnRow(VIEWS, VIEW_LABEL, 1327, 582);
  panel(1313, 696, 258, 106, 'EXIBIÇÃO', '07');
  btnRow(DISPLAY, DISPLAY_LABEL, 1327, 732);
  add(`<div class="sm" style="position:absolute;left:1314px;top:818px;line-height:15px;font-size:8.2px">ARRASTE PARA GIRAR · RODA PARA ZOOM<br>TECLAS 1–8 VISTAS · ESPAÇO PAUSA</div>`);

  // ------------------------------------------------------------ 08 operação, com a legenda
  panel(430, 752, 740, 108, 'OPERAÇÃO', '08');
  btn.play = add(`<div class="bt on" style="left:445px;top:795px;width:44px;height:44px;font-size:15px"></div>`);
  const opPhase = add(`<div style="position:absolute;left:506px;width:506px;top:781px;text-align:center;font:600 14px/1.2 Inter,sans-serif;letter-spacing:-.1px;color:${C.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>`);
  const opFrom = add(`<div class="sm" style="position:absolute;left:506px;top:804px;font-size:7.8px"></div>`);
  const opTo = add(`<div class="sm" style="position:absolute;right:${1600 - 1012}px;top:804px;font-size:7.8px"></div>`);
  const TL = {x: 508, w: 504};
  add(`<div style="position:absolute;left:${TL.x}px;top:820px;width:${TL.w}px;height:3px;background:rgba(11,21,48,.09);border-radius:2px"></div>`);
  const tlFill = add(`<div style="position:absolute;left:${TL.x}px;top:820px;height:3px;background:linear-gradient(90deg,${C.ac},${C.purple});border-radius:2px"></div>`);
  const knob = `border-radius:50%;background:linear-gradient(180deg,#fff,rgba(255,255,255,.75));border:1.5px solid rgba(255,255,255,.95);box-shadow:0 0 0 1.5px ${C.acInk},0 2px 6px rgba(20,40,90,.25);box-sizing:border-box`;
  const tlKnob = add(`<div style="position:absolute;top:814px;width:15px;height:15px;margin-left:-7.5px;${knob}"></div>`);
  const tlTime = add(`<div class="mo" style="position:absolute;left:506px;top:834px;font-size:9.6px;color:${C.mute};letter-spacing:1px"></div>`);
  add(`<div class="sm" style="position:absolute;left:1029px;top:805px">VELOCIDADE</div>`);
  const SP = {x: 1031, w: 92};
  add(`<div style="position:absolute;left:${SP.x}px;top:823px;width:${SP.w}px;height:3px;background:rgba(11,21,48,.09);border-radius:2px"></div>`);
  const spFill = add(`<div style="position:absolute;left:${SP.x}px;top:823px;height:3px;background:${C.ac};border-radius:2px"></div>`);
  const spKnob = add(`<div style="position:absolute;top:817px;width:15px;height:15px;margin-left:-7.5px;${knob}"></div>`);
  const spVal = add(`<div class="mo" style="position:absolute;left:1128px;top:818px;font-size:10px;font-weight:700"></div>`);

  // a etiqueta do drone em voo, presa a ele na tela
  const dTag = add(`<div style="position:absolute;display:none;transform:translate(-50%,-100%);padding:3px 8px 3px 6px;border-radius:999px;background:rgba(255,255,255,.9);box-shadow:0 0 0 1.5px ${C.purple},0 4px 12px rgba(75,59,196,.25);font:700 9px 'JetBrains Mono',monospace;letter-spacing:1px;color:${C.ink};white-space:nowrap"></div>`);
  // aviso de alerta
  const toast = add(`<div class="alert"><b>⚠ PESSOA DETECTADA</b><span>CÂMERA DOME · DRONE ACIONADO</span><div class="ar"><i>CÂMERA</i><em data-face></em></div><div class="ar"><i>RESPOSTA</i><em>DECOLAGEM AUTOMÁTICA</em></div><div class="ar"><i>CENTRAL</i><em>IMAGEM AO VIVO</em></div></div>`);
  const toastFace = toast.querySelector('[data-face]');

  // rodapé
  add(`<div class="sm" style="position:absolute;left:27px;top:878px;letter-spacing:2.2px">SHOMER VISION &nbsp;·&nbsp; MODELO REPRESENTATIVO &nbsp;·&nbsp; DRONE DJI MAVIC 3 (BLENDERKIT) &nbsp;·&nbsp; CARRO COMRADE1280 (CC-BY) &nbsp;·&nbsp; PEDESTRE ROCKETBOX (MIT)</div>`);

  // ------------------------------------------------------------ rótulos e o ponteiro
  const callSvg = add(`<svg style="position:absolute;inset:0;overflow:visible" width="1600" height="900"></svg>`);
  const callG = add(`<div style="position:absolute;inset:0"></div>`);
  const ring = add(`<div class="ring"></div>`);
  const cur = add(`<div class="cur"><svg width="22" height="22" viewBox="0 0 34 34"><path d="M4 3 L30 13.5 L17.5 17.5 L13.5 30 Z" fill="#111" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg></div>`);
  const centre = (n) => {
    const r = n.getBoundingClientRect();
    const a = app.getBoundingClientRect();
    const k = a.width / 1600 || 1;
    return [(r.left - a.left + r.width / 2) / k, (r.top - a.top + r.height / 2) / k];
  };
  const spots = Object.fromEntries(Object.entries(btn).map(([k, n]) => [k, centre(n)]));
  const pointer = (c) => {
    cur.style.display = c.x < 0 ? 'none' : 'block';
    cur.style.transform = `translate(${(c.x - 3).toFixed(2)}px, ${(c.y - 2).toFixed(2)}px) scale(${c.press ? 0.88 : 1})`;
    ring.style.left = `${c.ringX}px`;
    ring.style.top = `${c.ringY}px`;
    ring.style.opacity = String(c.ring * 0.85);
    ring.style.transform = `scale(${(0.35 + 0.9 * (1 - c.ring)).toFixed(3)})`;
  };
  const clock = (s) => `00:${String(Math.floor(s)).padStart(2, '0')}`;
  const onBtn = (k, on) => btn[k].classList.toggle('on', on);
  const box = (n, b, area) => {
    if (!b) return (n.style.display = 'none');
    const [x, y, w, h] = b;
    const inside = x > area.x && x + w < area.x + area.w && y > area.y && y + h < area.y + area.h && w > 3;
    n.style.display = inside ? 'block' : 'none';
    Object.assign(n.style, {left: `${x - 2}px`, top: `${y - 2}px`, width: `${w + 4}px`, height: `${h + 4}px`});
  };
  let adShown = -1;

  return {
    spots,
    btn,
    root: ui,
    TL,
    SP,
    update(s) {
      const m = s.m;
      const f = m.flight;
      // estado
      const [title, sub, kind] = s.status;
      chip.style.background = kind === 'alert' ? C.rec : kind === 'ok' ? C.ok : kind === 'move' ? C.ac : C.mute;
      stTitle.textContent = title;
      stTitle.style.color = kind === 'alert' ? '#b4232a' : '';
      stSub.textContent = sub;
      bDock.set(m.lids, m.lids > 0.99 ? 'ABERTA' : m.lids < 0.01 ? 'FECHADA' : `${Math.round(m.lids * 90)}°`, m.lids > 0.99 ? C.ok : C.ac);
      bAlt.set(f.agl / 16, `${fmtN(f.agl, 1)} m`, C.purple);
      bBat.set(f.battery, `${Math.round(f.battery * 100)}%`, C.ok);
      bLink.set(0.86, 'LTE · −68', C.ok);
      // dome
      const k = m.active;
      const a = m.domes[k];
      domeNight.style.opacity = droneNight.style.opacity = String(s.night);
      domeTag.textContent = `DOME ${FACES[k].name} · ${fmtN(a.zoom, 1)}×${m.alert ? ' · PESSOA' : ''}`;
      box(domeBox, s.personBox, FEED.dome);
      {
        const R = 36;
        let h = `<rect x="30" y="30" width="28" height="28" rx="3" fill="${C.ink}"/>`;
        h += `<rect x="6" y="68" width="76" height="14" fill="#e3e8ee"/><text x="44" y="78" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="${C.mute}" letter-spacing="1">RUA</text>`;
        for (let i = 0; i < 4; i++) {
          const yaw = (FACES[i].yaw + m.domes[i].pan) * (Math.PI / 180);
          const half = Math.atan(Math.tan((SPEC.dome.hfov / 2) * (Math.PI / 180)) / m.domes[i].zoom);
          const X = (an, r) => (44 + Math.sin(an) * r).toFixed(1);
          const Y = (an, r) => (44 + Math.cos(an) * r).toFixed(1);
          h += `<path d="M44 44L${X(yaw - half, R)} ${Y(yaw - half, R)}A${R} ${R} 0 0 0 ${X(yaw + half, R)} ${Y(yaw + half, R)}Z" fill="${i === k ? C.ac : '#9fb0c8'}" opacity="${i === k ? 0.45 : 0.22}"/>`;
        }
        if (m.person) {
          const px = 44 + Math.max(-40, Math.min(40, m.person.x * 1.6));
          const pz = 44 + Math.max(-40, Math.min(40, m.person.z * 1.6));
          h += `<circle cx="${px.toFixed(1)}" cy="${pz.toFixed(1)}" r="3.2" fill="${C.rec}"/>`;
        }
        if (f.flying) h += `<circle cx="${(44 + Math.max(-40, Math.min(40, m.drone.x * 1.6))).toFixed(1)}" cy="${(44 + Math.max(-40, Math.min(40, m.drone.z * 1.6))).toFixed(1)}" r="3.2" fill="none" stroke="${C.purple}" stroke-width="1.6"/>`;
        plan.innerHTML = h;
        domeVals[0].textContent = FACES[k].name;
        domeVals[1].textContent = `${fmtN(a.pan, 0)}°`;
        domeVals[2].textContent = `${fmtN(a.zoom, 1)}×`;
        domeVals[3].textContent = `4 × ${SPEC.dome.hfov}°`;
      }
      // publicidade
      if (adShown !== m.ad) {
        adShown = m.ad;
        const src = s.adThumbs?.[m.ad];
        adThumb.innerHTML = src ? `<img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block">` : '';
        adName.textContent = AD_NAMES[m.ad];
        adDots.innerHTML = AD_NAMES.map((_, i) => `<i style="display:block;width:${i === m.ad ? 16 : 6}px;height:6px;border-radius:3px;background:${i === m.ad ? C.purple : C.faint}"></i>`).join('');
      }
      adSub.textContent = `ANÚNCIO ${m.ad + 1}/${AD_NAMES.length} · 4 FACES`;
      adFill.style.width = `${((m.adAge / SPEC.led.slot) * 180).toFixed(1)}px`;
      // drone
      droneOff.style.display = f.flying || m.lids > 0.5 ? 'none' : 'flex';
      droneTag.style.display = f.flying || m.lids > 0.5 ? 'block' : 'none';
      droneTag.textContent = `DRONE · ${f.flying ? (m.drone.target ? 'ACOMPANHANDO' : 'EM VOO') : 'NA DOCA'}`;
      box(droneBox, s.droneBox, FEED.drone);
      tele[0].textContent = `${fmtN(f.agl, 1)} m`;
      tele[1].textContent = `${fmtN(f.speed * 3.6, 0)} km/h`;
      tele[2].textContent = `${fmtN(f.dist, 0)} m`;
      tele[3].textContent = `${Math.round(f.battery * 100)}%`;
      tele[4].textContent = `${Math.floor(f.time / 60)}:${String(Math.floor(f.time % 60)).padStart(2, '0')}`;
      // a etiqueta do drone
      {
        const p = s.droneTag;
        const inside = p && p[0] > 330 && p[0] < 1290 && p[1] > 70 && p[1] < 745;
        dTag.style.display = inside ? 'block' : 'none';
        if (inside) {
          dTag.style.left = `${p[0].toFixed(1)}px`;
          dTag.style.top = `${(p[1] - 12).toFixed(1)}px`;
          dTag.innerHTML = `<span style="color:${C.purple}">◆</span> DRONE · ${fmtN(f.agl, 0)} m`;
        }
      }
      // alerta
      {
        const al = m.alert;
        const o = al ? Math.min(1, al.age / 0.35) * (1 - Math.max(0, Math.min(1, (al.age - 6) / 0.6))) : 0;
        toast.style.opacity = o.toFixed(3);
        toastFace.textContent = al ? `DOME ${FACES[al.face].name}` : '';
      }
      // botões
      for (const k2 of SEQS) {
        const on2 = s.seq === k2;
        btn[k2].classList.toggle('on', on2);
        btn[k2].classList.toggle('flat', !on2);
        btn[k2].style.color = on2 ? '' : '#6f7a8c';
      }
      for (const k2 of VIEWS) onBtn(k2, s.view === k2);
      for (const k2 of DISPLAY) onBtn(k2, !!s.display[k2]);
      // operação
      btn.play.innerHTML = s.paused ? '▶' : '❚❚';
      opFrom.textContent = s.from;
      opTo.textContent = s.to;
      if (opPhase.textContent !== s.caption) opPhase.textContent = s.caption;
      const ck = Math.max(0, Math.min(1, s.captionAge / 0.5));
      opPhase.style.opacity = (ck * ck * (3 - 2 * ck)).toFixed(3);
      opPhase.style.transform = `translateY(${((1 - ck) * 4).toFixed(1)}px)`;
      const kx = TL.x + s.prog * TL.w;
      tlFill.style.width = `${(s.prog * TL.w).toFixed(1)}px`;
      tlKnob.style.left = `${kx.toFixed(1)}px`;
      tlTime.textContent = `${clock(s.tau)} / ${clock(s.dur)}`;
      const sk = SP.x + s.speedK * SP.w;
      spFill.style.width = `${(s.speedK * SP.w).toFixed(1)}px`;
      spKnob.style.left = `${sk.toFixed(1)}px`;
      spVal.textContent = `${fmtN(s.speed, 1)}×`;
      // rótulos
      let lh = '';
      let ch = '';
      for (const c of s.callouts) {
        if (c.o < 0.02 || !c.at) continue;
        const [ax, ay] = c.at;
        const [lx, ly] = c.label;
        const rgt = lx > ax;
        const ex = rgt ? lx - 6 : lx + c.w + 6;
        lh += `<polyline points="${ax.toFixed(1)},${ay.toFixed(1)} ${ex.toFixed(1)},${(ly + 6).toFixed(1)}" fill="none" stroke="${C.acInk}" stroke-width=".9" opacity="${c.o.toFixed(2)}"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.4" fill="${C.acInk}" opacity="${c.o.toFixed(2)}"/>`;
        ch += `<div class="call" style="left:${lx.toFixed(1)}px;top:${(ly - 1).toFixed(1)}px;opacity:${c.o.toFixed(2)}"><b><i></i>${c.name}</b><span>${c.sub}</span></div>`;
      }
      callSvg.innerHTML = lh;
      callG.innerHTML = ch;
      pointer(s.cursor);
    },
    pointer,
  };
}
