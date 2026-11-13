import fs from 'fs';

const content = fs.readFileSync('server/src/web/index.html', 'utf8');

// Extract all onclick="funcName(...)
const onclickRegex = /onclick="([a-zA-Z0-9_]+)\s*\(/g;
const fnCalls = [];
let match;
while ((match = onclickRegex.exec(content)) !== null) {
  fnCalls.push(match[1]);
}

// Extract all function funcName(
const defRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
const definedFns = new Set();
while ((match = defRegex.exec(content)) !== null) {
  definedFns.add(match[1]);
}

const missing = [...new Set(fnCalls)].filter(f => !definedFns.has(f));
console.log('Missing functions called in onclicks:', missing);

// Check syntax of script block
const scriptStart = content.indexOf('<script>');
const scriptEnd = content.lastIndexOf('</script>');
const scriptBody = content.slice(scriptStart + 8, scriptEnd);

try {
  new Function(scriptBody);
  console.log('Script syntax: PASS (no syntax errors)');
} catch (e) {
  console.error('Script syntax error:', e.message);
}
