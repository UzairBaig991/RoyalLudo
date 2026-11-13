import fs from 'node:fs';

const s = fs.readFileSync('server/src/web/index.html', 'utf-8');
const idx = s.indexOf('<!-- 4 SECONDARY MODES GRID -->');
console.log(s.slice(idx, idx + 1800));
