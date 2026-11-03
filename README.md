# Shomer Vision · Totem com Drone

Showroom 3D interativo do Shomer Vision: totem móvel com **quatro painéis de LED** para publicidade, uma **câmera dome
em cada face** (vigilância de 360°) e uma **doca** que abre e lança um **drone** de resposta automática.

- `public/index.html`: a página pronta, um arquivo só (é o que a Vercel publica).
- Sem mexer, a página faz um passeio automático com legendas; um clique devolve o controle.
- **Sequências:** VIGIAR (anúncios e domes), MISSÃO (a dome detecta uma pessoa, a doca abre, o drone decola,
  acompanha do alto, volta e pousa), RONDA (duas voltas de patrulha em torno do totem).
- **Vistas:** teclas 1–8. Arraste para girar, roda para zoom.
- **Exibição:** rótulos, cobertura (leques das domes e campo do drone), explodida, noite, órbita.

Os painéis ao vivo vêm do mesmo modelo que move as peças (`src/kin.js`). Medidas e especificações representativas.

## Estrutura

| Arquivo | Função |
|---|---|
| `src/kin.js` | Sequências, doca, drone, domes, anúncios, legendas. Sem three.js. |
| `src/rig.js` | O totem do Blender (`src/shomer.glb`), tampas, drone e hélices, domes, LED, pedestre, carro. |
| `src/stage.js` | Estúdio, rua, sombras e as imagens ao vivo da dome e do drone. |
| `src/console.js` | O console em vidro (estilo Liquid Glass, em CSS). |
| `src/film.js` / `src/live.js` | O filme (função pura do tempo) e a página interativa. |
| `src/brand.js` / `src/logo.js` | O logo original (da arte do painel LED) e os anúncios. |
| `tools/export_web.py` | Exporta o `.blend` para `src/shomer.glb` (domes nas 4 faces, texturas leves). |

## Créditos

- Drone: "DJI Mavic 3 Classic Drone" de Dovydas Alytas (BlenderKit, royalty free).
- Carro: "Generic passenger car pack" de [Comrade1280](https://sketchfab.com/comrade1280), CC-BY 4.0.
- Pedestre: Microsoft Rocketbox, licença MIT.
