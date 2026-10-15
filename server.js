import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { startTunnel } from 'untun';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-memory room store
const rooms = new Map();

// Active interactive terminal processes per room (roomId -> { child, tempDir })
const roomProcesses = new Map();

function killRoomProcess(roomId) {
  const procInfo = roomProcesses.get(roomId);
  if (!procInfo) return;
  roomProcesses.delete(roomId);
  const { child, tempDir } = procInfo;
  if (child && child.pid) {
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${child.pid} /T /F`, () => {});
      } else {
        child.kill('SIGKILL');
      }
    } catch (e) {}
  }
  if (tempDir) {
    setTimeout(() => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}
    }, 1500);
  }
}

// Cloudflare 24/7 Tunnel State
let activeTunnel = null;
let activeTunnelUrl = null;
let isTunnelStarting = false;

async function startCloudflareTunnel(port) {
  if (activeTunnelUrl) return activeTunnelUrl;
  if (isTunnelStarting) {
    while (isTunnelStarting) {
      await new Promise(r => setTimeout(r, 300));
    }
    return activeTunnelUrl;
  }

  isTunnelStarting = true;
  try {
    activeTunnel = await startTunnel({ port });
    activeTunnelUrl = await activeTunnel.getURL();
    console.log(`\n======================================================`);
    console.log(`🌍 Cloudflare 24/7 Public Link: ${activeTunnelUrl}`);
    console.log(`⚡ Share this link with friends anywhere in the world!`);
    console.log(`======================================================\n`);
    return activeTunnelUrl;
  } catch (err) {
    console.error('Failed to start Cloudflare tunnel:', err.message);
    return null;
  } finally {
    isTunnelStarting = false;
  }
}

const USER_COLORS = [
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#e11d48'  // rose
];

const DEFAULT_TEMPLATES = {
  javascript: `// Welcome to LiveCodeShare!
// Collaborate live with friends on desktop, tablet, or phone.

function calculateStats(numbers) {
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / numbers.length;
  return { sum, avg, count: numbers.length };
}

const scores = [88, 92, 79, 95, 100];
console.log("Team Scores:", scores);
console.log("Statistics:", calculateStats(scores));
`,
  python: `# Welcome to LiveCodeShare!
# Write and run Python code collaboratively in real time.

def fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]

print("First 10 Fibonacci numbers:")
print(fibonacci(10))
`,
  cpp: `// Welcome to LiveCodeShare!
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> nums = {10, 20, 30, 40, 50};
    int sum = std::accumulate(nums.begin(), nums.end(), 0);
    
    std::cout << "Live C++ Session" << std::endl;
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}
`
};

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: DEFAULT_TEMPLATES.javascript,
      language: 'javascript',
      users: new Map(),
      messages: []
    });
  }
  return rooms.get(roomId);
}

// Socket.io handlers
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUser = null;

  socket.on('join-room', ({ roomId, username }) => {
    currentRoomId = roomId;
    const room = getRoom(roomId);
    socket.join(roomId);

    const userCount = room.users.size;
    const assignedColor = USER_COLORS[userCount % USER_COLORS.length];
    const cleanUsername = username?.trim() || `Dev-${Math.floor(100 + Math.random() * 900)}`;

    currentUser = {
      id: socket.id,
      username: cleanUsername,
      color: assignedColor,
      cursor: null
    };

    room.users.set(socket.id, currentUser);

    // Send initial room snapshot to joining user
    socket.emit('init-room', {
      code: room.code,
      language: room.language,
      users: Array.from(room.users.values()),
      messages: room.messages,
      selfUser: currentUser
    });

    // Notify other users
    socket.to(roomId).emit('user-joined', {
      user: currentUser,
      users: Array.from(room.users.values())
    });

    // Add system notification to chat
    const sysMsg = {
      id: `sys-${Date.now()}-${Math.random()}`,
      user: { username: 'System', color: '#94a3b8' },
      text: `${currentUser.username} joined the room.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    room.messages.push(sysMsg);
    io.to(roomId).emit('chat-message', sysMsg);
  });

  socket.on('code-change', ({ code }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    room.code = code;
    socket.to(currentRoomId).emit('code-update', {
      code,
      senderId: socket.id
    });
  });

  socket.on('cursor-change', ({ cursor }) => {
    if (!currentRoomId || !currentUser) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    currentUser.cursor = cursor;
    socket.to(currentRoomId).emit('cursor-update', {
      userId: socket.id,
      username: currentUser.username,
      color: currentUser.color,
      cursor
    });
  });

  socket.on('language-change', ({ language }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    room.language = language;
    if (DEFAULT_TEMPLATES[language] && room.code === DEFAULT_TEMPLATES[room.prevLang || 'javascript']) {
      room.code = DEFAULT_TEMPLATES[language];
    }
    room.prevLang = language;

    io.to(currentRoomId).emit('language-update', {
      language,
      code: room.code,
      senderId: socket.id
    });
  });

  socket.on('send-chat', ({ text }) => {
    if (!currentRoomId || !currentUser || !text?.trim()) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const msg = {
      id: `msg-${Date.now()}-${Math.random()}`,
      user: currentUser,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (room.messages.length > 200) {
      room.messages.shift();
    }
    room.messages.push(msg);

    io.to(currentRoomId).emit('chat-message', msg);
  });

  socket.on('disconnect', () => {
    if (!currentRoomId || !currentUser) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    room.users.delete(socket.id);

    socket.to(currentRoomId).emit('user-left', {
      userId: socket.id,
      users: Array.from(room.users.values())
    });

    const leaveMsg = {
      id: `sys-${Date.now()}-${Math.random()}`,
      user: { username: 'System', color: '#94a3b8' },
      text: `${currentUser.username} left the room.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    room.messages.push(leaveMsg);
    socket.to(currentRoomId).emit('chat-message', leaveMsg);

    if (room.users.size === 0) {
      killRoomProcess(currentRoomId);
      setTimeout(() => {
        const checkRoom = rooms.get(currentRoomId);
        if (checkRoom && checkRoom.users.size === 0) {
          rooms.delete(currentRoomId);
        }
      }, 30 * 60 * 1000);
    }
  });

  // --- Live Interactive Terminal Event Handlers ---
  socket.on('terminal:run', async ({ roomId, language, code }) => {
    const targetRoom = roomId || currentRoomId;
    if (!targetRoom) return;
    killRoomProcess(targetRoom);

    io.to(targetRoom).emit('terminal:status', { running: true, mode: language?.toUpperCase() || 'RUN' });
    io.to(targetRoom).emit('terminal:data', `\r\n\x1b[36m🚀 Executing ${language || 'script'} in interactive terminal...\x1b[0m\r\n`);

    const tempDir = path.join(os.tmpdir(), `lcs-term-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    try {
      fs.mkdirSync(tempDir, { recursive: true });
    } catch (e) {}

    let cmd = '';
    let args = [];

    if (language === 'python') {
      const scriptPath = path.join(tempDir, 'main.py');
      fs.writeFileSync(scriptPath, code);
      cmd = 'python';
      args = ['-u', scriptPath];
    } else if (language === 'javascript' || language === 'typescript') {
      const scriptPath = path.join(tempDir, 'main.mjs');
      fs.writeFileSync(scriptPath, code);
      cmd = process.execPath;
      args = [scriptPath];
    } else if (language === 'cpp') {
      io.to(targetRoom).emit('terminal:data', `\x1b[90m⚙️ Compiling with g++...\x1b[0m\r\n`);
      const srcPath = path.join(tempDir, 'main.cpp');
      const exePath = path.join(tempDir, 'main.exe');
      fs.writeFileSync(srcPath, code);

      const compileResult = await runCommandInSandbox('g++', ['-O2', srcPath, '-o', exePath], { cwd: tempDir });
      if (compileResult.code !== 0) {
        io.to(targetRoom).emit('terminal:data', `\r\n\x1b[31m${cleanOutput(compileResult.stderr || compileResult.stdout, tempDir)}\x1b[0m\r\n`);
        io.to(targetRoom).emit('terminal:exit', { code: compileResult.code });
        io.to(targetRoom).emit('terminal:status', { running: false });
        return;
      }
      io.to(targetRoom).emit('terminal:data', `\x1b[32m✔ Build successful!\x1b[0m\r\n\r\n`);
      cmd = exePath;
      args = [];
    } else if (language === 'c') {
      io.to(targetRoom).emit('terminal:data', `\x1b[90m⚙️ Compiling with gcc...\x1b[0m\r\n`);
      const srcPath = path.join(tempDir, 'main.c');
      const exePath = path.join(tempDir, 'main.exe');
      fs.writeFileSync(srcPath, code);

      const compileResult = await runCommandInSandbox('gcc', ['-O2', srcPath, '-o', exePath], { cwd: tempDir });
      if (compileResult.code !== 0) {
        io.to(targetRoom).emit('terminal:data', `\r\n\x1b[31m${cleanOutput(compileResult.stderr || compileResult.stdout, tempDir)}\x1b[0m\r\n`);
        io.to(targetRoom).emit('terminal:exit', { code: compileResult.code });
        io.to(targetRoom).emit('terminal:status', { running: false });
        return;
      }
      io.to(targetRoom).emit('terminal:data', `\x1b[32m✔ Build successful!\x1b[0m\r\n\r\n`);
      cmd = exePath;
      args = [];
    } else {
      io.to(targetRoom).emit('terminal:data', `\r\n\x1b[33mInteractive terminal supports Python, Node.js, C, and C++ locally on your server.\x1b[0m\r\n`);
      io.to(targetRoom).emit('terminal:status', { running: false });
      return;
    }

    try {
      const child = spawn(cmd, args, {
        cwd: tempDir,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          FORCE_COLOR: '1'
        }
      });

      roomProcesses.set(targetRoom, { child, tempDir });

      child.stdout.on('data', (chunk) => {
        io.to(targetRoom).emit('terminal:data', cleanOutput(chunk.toString(), tempDir));
      });

      child.stderr.on('data', (chunk) => {
        io.to(targetRoom).emit('terminal:data', cleanOutput(chunk.toString(), tempDir));
      });

      child.on('close', (code) => {
        io.to(targetRoom).emit('terminal:data', `\r\n\x1b[90m[Process finished with exit code ${code === null ? 0 : code}]\x1b[0m\r\n`);
        io.to(targetRoom).emit('terminal:exit', { code: code === null ? 0 : code });
        io.to(targetRoom).emit('terminal:status', { running: false });
        roomProcesses.delete(targetRoom);
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {}
      });

      child.on('error', (err) => {
        io.to(targetRoom).emit('terminal:data', `\r\n\x1b[31m[Execution error: ${err.message}]\x1b[0m\r\n`);
        io.to(targetRoom).emit('terminal:exit', { code: 1 });
        io.to(targetRoom).emit('terminal:status', { running: false });
        roomProcesses.delete(targetRoom);
      });
    } catch (err) {
      io.to(targetRoom).emit('terminal:data', `\r\n\x1b[31mFailed to start process: ${err.message}\x1b[0m\r\n`);
      io.to(targetRoom).emit('terminal:status', { running: false });
    }
  });

  socket.on('terminal:shell', ({ roomId, shellType }) => {
    const targetRoom = roomId || currentRoomId;
    if (!targetRoom) return;
    killRoomProcess(targetRoom);

    let cmd = '';
    let args = [];
    let modeLabel = '';

    if (shellType === 'python') {
      cmd = 'python';
      args = ['-i', '-u'];
      modeLabel = 'Python REPL';
    } else if (shellType === 'node') {
      cmd = process.execPath;
      args = ['-i'];
      modeLabel = 'Node.js REPL';
    } else {
      cmd = process.platform === 'win32' ? 'powershell.exe' : 'bash';
      args = process.platform === 'win32' ? ['-NoLogo'] : [];
      modeLabel = 'PowerShell';
    }

    io.to(targetRoom).emit('terminal:status', { running: true, mode: modeLabel });
    io.to(targetRoom).emit('terminal:data', `\r\n\x1b[35m💻 Started ${modeLabel} session...\x1b[0m\r\n`);

    try {
      const child = spawn(cmd, args, {
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          FORCE_COLOR: '1'
        }
      });

      roomProcesses.set(targetRoom, { child, tempDir: null });

      child.stdout.on('data', (chunk) => {
        io.to(targetRoom).emit('terminal:data', chunk.toString());
      });

      child.stderr.on('data', (chunk) => {
        io.to(targetRoom).emit('terminal:data', chunk.toString());
      });

      child.on('close', (code) => {
        io.to(targetRoom).emit('terminal:data', `\r\n\x1b[90m[${modeLabel} closed with code ${code === null ? 0 : code}]\x1b[0m\r\n`);
        io.to(targetRoom).emit('terminal:exit', { code: code === null ? 0 : code });
        io.to(targetRoom).emit('terminal:status', { running: false });
        roomProcesses.delete(targetRoom);
      });

      child.on('error', (err) => {
        io.to(targetRoom).emit('terminal:data', `\r\n\x1b[31m[Shell error: ${err.message}]\x1b[0m\r\n`);
        io.to(targetRoom).emit('terminal:exit', { code: 1 });
        io.to(targetRoom).emit('terminal:status', { running: false });
        roomProcesses.delete(targetRoom);
      });
    } catch (err) {
      io.to(targetRoom).emit('terminal:data', `\r\n\x1b[31mFailed to start shell: ${err.message}\x1b[0m\r\n`);
      io.to(targetRoom).emit('terminal:status', { running: false });
    }
  });

  socket.on('terminal:input', ({ roomId, data }) => {
    const targetRoom = roomId || currentRoomId;
    if (!targetRoom) return;
    const procInfo = roomProcesses.get(targetRoom);
    if (procInfo && procInfo.child && procInfo.child.stdin && procInfo.child.stdin.writable) {
      try {
        procInfo.child.stdin.write(data);
      } catch (e) {
        console.warn('Failed to write to stdin:', e);
      }
    }
  });

  socket.on('terminal:kill', ({ roomId }) => {
    const targetRoom = roomId || currentRoomId;
    if (!targetRoom) return;
    killRoomProcess(targetRoom);
    io.to(targetRoom).emit('terminal:data', `\r\n\x1b[33m^C [Process terminated by user]\x1b[0m\r\n`);
    io.to(targetRoom).emit('terminal:status', { running: false });
  });
});

// Native Execution Sandbox Helper
function runCommandInSandbox(cmd, args, options = {}, stdin = '') {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn(cmd, args, {
      ...options,
      windowsHide: true
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {}
      resolve({
        stdout,
        stderr: stderr + '\nExecution timed out (exceeded 8 seconds limit).',
        code: 124
      });
    }, 8000);

    if (stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch (e) {}
    } else {
      try {
        child.stdin.end();
      } catch (e) {}
    }

    child.stdout.on('data', (data) => {
      if (stdout.length < 65536) {
        stdout += data.toString();
      }
    });

    child.stderr.on('data', (data) => {
      if (stderr.length < 65536) {
        stderr += data.toString();
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        stdout,
        stderr: stderr + `\nProcess error: ${err.message}`,
        code: 1
      });
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (!timedOut) {
        resolve({
          stdout,
          stderr,
          code: code === null ? 0 : code
        });
      }
    });
  });
}

// Remote Wandbox fallback
async function executeViaWandbox(compiler, code, stdin = '') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler,
        code,
        stdin
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await res.json();
    return {
      run: {
        stdout: data.program_output || data.compiler_output || '',
        stderr: data.program_error || data.compiler_error || '',
        code: data.status !== undefined ? Number(data.status) : 0
      }
    };
  } catch (err) {
    clearTimeout(timeout);
    return {
      run: {
        stdout: '',
        stderr: 'Remote compilation error: ' + err.message,
        code: 1
      }
    };
  }
}

function cleanOutput(str, tempDir) {
  if (!str) return '';
  const normalized = tempDir.replace(/\\/g, '/');
  return str
    .split(`file:///${normalized}/`).join('')
    .split(`file://${normalized}/`).join('')
    .split(`${normalized}/`).join('')
    .split(`${tempDir}\\`).join('')
    .split(`${tempDir}/`).join('');
}

// API: Run code
app.post('/api/execute', async (req, res) => {
  const { language, code, stdin = '' } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'Code cannot be empty.' });
  }

  const tempDir = path.join(os.tmpdir(), `lcs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  try {
    fs.mkdirSync(tempDir, { recursive: true });
  } catch (e) {}

  try {
    // 1. Python execution (Local Python 3.12)
    if (language === 'python') {
      const scriptPath = path.join(tempDir, 'main.py');
      fs.writeFileSync(scriptPath, code);
      const result = await runCommandInSandbox('python', [scriptPath], { cwd: tempDir }, stdin);
      result.stdout = cleanOutput(result.stdout, tempDir);
      result.stderr = cleanOutput(result.stderr, tempDir);
      return res.json({ run: result });
    }

    // 2. JavaScript / TypeScript execution (Local Node.js)
    if (language === 'javascript' || language === 'typescript') {
      const scriptPath = path.join(tempDir, 'main.mjs');
      fs.writeFileSync(scriptPath, code);
      const result = await runCommandInSandbox(process.execPath, [scriptPath], { cwd: tempDir }, stdin);
      result.stdout = cleanOutput(result.stdout, tempDir);
      result.stderr = cleanOutput(result.stderr, tempDir);
      return res.json({ run: result });
    }

    // 3. C++ execution (Local g++)
    if (language === 'cpp') {
      const srcPath = path.join(tempDir, 'main.cpp');
      const exePath = path.join(tempDir, 'main.exe');
      fs.writeFileSync(srcPath, code);

      const compileResult = await runCommandInSandbox('g++', ['-O2', srcPath, '-o', exePath], { cwd: tempDir });
      if (compileResult.code !== 0) {
        return res.json({
          run: {
            stdout: '',
            stderr: cleanOutput(compileResult.stderr || compileResult.stdout || 'Compilation failed.', tempDir),
            code: compileResult.code
          }
        });
      }

      const runResult = await runCommandInSandbox(exePath, [], { cwd: tempDir }, stdin);
      runResult.stdout = cleanOutput(runResult.stdout, tempDir);
      runResult.stderr = cleanOutput(runResult.stderr, tempDir);
      return res.json({ run: runResult });
    }

    // 4. C execution (Local gcc)
    if (language === 'c') {
      const srcPath = path.join(tempDir, 'main.c');
      const exePath = path.join(tempDir, 'main.exe');
      fs.writeFileSync(srcPath, code);

      const compileResult = await runCommandInSandbox('gcc', ['-O2', srcPath, '-o', exePath], { cwd: tempDir });
      if (compileResult.code !== 0) {
        return res.json({
          run: {
            stdout: '',
            stderr: cleanOutput(compileResult.stderr || compileResult.stdout || 'Compilation failed.', tempDir),
            code: compileResult.code
          }
        });
      }

      const runResult = await runCommandInSandbox(exePath, [], { cwd: tempDir }, stdin);
      runResult.stdout = cleanOutput(runResult.stdout, tempDir);
      runResult.stderr = cleanOutput(runResult.stderr, tempDir);
      return res.json({ run: runResult });
    }

    // 5. Rust / Go / Java / PHP fallback to Wandbox
    const wandboxMap = {
      rust: 'rust-head',
      go: 'go-head',
      java: 'openjdk-head',
      php: 'php-head'
    };

    if (wandboxMap[language]) {
      const result = await executeViaWandbox(wandboxMap[language], code, stdin);
      return res.json(result);
    }

    return res.status(400).json({ error: `Language "${language}" execution is not configured.` });
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
});

// API: Cloudflare Tunnel Status & Start
app.get('/api/tunnel/status', (req, res) => {
  res.json({
    active: !!activeTunnelUrl,
    url: activeTunnelUrl,
    isStarting: isTunnelStarting
  });
});

app.post('/api/tunnel/start', async (req, res) => {
  const port = process.env.PORT || 3000;
  const url = await startCloudflareTunnel(port);
  res.json({
    active: !!url,
    url
  });
});

// API: Network information for sharing with devices on local Wi-Fi & worldwide
app.get('/api/network-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          ip: iface.address
        });
      }
    }
  }

  // Prioritize Wi-Fi and Ethernet
  addresses.sort((a, b) => {
    const isWifiA = /wi-?fi|wlan|ethernet|local area/i.test(a.interface);
    const isWifiB = /wi-?fi|wlan|ethernet|local area/i.test(b.interface);
    if (isWifiA && !isWifiB) return -1;
    if (!isWifiA && isWifiB) return 1;
    return 0;
  });

  const port = process.env.PORT || 3000;
  const preferredIp = addresses.length > 0 ? addresses[0].ip : 'localhost';

  res.json({
    port,
    addresses,
    preferredUrl: `http://${preferredIp}:${port}`,
    tunnelUrl: activeTunnelUrl,
    isTunnelStarting
  });
});

// Serve frontend in production
const clientDistPath = path.join(__dirname, 'client', 'dist');
const assetsPath = path.join(clientDistPath, 'assets');

app.use(express.static(clientDistPath));
app.use('/assets', express.static(assetsPath));
app.use('/room/assets', express.static(assetsPath));

app.get('*', (req, res) => {
  // Never send index.html for missing asset/file requests
  if (req.path.match(/\.(js|css|map|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/i)) {
    return res.status(404).send('Asset not found');
  }

  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('LiveCodeShare client build not found. Please run: npm run build');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 LiveCodeShare Server running on port ${PORT}!`);
  console.log(`📡 Local URL:   http://localhost:${PORT}`);

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`📱 Wi-Fi URL (${name}): http://${iface.address}:${PORT}`);
      }
    }
  }
  console.log(`======================================================\n`);

  // Automatically start the 24/7 Cloudflare public tunnel in background
  startCloudflareTunnel(PORT).catch(() => {});
});
