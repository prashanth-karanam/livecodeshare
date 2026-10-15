import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Users } from 'lucide-react';

export interface ChatMessage {
  id: string;
  user: {
    username: string;
    color: string;
  };
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  users: { id: string; username: string; color: string }[];
  currentUserId: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  users,
  currentUserId
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 md:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-200 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
              activeTab === 'chat' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat ({messages.filter(m => !m.isSystem).length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
              activeTab === 'users' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Friends ({users.length})
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab 1: Chat Messages */}
      {activeTab === 'chat' ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.length === 0 && (
              <div className="text-center py-8 text-slate-500 italic">
                No messages yet. Say hello to your collaborators! 👋
              </div>
            )}

            {messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="text-center py-1 text-[11px] text-slate-500 italic">
                    {msg.text}
                  </div>
                );
              }

              const isMe = msg.user.username.startsWith(currentUserId) || msg.user.color === '#06b6d4';

              return (
                <div key={msg.id} className={`flex flex-col space-y-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold text-[11px]"
                      style={{ color: msg.user.color || '#38bdf8' }}
                    >
                      {msg.user.username} {isMe && '(You)'}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  <div className={`border rounded-xl px-3 py-2 text-slate-200 leading-relaxed break-words max-w-[95%] ${isMe ? 'bg-cyan-950/40 border-cyan-800/40' : 'bg-slate-950/80 border-slate-800/80'}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message to room..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl transition shadow-lg shadow-cyan-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      ) : (
        /* Tab 2: Connected Friends / Collaborators */
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Connected Devices ({users.length})
          </div>
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-2.5 bg-slate-950/50 border border-slate-800/80 rounded-xl text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-800"
                  style={{ backgroundColor: u.color }}
                />
                <div>
                  <div className="font-medium text-white">{u.username}</div>
                  <div className="text-[10px] text-slate-500">Live collaborator</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
