import React, { useState, useEffect, useRef, useCallback } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { Socket } from 'socket.io-client';
import {
  Play,
  Share2,
  Copy,
  Check,
  Download,
  Trash2,
  MessageSquare,
  Globe,
  Terminal as TerminalIcon,
  Users,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

import { SUPPORTED_LANGUAGES, type LanguageDef } from '../utils/languages';
import { THEME_OPTIONS, type ThemeOption } from '../utils/themes';
import { ConsoleOutput } from '../components/ConsoleOutput';
import { WebPreview } from '../components/WebPreview';
import { ChatDrawer, type ChatMessage } from '../components/ChatDrawer';
import { ShareModal } from '../components/ShareModal';
import { MobileQuickKeys } from '../components/MobileQuickKeys';
import { getApiUrl } from '../utils/api';
import { copyTextToClipboard } from '../utils/clipboard';

interface RoomUser {
  id: string;
  username: string;
  color: string;
  cursor?: { line: number; ch: number } | null;
}

interface RoomPageProps {
  roomId: string;
  username: string;
  socket: Socket | null;
  onGoHome: () => void;
  onOpenHelp: () => void;
}

export const RoomPage: React.FC<RoomPageProps> = ({
  roomId,
  username,
  socket,
  onGoHome,
  onOpenHelp
}) => {
  // State
  const [code, setCode] = useState<string>('');
  const [languageId, setLanguageId] = useState<string>('javascript');
  const [themeId, setThemeId] = useState<string>('vscodeDark');
  const [fontSize, setFontSize] = useState<number>(14);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Modals & Panels
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'console' | 'preview'>('console');
  const [mobileTab, setMobileTab] = useState<'editor' | 'output'>('editor');

  // Execution
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [consoleStderr, setConsoleStderr] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [stdin, setStdin] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Refs
  const isRemoteUpdate = useRef<boolean>(false);
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const currentLanguage: LanguageDef = SUPPORTED_LANGUAGES[languageId] || SUPPORTED_LANGUAGES.javascript;
  const currentTheme: ThemeOption = THEME_OPTIONS[themeId] || THEME_OPTIONS.vscodeDark;

  // Socket setup
  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', { roomId, username });

    socket.on('init-room', (data) => {
      isRemoteUpdate.current = true;
      setCode(data.code || '');
      setLanguageId(data.language || 'javascript');
      setUsers(data.users || []);
      setMessages(data.messages || []);
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 50);
    });

    socket.on('code-update', ({ code: newCode }) => {
      isRemoteUpdate.current = true;
      setCode(newCode);
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 50);
    });

    socket.on('language-update', ({ language, code: newCode }) => {
      setLanguageId(language);
      if (newCode !== undefined) {
        isRemoteUpdate.current = true;
        setCode(newCode);
        setTimeout(() => {
          isRemoteUpdate.current = false;
        }, 50);
      }
    });

    socket.on('user-joined', ({ users: updatedUsers }) => {
      setUsers(updatedUsers);
    });

    socket.on('user-left', ({ users: updatedUsers }) => {
      setUsers(updatedUsers);
    });

    socket.on('chat-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (!isChatOpen && !msg.isSystem) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.off('init-room');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('chat-message');
    };
  }, [socket, roomId, username, isChatOpen]);

  // Code change handler
  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      if (!isRemoteUpdate.current && socket) {
        socket.emit('code-change', { code: value });
      }
    },
    [socket]
  );

  // Language switch handler
  const handleLanguageChange = (newLangId: string) => {
    setLanguageId(newLangId);
    if (socket) {
      socket.emit('language-change', { language: newLangId });
    }
    // Switch to web preview automatically if HTML selected
    if (SUPPORTED_LANGUAGES[newLangId]?.canWebPreview) {
      setActiveSidePanel('preview');
    }
  };

  // Run code handler
  const handleRunCode = async () => {
    if (!currentLanguage.isRunnable) return;

    setIsRunning(true);
    setConsoleOutput('');
    setConsoleStderr('');
    setExitCode(null);
    setExecutionTime(null);
    setMobileTab('output');
    setActiveSidePanel('console');

    const startTime = performance.now();

    try {
      const response = await fetch(getApiUrl('/api/execute'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: languageId,
          code,
          stdin
        })
      });

      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);

      const data = await response.json();

      if (!response.ok) {
        setConsoleStderr(data.error || 'Execution failed');
        setExitCode(1);
      } else if (data.run) {
        setConsoleOutput(data.run.stdout || '');
        setConsoleStderr(data.run.stderr || '');
        setExitCode(data.run.code !== undefined ? data.run.code : 0);
      } else {
        setConsoleOutput(JSON.stringify(data, null, 2));
        setExitCode(0);
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);
      setConsoleStderr(`Error connecting to execution server: ${err.message}`);
      setExitCode(1);
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, languageId, stdin]);

  // Copy code
  const handleCopyCode = async () => {
    await copyTextToClipboard(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download code
  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livecodeshare-${roomId}.${currentLanguage.fileExt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear code
  const handleClearCode = () => {
    if (window.confirm('Clear all code in this room for everyone?')) {
      handleCodeChange('');
    }
  };

  // Send Chat
  const handleSendChat = (text: string) => {
    if (socket) {
      socket.emit('send-chat', { text });
    }
  };

  // Insert key from mobile toolbar
  const handleInsertMobileKey = (symbol: string) => {
    setCode((prev) => prev + symbol);
    if (socket) {
      socket.emit('code-change', { code: code + symbol });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a192f] text-slate-100 overflow-hidden select-none">
      {/* Top Workspace Toolbar */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs shrink-0 gap-2">
        {/* Left: Brand & Room Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 font-bold text-white hover:text-cyan-400 transition"
            title="Return to Home"
          >
            <span className="p-1 rounded bg-cyan-500 text-slate-950 font-mono text-[10px]">&lt;/&gt;</span>
            <span className="hidden sm:inline">LiveCodeShare</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Room Pill */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition"
            title="Click to share room link / QR Code"
          >
            <span className="text-slate-400">Room:</span>
            <span className="font-mono font-semibold text-cyan-300">{roomId}</span>
            <Share2 className="w-3 h-3 text-cyan-400 ml-1" />
          </button>

          {/* Active Collaborators count & avatars */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:border-slate-700 transition"
            title="View Collaborators"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">{users.length}</span>
            <div className="flex -space-x-1.5 overflow-hidden ml-1">
              {users.slice(0, 3).map((u) => (
                <div
                  key={u.id}
                  className="inline-block w-4 h-4 rounded-full ring-2 ring-slate-900 text-[9px] font-bold text-slate-950 flex items-center justify-center uppercase"
                  style={{ backgroundColor: u.color }}
                  title={u.username}
                >
                  {u.username.charAt(0)}
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* Center: Language & Theme selectors */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={languageId}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 text-cyan-300 font-medium px-3 py-1.5 pr-7 rounded-lg text-xs cursor-pointer hover:border-slate-700 focus:outline-none focus:border-cyan-500"
            >
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                  {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Theme Selector */}
          <div className="relative hidden md:block">
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 font-medium px-2.5 py-1.5 pr-7 rounded-lg text-xs cursor-pointer hover:border-slate-700 focus:outline-none"
            >
              {Object.values(THEME_OPTIONS).map((thm) => (
                <option key={thm.id} value={thm.id} className="bg-slate-900 text-white">
                  {thm.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Font Size */}
          <div className="relative hidden lg:block">
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="appearance-none bg-slate-900 border border-slate-800 text-slate-400 font-medium px-2 py-1.5 pr-6 rounded-lg text-xs cursor-pointer focus:outline-none"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Run Code Button */}
          {currentLanguage.isRunnable && (
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md shadow-emerald-600/20 transition"
              title="Run Code (Ctrl + Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline">{isRunning ? 'Running...' : 'Run'}</span>
            </button>
          )}

          {/* Live Web Preview toggle for HTML */}
          {currentLanguage.canWebPreview && (
            <button
              onClick={() => {
                setActiveSidePanel('preview');
                setMobileTab('output');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition ${
                activeSidePanel === 'preview'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
            title="Copy Code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download Code */}
          <button
            onClick={handleDownloadCode}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition hidden sm:block"
            title="Download Code"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear */}
          <button
            onClick={handleClearCode}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition hidden sm:block"
            title="Clear Code"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Room Chat Toggle */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              setUnreadCount(0);
            }}
            className={`relative p-1.5 rounded-lg transition ${
              isChatOpen ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
            title="Room Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Share Modal Trigger */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 font-medium rounded-lg transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Invite</span>
          </button>

          {/* Help Tutorial */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
            title="How to Use"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher (Visible on mobile/tablet screens) */}
      <div className="flex md:hidden items-center justify-around bg-slate-950 border-b border-slate-800 text-xs shrink-0">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 font-semibold transition border-b-2 ${
            mobileTab === 'editor'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Editor ({currentLanguage.name})
        </button>
        <button
          onClick={() => setMobileTab('output')}
          className={`flex-1 py-2 font-semibold transition border-b-2 flex items-center justify-center gap-1.5 ${
            mobileTab === 'output'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {currentLanguage.canWebPreview ? (
            <>
              <Globe className="w-3.5 h-3.5" /> Web Preview
            </>
          ) : (
            <>
              <TerminalIcon className="w-3.5 h-3.5" /> Output Console
            </>
          )}
          {exitCode !== null && (
            <span
              className={`w-2 h-2 rounded-full ${
                exitCode === 0 ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
          )}
        </button>
      </div>

      {/* Main Workspace Split Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Editor Pane */}
        <div
          className={`flex-1 flex flex-col h-full overflow-hidden ${
            mobileTab === 'editor' ? 'flex' : 'hidden md:flex'
          }`}
          style={{ ['--cm-font-size' as any]: `${fontSize}px` }}
        >
          <div className="flex-1 overflow-auto bg-[#0a192f]">
            <CodeMirror
              ref={editorRef}
              value={code}
              height="100%"
              theme={currentTheme.extension}
              extensions={[currentLanguage.extension()]}
              onChange={handleCodeChange}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                history: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true
              }}
            />
          </div>

          {/* Mobile Quick Keys Bar */}
          <MobileQuickKeys onInsertKey={handleInsertMobileKey} />
        </div>

        {/* Output / Preview Pane */}
        <div
          className={`w-full md:w-[42%] lg:w-[38%] h-full flex flex-col overflow-hidden ${
            mobileTab === 'output' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {currentLanguage.canWebPreview && activeSidePanel === 'preview' ? (
            <WebPreview code={code} />
          ) : (
            <ConsoleOutput
              output={consoleOutput}
              stderr={consoleStderr}
              isLoading={isRunning}
              executionTime={executionTime}
              exitCode={exitCode}
              onClear={() => {
                setConsoleOutput('');
                setConsoleStderr('');
                setExitCode(null);
                setExecutionTime(null);
              }}
              stdin={stdin}
              setStdin={setStdin}
              onRun={handleRunCode}
              isRunnable={currentLanguage.isRunnable}
            />
          )}
        </div>
      </main>

      {/* Share / QR Modal */}
      <ShareModal
        roomId={roomId}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Chat & Collaborators Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendChat}
        users={users}
        currentUserId={socket?.id || ''}
      />
    </div>
  );
};
