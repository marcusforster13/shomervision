// A marca Shomer Vision: o logo original (src/logo.js, sobre o fundo escuro da arte do painel) e os anúncios que giram
// nos quatro painéis de LED. O primeiro anúncio é a arte original do painel; os outros são desenhados aqui.
import {LOGO_ASPECT, LOGO_URL} from './logo.js';

export const BRAND = {blue: '#2f7fd8', blueInk: '#1d63b8', purple: '#4b3bc4', ink: '#0b1530', dark: '#05070b'};

export async function loadLogo() {
  const img = new Image();
  img.src = LOGO_URL;
  await img.decode();
  return img;
}
/** O logo como <img>, altura h, num quadro escuro arredondado (o fundo original da arte). */
export const logoImg = (h) => `<div style="display:inline-block;background:${BRAND.dark};border-radius:${Math.round(h * 0.14)}px;padding:${Math.round(h * 0.06)}px ${Math.round(h * 0.1)}px;box-shadow:0 4px 14px rgba(11,21,48,.25);line-height:0"><img src="${LOGO_URL}" alt="Shomer Vision" height="${h}" width="${Math.round(h * LOGO_ASPECT)}" style="display:block"></div>`;

const W = 600;
const H = 1440;
const base = (g) => {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#05070b');
  gr.addColorStop(1, '#0a1022');
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
};
const text = (g, s, y, size, color, weight = 700, spacing = 0) => {
  g.font = `${weight} ${size}px Inter, sans-serif`;
  g.fillStyle = color;
  g.textAlign = 'center';
  if (g.letterSpacing !== undefined) g.letterSpacing = `${spacing}px`;
  g.fillText(s, W / 2, y);
};
/** Os anúncios 2, 3 e 4 (o 1 é a arte original do painel), 600 x 1440 como a tela de LED. */
export function adSlides(logo) {
  const make = (draw) => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    base(g);
    draw(g);
    return c;
  };
  return [
    make((g) => {
      // anuncie aqui
      g.strokeStyle = BRAND.blue;
      g.lineWidth = 6;
      g.strokeRect(60, 300, W - 120, 560);
      text(g, 'SEU', 470, 92, '#e8ecf6', 800);
      text(g, 'ANÚNCIO', 580, 92, '#e8ecf6', 800);
      text(g, 'AQUI', 690, 92, BRAND.blue, 800);
      text(g, 'TELA DE LED 2.500 NITS', 960, 30, '#9aa6c4', 600, 3);
      text(g, 'VISÍVEL DIA E NOITE', 1010, 30, '#9aa6c4', 600, 3);
      g.drawImage(logo, W / 2 - 75, 1120, 150, 150 / LOGO_ASPECT);
    }),
    make((g) => {
      // segurança 24 h
      text(g, '24h', 520, 210, BRAND.blue, 800);
      text(g, 'VIGILÂNCIA', 660, 60, '#e8ecf6', 800, 4);
      text(g, '4 câmeras · 360°', 760, 38, '#9aa6c4', 500);
      text(g, 'drone de resposta', 815, 38, '#9aa6c4', 500);
      g.fillStyle = BRAND.purple;
      g.fillRect(W / 2 - 110, 880, 220, 6);
      g.drawImage(logo, W / 2 - 75, 1120, 150, 150 / LOGO_ASPECT);
    }),
    make((g) => {
      // parceiro fictício
      g.fillStyle = '#c8a46a';
      g.beginPath();
      g.arc(W / 2, 520, 150, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#05070b';
      g.beginPath();
      g.ellipse(W / 2, 520, 60, 95, 0.5, 0, Math.PI * 2);
      g.fill();
      text(g, 'CAFÉ DA PRAÇA', 800, 54, '#f1e6d2', 800, 2);
      text(g, 'a 50 metros daqui', 860, 34, '#c8b896', 500);
      text(g, '2º café grátis', 960, 44, '#c8a46a', 700);
      text(g, 'ANÚNCIO DE EXEMPLO', 1340, 22, '#5d6680', 600, 3);
    }),
  ];
}
export const AD_NAMES = ['Shomer Vision', 'Seu anúncio aqui', 'Vigilância 24 h', 'Café da Praça (exemplo)'];

/** Placa Mercosul 400 x 130 mm: faixa azul com BRASIL, os 7 caracteres. */
export function mercosulPlate(textS) {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 260;
  const g = c.getContext('2d');
  g.fillStyle = '#f7f7f4';
  g.fillRect(0, 0, 800, 260);
  g.fillStyle = '#1f47a8';
  g.fillRect(0, 0, 800, 58);
  g.fillStyle = '#ffffff';
  g.font = '700 38px Inter, sans-serif';
  g.textAlign = 'center';
  g.fillText('BRASIL', 400, 43);
  g.fillStyle = '#111111';
  g.font = '700 168px "JetBrains Mono", monospace';
  g.fillText(textS, 400, 232, 740);
  g.strokeStyle = '#111111';
  g.lineWidth = 6;
  g.strokeRect(3, 3, 794, 254);
  return c;
}
