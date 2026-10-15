import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Code2,
  Zap,
  Globe,
  UsersRound,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Terminal,
  Sparkles,
  BookOpen,
  Calendar,
  Clock
} from 'lucide-react';

interface LandingPageProps {
  onCreateRoom: (customName: string) => void;
  onJoinRoom: (roomId: string, customName: string) => void;
  onOpenHelp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateRoom,
  onJoinRoom,
  onOpenHelp
}) => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');

  const handleCreate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onCreateRoom(usernameInput.trim());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdInput.trim()) return;
    onJoinRoom(roomIdInput.trim(), usernameInput.trim());
  };

  const FEATURES = [
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: 'Instant Real-time Sync',
      desc: 'Zero-latency collaboration. Every keystroke is synced instantly across connected devices using advanced WebSocket technology.'
    },
    {
      icon: <Terminal className="w-6 h-6 text-cyan-400" />,
      title: 'Online Compiler for 50+ Languages',
      desc: 'Execute Python, JavaScript, C++, C, Java, Rust, Go, and SQL instantly with full standard input and execution telemetry.'
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-400" />,
      title: 'Phone & Tablet Optimized',
      desc: 'Mobile-first editor experience with touch-optimized controls, mobile quick programming keys, and scannable QR codes.'
    },
    {
      icon: <UsersRound className="w-6 h-6 text-purple-400" />,
      title: 'Unlimited Collaborators',
      desc: 'Whether pair programming or a classroom workshop, invite your friends with a single click or camera scan.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-400" />,
      title: 'Secure & Private Rooms',
      desc: 'Private rooms by default. Only users with the unique room ID can join and participate in the live session.'
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      title: 'Live Web Preview',
      desc: 'Edit HTML, CSS, and JavaScript with instant live preview in an isolated sandbox, with desktop and mobile viewport toggles.'
    }
  ];

  const BLOG_ITEMS = [
    {
      tag: 'JavaScript',
      color: 'from-amber-500 to-yellow-600',
      date: 'Oct 2026',
      readTime: '15 min read',
      title: 'Advanced JavaScript Concurrency & Event Loop Internals',
      desc: 'Deep dive into Microtasks, Macrotasks, Call Stack limits, and asynchronous patterns in modern JS.'
    },
    {
      tag: 'Python',
      color: 'from-blue-600 to-cyan-600',
      date: 'Oct 2026',
      readTime: '12 min read',
      title: 'Python OOP: Metaclasses, Dunder Methods & Memory',
      desc: 'Mastering slots, object references, and pythonic architectural patterns for high performance.'
    },
    {
      tag: 'C++',
      color: 'from-indigo-600 to-purple-600',
      date: 'Oct 2026',
      readTime: '18 min read',
      title: 'Modern C++ Memory Management: RAII & Smart Pointers',
      desc: 'Eliminating memory leaks and segmentation faults using unique_ptr, shared_ptr, and move semantics.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 px-4 sm:px-6">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-Time Collaborative Coding Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Live<span className="text-cyan-400">Code</span>Share
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            The ultimate online code share platform for <strong className="text-cyan-300">live pair programming</strong>.
            Collaborate in real time, run code, and share instantly across laptops, phones, and tablets.
          </p>

          {/* Collaborator Quick Name Input */}
          <div className="max-w-xs mx-auto">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Your nickname (e.g. Alex)"
              className="w-full text-center px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Action Card */}
          <div className="max-w-md mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
            <div className="text-left mb-5">
              <h3 className="text-base font-semibold text-white">Start Collaborating</h3>
              <p className="text-xs text-slate-400">Create a new live room or join an existing one</p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleCreate}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] text-white rounded-xl font-semibold text-sm flex items-center justify-between shadow-xl shadow-cyan-500/20 transition group"
              >
                <span className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Create a New Room
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-800" />
                <span className="px-3 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                  or
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="Enter Room ID"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
                <button
                  type="submit"
                  disabled={!roomIdInput.trim()}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl font-medium text-xs transition"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Why Choose Our Online Code Share Platform?
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Engineered for seamless multi-device collaboration, low latency, and zero setup friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/70 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    {feat.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Resource Articles */}
      <section className="py-16 px-4 sm:px-6 bg-[#070d18]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" /> Developer Resources
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Learn, Code, <span className="text-cyan-400">Evolve</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Pair program interview problems, debug architectures, and build faster together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/40 border border-slate-800/80 overflow-hidden flex flex-col hover:border-cyan-500/40 transition group"
              >
                <div className={`h-36 bg-gradient-to-br ${item.color} p-5 flex flex-col justify-between`}>
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-black/30 backdrop-blur-md text-white rounded-md w-fit">
                    {item.tag}
                  </span>
                  <div className="text-[11px] text-white/90 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> {item.date}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.readTime}
                    </span>
                    <button
                      onClick={handleCreate}
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                    >
                      Practice in Room →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-900 text-center text-xs text-slate-500 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">LiveCodeShare</span>
            <span>—</span>
            <span>Self-Hosted Real-Time Collaborative Coding</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={onOpenHelp} className="hover:text-white transition">
              Guide
            </button>
            <span>•</span>
            <span>Phone • Tablet • Laptop Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
