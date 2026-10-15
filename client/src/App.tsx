import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { RoomPage } from './pages/RoomPage';
import { HowToUseModal } from './components/HowToUseModal';
import { getBackendUrl } from './utils/api';

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Initialize socket connection once
  useEffect(() => {
    const backendUrl = getBackendUrl();
    const s = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Parse room ID from current URL
  const parseRoomFromUrl = (): string | null => {
    // Check pathname /room/xyz
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === 'room') {
      return pathParts[1];
    }
    // Check search params ?room=xyz
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) return roomParam;

    // Check hash #/room/xyz
    const hash = window.location.hash;
    if (hash.startsWith('#/room/')) {
      return hash.replace('#/room/', '');
    }

    return null;
  };

  useEffect(() => {
    const initialRoom = parseRoomFromUrl();
    if (initialRoom) {
      setCurrentRoomId(initialRoom);
    }

    const handlePopState = () => {
      const room = parseRoomFromUrl();
      setCurrentRoomId(room);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Create room handler
  const handleCreateRoom = (customName: string) => {
    const randomSlug = `collab-${Math.random().toString(36).substring(2, 8)}`;
    const finalUser = customName || `Dev-${Math.floor(100 + Math.random() * 900)}`;
    setUsername(finalUser);
    setCurrentRoomId(randomSlug);
    window.history.pushState({}, '', `/room/${randomSlug}`);
  };

  // Join room handler
  const handleJoinRoom = (roomId: string, customName: string) => {
    const cleanId = roomId.trim().toLowerCase();
    const finalUser = customName || `Dev-${Math.floor(100 + Math.random() * 900)}`;
    setUsername(finalUser);
    setCurrentRoomId(cleanId);
    window.history.pushState({}, '', `/room/${cleanId}`);
  };

  // Go Home handler
  const handleGoHome = () => {
    setCurrentRoomId(null);
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans">
      {typeof window !== 'undefined' && window.location.hostname.includes('github.io') && !isConnected && (
        <div className="bg-amber-950/80 border-b border-amber-800/60 text-amber-200 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400 font-bold">Laptop Server Notice:</span>
            <span>
              GitHub Pages is a static file host. Your laptop server is running at <strong className="text-white">http://localhost:3000</strong> (on this laptop) or <strong className="text-white">http://10.3.103.31:3000</strong> (for phones/tablets on Wi-Fi).
            </span>
          </div>
        </div>
      )}

      {!currentRoomId && (
        <Navbar
          onGoHome={handleGoHome}
          onOpenHelp={() => setIsHelpOpen(true)}
          isConnected={isConnected}
          isInRoom={false}
        />
      )}

      {currentRoomId ? (
        <RoomPage
          roomId={currentRoomId}
          username={username}
          socket={socket}
          onGoHome={handleGoHome}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      ) : (
        <LandingPage
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* How to use tutorial modal */}
      <HowToUseModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
