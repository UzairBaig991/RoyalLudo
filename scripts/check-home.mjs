import fs from 'node:fs';

const s = fs.readFileSync('server/src/web/index.html', 'utf-8');
const idx = s.indexOf('id="view-home"');
const endIdx = s.indexOf('</section>', idx);
console.log(s.slice(idx, endIdx + 10));
