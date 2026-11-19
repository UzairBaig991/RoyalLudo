import os from 'node:os';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

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

// 2. Find an available port starting from 8081 so Expo never stalls on "Port 8081 is being used"
function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port, '0.0.0.0');
  });
}

async function findFreePort(startPort = 8081) {
  for (let p = startPort; p < startPort + 20; p++) {
    if (await isPortFree(p)) return p;
  }
  return startPort;
}

const extraArgs = process.argv.slice(2);
const hasPortArg = extraArgs.some((a) => a === '--port' || a === '-p' || a.startsWith('--port='));
const isTunnel = extraArgs.includes('--tunnel');
const port = hasPortArg ? 8081 : await findFreePort(8081);
const expoUrl = `exp://${physicalIp}:${port}`;

console.log('====================================================');
console.log('👑 ROYAL LUDO - EXPO MOBILE CLIENT LAUNCHER');
console.log(`📱 Active Mobile Wi-Fi IP: ${physicalIp}`);
if (!isTunnel) {
  console.log(`🌐 Expo Go URL: ${expoUrl}`);
} else {
  console.log('🌐 Tunnel mode enabled — wait for Expo to print the exp.direct QR code below.');
}
console.log('📲 How to play on your mobile phone:');
console.log('   1. Connect your phone to the same Wi-Fi network.');
console.log('   2. Open the Expo Go app on your phone.');
console.log(`   3. Scan the QR code below OR enter: ${expoUrl}`);
console.log('   4. Press "w" in this terminal anytime to test in Chrome/Edge.');
console.log('   5. Press "a" to run on a connected Android phone/emulator.');
console.log('   ℹ️ Metro Bundler is an active server that remains running while you play!');
console.log('====================================================\n');

// 3. Print scannable QR code immediately (guaranteed even if Expo runs non-interactively)
if (!isTunnel) {
  try {
    const qrcode = require(path.resolve('mobile/node_modules/qrcode-terminal'));
    console.log(`📷 Scan this QR code in Expo Go (${expoUrl}):\n`);
    qrcode.generate(expoUrl, { small: true });
    console.log('');
  } catch {
    // Fallback to Expo's built-in QR code output
  }
}

// 4. Set environment variables for Expo Metro packager
const env = {
  ...process.env,
  REACT_NATIVE_PACKAGER_HOSTNAME: physicalIp,
  EXPO_PUBLIC_SOCKET_URL: `http://${physicalIp}:4000`,
};

// 5. Forward any command-line arguments (e.g. --tunnel, --clear, etc.)
const expoArgs = ['expo', 'start', '--go'];
if (!hasPortArg) {
  expoArgs.push('--port', String(port));
}
expoArgs.push(...extraArgs);

const mobileDir = path.resolve('mobile');
const cmd = process.platform === 'win32' ? 'cmd.exe' : 'npx';
const args = process.platform === 'win32'
  ? ['/c', 'npx', ...expoArgs]
  : expoArgs;

const child = spawn(cmd, args, {
  cwd: mobileDir,
  env,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
