import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Socket } from 'socket.io-client';
import {
  Terminal as TerminalIcon,
  Play,
  Square,
  Trash2,
  Send,
  ChevronDown,
  Command
} from 'lucide-react';

interface InteractiveTerminalProps {
  roomId: string;
  socket: Socket | null;
  code: string;
  languageId: string;
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({
  roomId,
  socket,
  code,
  languageId
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const isRunningRef = useRef<boolean>(false);
  isRunningRef.current = isRunning;

  const [quickInput, setQuickInput] = useState<string>('');
  const [shellMenuOpen, setShellMenuOpen] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<string>('Program');

  const inputBufferRef = useRef<string>('');

  // Initialize xterm
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'Consolas, "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.25,
      convertEol: true,
      theme: {
        background: '#070d18',
        foreground: '#e2e8f0',
        cursor: '#22d3ee',
        cursorAccent: '#070d18',
        selectionBackground: '#0891b2',
        black: '#0f172a',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#f8fafc',
        brightBlack: '#475569',
        brightRed: '#ef4444',
        brightGreen: '#22c55e',
        brightYellow: '#eab308',
        brightBlue: '#3b82f6',
        brightMagenta: '#a855f7',
        brightCyan: '#06b6d4',
        brightWhite: '#ffffff'
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome Banner
    term.writeln('\x1b[1;36m┌──────────────────────────────────────────────────────────┐\x1b[0m');
    term.writeln('\x1b[1;36m│\x1b[0m   \x1b[1;32m⚡ LiveCodeShare Interactive Real-Time Terminal\x1b[0m        \x1b[1;36m│\x1b[0m');
    term.writeln('\x1b[1;36m│\x1b[0m   Supports live user input, Python/C++/Node & Shell REPL \x1b[1;36m│\x1b[0m');
    term.writeln('\x1b[1;36m└──────────────────────────────────────────────────────────┘\x1b[0m');
    term.writeln('\x1b[90mClick ▶ "Run Code" or start an interactive shell below.\x1b[0m\r\n');

    // Handle direct keyboard typing inside xterm
    term.onData((data) => {
      if (!isRunningRef.current) return;

      if (data === '\r') {
        // User hit Enter
        term.write('\r\n');
        if (socket) {
          socket.emit('terminal:input', {
            roomId,
            data: inputBufferRef.current + '\n'
          });
        }
        inputBufferRef.current = '';
      } else if (data === '\u007F' || data === '\b') {
        // Backspace
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data === '\u0003') {
        // Ctrl+C
        if (socket) {
          socket.emit('terminal:kill', { roomId });
        }
        inputBufferRef.current = '';
      } else {
        inputBufferRef.current += data;
        term.write(data);
      }
    });

    // Resize observer to keep xterm fitted to container
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (e) {}
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [roomId, socket]);

  // Socket event listeners for streaming terminal data
  useEffect(() => {
    if (!socket) return;

    const handleData = (chunk: string) => {
      if (xtermRef.current) {
        xtermRef.current.write(chunk);
      }
    };

    const handleStatus = ({ running, mode }: { running: boolean; mode?: string }) => {
      setIsRunning(running);
      if (mode) setActiveMode(mode);
    };

    const handleExit = () => {
      setIsRunning(false);
      inputBufferRef.current = '';
    };

    socket.on('terminal:data', handleData);
    socket.on('terminal:status', handleStatus);
    socket.on('terminal:exit', handleExit);

    return () => {
      socket.off('terminal:data', handleData);
      socket.off('terminal:status', handleStatus);
      socket.off('terminal:exit', handleExit);
    };
  }, [socket]);

  // Run the code from the editor
  const handleRunCode = useCallback(() => {
    if (!socket) return;
    if (xtermRef.current) {
      xtermRef.current.writeln(`\r\n\x1b[1;36m▶ Running ${languageId}...\x1b[0m`);
    }
    inputBufferRef.current = '';
    setActiveMode(`${languageId.toUpperCase()}`);
    socket.emit('terminal:run', {
      roomId,
      language: languageId,
      code
    });
  }, [socket, roomId, languageId, code]);

  // Stop running program (Ctrl+C)
  const handleStop = useCallback(() => {
    if (!socket) return;
    socket.emit('terminal:kill', { roomId });
    if (xtermRef.current) {
      xtermRef.current.writeln('\r\n\x1b[33m^C [Process terminated]\x1b[0m');
    }
    inputBufferRef.current = '';
    setIsRunning(false);
  }, [socket, roomId]);

  // Start Interactive Shell / REPL
  const handleStartShell = (type: 'python' | 'node' | 'powershell') => {
    setShellMenuOpen(false);
    if (!socket) return;
    if (xtermRef.current) {
      xtermRef.current.writeln(`\r\n\x1b[1;35m🚀 Launching ${type.toUpperCase()} Interactive Shell...\x1b[0m`);
    }
    inputBufferRef.current = '';
    setActiveMode(type.toUpperCase() + ' REPL');
    socket.emit('terminal:shell', {
      roomId,
      shellType: type
    });
  };

  // Clear Terminal
  const handleClear = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  }, []);

  // Send input from Quick Input Bar
  const handleSendQuickInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput) return;
    if (xtermRef.current) {
      xtermRef.current.writeln(`\x1b[32m${quickInput}\x1b[0m`);
    }
    if (socket) {
      socket.emit('terminal:input', {
        roomId,
        data: quickInput + '\n'
      });
    }
    setQuickInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 text-slate-200 overflow-hidden">
      {/* Terminal Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 shrink-0 text-xs select-none relative">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">Terminal</span>
          {isRunning ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Running ({activeMode})
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
              Ready
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Shell REPL Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShellMenuOpen(!shellMenuOpen)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
              title="Open Interactive Shell / REPL"
            >
              <Command className="w-3 h-3 text-cyan-400" />
              <span>Shell / REPL</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {shellMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50 text-xs space-y-0.5">
                <button
                  onClick={() => handleStartShell('python')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition"
                >
                  <span>🐍 Python REPL</span>
                  <span className="text-[10px] text-slate-400">python -i</span>
                </button>
                <button
                  onClick={() => handleStartShell('node')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition"
                >
                  <span>🟩 Node.js REPL</span>
                  <span className="text-[10px] text-slate-400">node -i</span>
                </button>
                <button
                  onClick={() => handleStartShell('powershell')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition"
                >
                  <span>💻 Command Shell</span>
                  <span className="text-[10px] text-slate-400">powershell</span>
                </button>
              </div>
            )}
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            title="Clear Terminal"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Run / Stop Button */}
          {isRunning ? (
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-xs shadow-md shadow-rose-600/30 transition active:scale-95"
              title="Stop running program (Ctrl+C)"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={handleRunCode}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs shadow-md shadow-emerald-600/20 transition active:scale-95"
              title="Execute code in terminal"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="flex-1 w-full h-full p-2 bg-[#070d18] overflow-hidden">
        <div ref={terminalRef} className="w-full h-full" />
      </div>

      {/* Quick Interactive Input Bar for Mobile & Desktop */}
      <form
        onSubmit={handleSendQuickInput}
        className="flex items-center gap-2 p-2 bg-slate-900 border-t border-slate-800 shrink-0"
      >
        <div className="text-cyan-400 font-mono text-xs pl-1 font-bold select-none">&gt;</div>
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder={
            isRunning
              ? 'Type input (e.g. name, number) & press Enter...'
              : 'Interactive prompt (start program or type here)...'
          }
          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
        />
        <button
          type="submit"
          disabled={!quickInput.trim()}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shrink-0"
        >
          <Send className="w-3 h-3" />
          <span>Send</span>
        </button>
        {isRunning && (
          <button
            type="button"
            onClick={handleStop}
            className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-lg text-xs font-medium transition shrink-0"
            title="Send Ctrl+C to process"
          >
            Ctrl+C
          </button>
        )}
      </form>
    </div>
  );
};
