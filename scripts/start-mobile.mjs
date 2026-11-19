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
const forceOnline = extraArgs.includes('--online');
const filteredArgs = extraArgs.filter((a) => a !== '--online');
const port = hasPortArg ? 8081 : await findFreePort(8081);
const expoUrl = `exp://${physicalIp}:${port}`;

console.log('====================================================');
console.log('👑 ROYAL LUDO - EXPO MOBILE CLIENT LAUNCHER');
console.log(`📱 Active Mobile Wi-Fi / Hotspot IP: ${physicalIp}`);
if (!isTunnel) {
  console.log(`🌐 Expo Go URL: ${expoUrl}`);
} else {
  console.log('🌐 Tunnel mode enabled — wait for Expo to print the exp.direct QR code below.');
}
console.log('⏳ Booting Metro Bundler (fast offline startup — no hanging on api.expo.dev)...');
console.log('====================================================\n');

// 3. Set environment variables for Expo Metro packager
const env = {
  ...process.env,
  REACT_NATIVE_PACKAGER_HOSTNAME: physicalIp,
  EXPO_PUBLIC_SOCKET_URL: `http://${physicalIp}:4000`,
};

// 4. Build Expo start arguments (--offline prevents Metro from hanging on Expo API validation)
const expoArgs = ['expo', 'start', '--go'];
if (!isTunnel && !forceOnline && !filteredArgs.includes('--offline')) {
  expoArgs.push('--offline');
}
if (!hasPortArg) {
  expoArgs.push('--port', String(port));
}
expoArgs.push(...filteredArgs);

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

// 5. Wait until Metro is genuinely listening before showing the scannable QR code!
if (!isTunnel) {
  const waitForMetro = async () => {
    for (let attempt = 0; attempt < 40; attempt++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/status`);
        const text = await res.text();
        if (text.includes('packager-status:running')) {
          console.log('\n====================================================');
          console.log(`✅ METRO BUNDLER IS LIVE! Scan this QR code in Expo Go:`);
          console.log(`🌐 URL: ${expoUrl}`);
          console.log('====================================================\n');
          try {
            const qrcode = require(path.resolve('mobile/node_modules/qrcode-terminal'));
            qrcode.generate(expoUrl, { small: true });
            console.log('\n📲 Open Expo Go → Scan QR code (or Enter URL manually above).');
            console.log('   Press "w" for Web, "a" for Android USB.\n');
          } catch {}
          return;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
  };
  waitForMetro();
}

child.on('exit', (code) => {
  process.exit(code || 0);
});
