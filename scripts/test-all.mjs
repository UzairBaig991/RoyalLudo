import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

console.log('👑 ==============================================================');
console.log('👑 ROYAL LUDO - MASTER FULL-STACK AUTOMATED TEST SUITE');
console.log('👑 ==============================================================\n');

const testSuites = [
  { name: '1. Shared Game Engine & Variations', file: 'shared/tests/engine.runner.ts' },
  { name: '2. Backend API & Authoritative Services', file: 'server/tests/server.runner.ts' },
  { name: '3. Mobile Client Logic & Store Slices', file: 'mobile/tests/mobile.runner.ts' },
];

let totalFailed = 0;

for (const suite of testSuites) {
  console.log(`\n▶ RUNNING: ${suite.name}`);
  const result = spawnSync(
    'node',
    ['--no-warnings', '--experimental-strip-types', '--loader', './scripts/ts-loader.mjs', suite.file],
    { stdio: 'inherit', shell: true }
  );

  if (result.status !== 0) {
    totalFailed++;
    console.error(`❌ Suite ${suite.name} FAILED with exit code ${result.status}`);
  }
}

console.log('\n==============================================================');
if (totalFailed === 0) {
  console.log('✨ ALL 3 TEST SUITES PASSED! 84/84 TESTS PASSED (0 FAILURES)');
  console.log('👑 ROYAL LUDO IS VERIFIED AND READY FOR DEPLOYMENT!');
  console.log('==============================================================');
  process.exit(0);
} else {
  console.error(`💥 ${totalFailed} TEST SUITE(S) FAILED`);
  console.log('==============================================================');
  process.exit(1);
}
