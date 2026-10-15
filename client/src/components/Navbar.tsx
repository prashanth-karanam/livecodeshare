import React from 'react';
import { Code2, HelpCircle, Share2, Wifi } from 'lucide-react';

interface NavbarProps {
  onGoHome: () => void;
  onOpenHelp: () => void;
  onOpenShare?: () => void;
  isConnected: boolean;
  isInRoom?: boolean;
  roomId?: string;
  userCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
  onOpenHelp,
  onOpenShare,
  isConnected,
  isInRoom = false,
  roomId = '',
  userCount = 1
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 py-2.5 transition">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 group-hover:bg-cyan-400 transition">
              <Code2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-cyan-300 transition">
                Live<span className="text-cyan-400">Code</span>Share
              </span>
            </div>
          </button>

          {/* Room Pill if in room */}
          {isInRoom && roomId && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs">
              <span className="text-slate-400">Room:</span>
              <span className="font-mono font-semibold text-cyan-300">{roomId}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 text-[11px] font-medium">({userCount} online)</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection status pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isConnected
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/40 animate-pulse'
            }`}
          >
            <Wifi className="w-3 h-3" />
            <span className="hidden xs:inline">{isConnected ? 'Live Connected' : 'Connecting...'}</span>
          </div>

          {/* Share button in room */}
          {isInRoom && onOpenShare && (
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invite / QR Code</span>
              <span className="sm:hidden">Share</span>
            </button>
          )}

          {/* How to use */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl text-xs font-medium transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">How to use?</span>
          </button>
        </div>
      </div>
    </header>
  );
};
