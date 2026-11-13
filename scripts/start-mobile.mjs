import os from 'node:os';
import { spawn } from 'node:child_process';
import path from 'node:path';

// 1. Detect physical non-virtual network IP (Wi-Fi or Ethernet)
const interfaces = os.networkInterfaces();
let physicalIp = '127.0.0.1';

for (const [name, addrs] of Object.entries(interfaces)) {
  const lower = name.toLowerCase();
  // Filter out Hyper-V, WSL, VirtualBox, VMware, and Loopback
  if (lower.includes('vethernet') || lower.includes('wsl') || lower.includes('virtual') || lower.includes('loopback')) {
    continue;
  }
  for (const addr of addrs || []) {
    if (addr.family === 'IPv4' && !addr.internal) {
      physicalIp = addr.address;
      break;
    }
  }
  if (physicalIp !== '127.0.0.1') break;
}

console.log('====================================================');
console.log('👑 ROYAL LUDO - EXPO MOBILE CLIENT LAUNCHER');
console.log(`📱 Active Mobile Wi-Fi IP: ${physicalIp}`);
console.log(`🌐 Expo Go URL: exp://${physicalIp}:8081`);
console.log('📲 How to play on your mobile phone:');
console.log('   1. Connect your phone to the same Wi-Fi network.');
console.log('   2. Open the Expo Go app on your phone.');
console.log(`   3. Scan the terminal QR code OR enter: exp://${physicalIp}:8081`);
console.log('   4. Press "w" in this terminal anytime to test in Chrome/Edge.');
console.log('   5. Press "a" to run on a connected Android phone/emulator.');
console.log('   ℹ️ Metro Bundler is an active server that remains running while you play!');
console.log('====================================================\n');

// 2. Set environment variables for Expo Metro packager
const env = {
  ...process.env,
  REACT_NATIVE_PACKAGER_HOSTNAME: physicalIp,
  EXPO_PUBLIC_SOCKET_URL: `http://${physicalIp}:4000`,
};

// 3. Forward any command-line arguments (e.g. --tunnel, --clear, etc.)
const extraArgs = process.argv.slice(2);
const mobileDir = path.resolve('mobile');
const cmd = process.platform === 'win32' ? 'cmd.exe' : 'npx';
const args = process.platform === 'win32' 
  ? ['/c', 'npx', 'expo', 'start', ...extraArgs] 
  : ['expo', 'start', ...extraArgs];

const child = spawn(cmd, args, {
  cwd: mobileDir,
  env,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
