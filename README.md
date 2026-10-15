# 🚀 LiveCodeShare — Self-Hosted Real-Time Collaborative Code Editor

A full-stack, real-time live code sharing platform built with **React 19**, **Vite**, **Tailwind CSS v4**, **CodeMirror 6**, **Node.js Express**, and **Socket.IO**. Designed for pair programming, interviews, teaching, and live coding sessions across **laptops, tablets, and phones**.

Inspired by [livecodeshare.vercel.app](https://livecodeshare.vercel.app).

---

## 🌟 Features

- **⚡ Real-Time Multi-Device Sync**: Low-latency bi-directional synchronization powered by Socket.IO. Every keystroke is mirrored across all connected participants.
- **📱 Phone & Tablet Ready**:
  - Touch-friendly layout with mobile tab switcher (Editor vs. Output).
  - **Mobile Quick Keys Bar** for typing `{}`, `()`, `[]`, `;`, `=>`, `"`, `'`, `Tab` on touchscreens without hunting through keyboard symbol menus.
  - Camera-scannable **QR Code** modal: point any phone or tablet camera to join immediately.
- **💻 Native Multi-Language Execution**:
  - **Python 3**: Native execution with standard input and execution telemetry.
  - **JavaScript / TypeScript**: Native Node.js execution.
  - **C / C++**: Native compiler (`gcc` / `g++`) with execution output.
  - **Remote Fallbacks**: Wandbox multi-compiler support for Rust, Go, Java, PHP.
- **🌐 Live HTML/CSS/JS Web Preview**:
  - Sandboxed iframe with live auto-refresh as you type.
  - Device viewport switchers: Desktop, Tablet (768px), and Mobile (375px).
- **💬 Built-in Room Chat & Presence**:
  - Real-time room chat with user color coding.
  - Active participant list and system join/leave notices.
  - Unread message counters.
- **🎨 Themes & Language Highlighting**:
  - VS Code Dark, Dracula, Monokai, GitHub Dark, GitHub Light, Tokyo Night, Sublime.
  - Configurable font sizes (12px, 14px, 16px, 18px).
- **📋 Share & Export**:
  - One-click copy room link and room code.
  - Download code as `.py`, `.js`, `.cpp`, `.html`, etc.

---

## 🚀 Quick Start

### 1. Launch Server
Double-click `start.bat` or run:
```bash
node server.js
```

### 2. Access on Devices

- **On your laptop / PC**:
  Open: [http://localhost:3000](http://localhost:3000)

- **On your phone or tablet (same Wi-Fi)**:
  Open: `http://<YOUR-WIFI-IP>:3000` (e.g. `http://10.3.103.31:3000`)
  *Or simply click "Invite / QR Code" on your laptop screen and scan the QR code with your phone camera!*

- **For friends over mobile internet / remote networks**:
  Expose port 3000 using Cloudflare Quick Tunnel or ngrok:
  ```bash
  npx untun tunnel 3000
  # or
  cloudflared tunnel --url http://localhost:3000
  ```

---

## 🛠 Project Structure

```
livecodeshare/
├── server.js               # Express & Socket.IO server + code execution sandbox
├── package.json            # Root configuration
├── start.bat               # 1-click Windows launcher
└── client/                 # React 19 + Vite + Tailwind CSS frontend
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx            # Top header bar & connection status
    │   │   ├── ConsoleOutput.tsx     # Terminal execution output & stdin
    │   │   ├── WebPreview.tsx        # Sandboxed HTML/CSS/JS live iframe
    │   │   ├── ChatDrawer.tsx        # Real-time room chat & participant list
    │   │   ├── ShareModal.tsx        # Scannable QR code & network link
    │   │   ├── HowToUseModal.tsx     # Instructions modal
    │   │   └── MobileQuickKeys.tsx   # Touchscreen programming keys
    │   ├── pages/
    │   │   ├── LandingPage.tsx       # Homepage matching LiveCodeShare
    │   │   └── RoomPage.tsx          # Real-time collaborative editor workspace
    │   ├── utils/
    │   │   ├── languages.ts          # Language extensions & boilerplates
    │   │   └── themes.ts             # CodeMirror themes
    │   ├── App.tsx                   # Routing & Socket connection manager
    │   └── index.css                 # Tailwind v4 styles & theme styling
    └── dist/                         # Production optimized bundle
```
