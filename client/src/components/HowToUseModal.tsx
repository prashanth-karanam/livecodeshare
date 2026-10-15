import React from 'react';
import { X, Smartphone, Globe, Code2, Play, Users, MessageSquare } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">How to Use LiveCodeShare</h3>
              <p className="text-xs text-slate-400">Everything you need to know about collaborating live</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="py-5 space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3.5">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 h-fit shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">1. Create or Join a Room</h4>
              <p className="text-slate-400 leading-relaxed">
                Click <strong>"Create a New Room"</strong> to generate a private session, or enter an existing Room ID. Choose your developer display name anytime.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3.5">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 h-fit shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">2. Open on Phone, Tablet & Laptop</h4>
              <p className="text-slate-400 leading-relaxed">
                Click <strong>"Share"</strong> in the top bar to show the instant <strong>QR Code</strong>. Anyone can point their phone camera at the screen to immediately jump into your room! On the same Wi-Fi network, your local IP link connects all devices seamlessly.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3.5">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 h-fit shrink-0">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">3. Run Code & Web Preview</h4>
              <p className="text-slate-400 leading-relaxed">
                Write code in <strong>Python, JavaScript, C++, C, Java, Rust, Go, SQL</strong> and press <strong>Run</strong> (or <kbd className="px-1 py-0.5 bg-slate-800 rounded text-cyan-300">Ctrl+Enter</kbd>) to view output with standard input support. For HTML/CSS/JS, switch to the <strong>Live Web Preview</strong> tab to see rendered websites in real time!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3.5">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 h-fit shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">4. Live Chat & Presence</h4>
              <p className="text-slate-400 leading-relaxed">
                Each collaborator gets a unique glowing color tag and cursor marker. Open the side <strong>Chat</strong> to discuss ideas, share snippets, or keep notes during pair programming sessions.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 h-fit shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">5. Worldwide Access</h4>
              <p className="text-slate-400 leading-relaxed">
                Want friends who are outside your home Wi-Fi to join? Run <code className="px-1.5 py-0.5 bg-slate-900 text-cyan-400 rounded">npx untun tunnel 3000</code> in your terminal to get a free public HTTPS link!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-cyan-600/20"
          >
            Got It, Let's Code!
          </button>
        </div>
      </div>
    </div>
  );
};
