// Gera src/logo.js com o logo original do Shomer Vision (recortado da arte do painel LED, assets/logo_tile.png).
import fs from 'node:fs';
const b64 = fs.readFileSync('assets/logo_tile.png').toString('base64');
fs.writeFileSync('src/logo.js', `// Gerado por tools/logo.mjs a partir de assets/logo_tile.png (o logo original do Shomer Vision). Não editar.\nexport const LOGO_URL = 'data:image/png;base64,${b64}';\nexport const LOGO_ASPECT = 300 / 398;\n`);
