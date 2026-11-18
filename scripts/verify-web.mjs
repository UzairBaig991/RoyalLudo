import fs from 'fs';

const content = fs.readFileSync('server/src/web/index.html', 'utf8');

// Extract all onclick="funcName(...)
const onclickRegex = /onclick="([a-zA-Z0-9_]+)\s*\(/g;
const fnCalls = [];
let match;
while ((match = onclickRegex.exec(content)) !== null) {
  if (match[1] !== 'if') {
    fnCalls.push(match[1]);
  }
}

// Extract all function funcName(
const defRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
const definedFns = new Set();
while ((match = defRegex.exec(content)) !== null) {
  definedFns.add(match[1]);
}

const missing = [...new Set(fnCalls)].filter(f => !definedFns.has(f));
console.log('Missing functions called in onclicks:', missing);

// Check syntax of all inline script blocks
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let blockIdx = 0;
let allValid = true;
while ((match = scriptRegex.exec(content)) !== null) {
  blockIdx++;
  try {
    new Function(match[1]);
  } catch (e) {
    allValid = false;
    console.error(`Script block #${blockIdx} syntax error:`, e.message);
  }
}

if (allValid && missing.length === 0) {
  console.log(`Script syntax: PASS (${blockIdx} inline script blocks verified, 0 missing onclick handlers)`);
} else {
  process.exit(1);
}
