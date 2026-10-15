import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, X, Globe, Wifi, Sparkles, Loader2, Share2 } from 'lucide-react';
import { getApiUrl } from '../utils/api';
import { copyTextToClipboard } from '../utils/clipboard';

interface ShareModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ roomId, isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);

  const [linkType, setLinkType] = useState<'public' | 'wifi'>('public');
  const [networkUrl, setNetworkUrl] = useState<string>('');
  const [tunnelUrl, setTunnelUrl] = useState<string | null>(null);
  const [isTunnelLoading, setIsTunnelLoading] = useState<boolean>(false);

  const roomPath = `/room/${roomId}`;

  const fetchNetworkInfo = () => {
    fetch(getApiUrl('/api/network-info'))
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses && data.addresses.length > 0) {
          setNetworkUrl(`http://${data.addresses[0].ip}:${data.port || 3000}${roomPath}`);
        } else {
          setNetworkUrl(`${window.location.origin}${roomPath}`);
        }
        if (data.tunnelUrl) {
          setTunnelUrl(`${data.tunnelUrl}${roomPath}`);
        }
        if (data.isTunnelStarting) {
          setIsTunnelLoading(true);
        }
      })
      .catch(() => {
        setNetworkUrl(`${window.location.origin}${roomPath}`);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchNetworkInfo();

      // Poll tunnel status if not active yet
      const interval = setInterval(() => {
        fetch(getApiUrl('/api/tunnel/status'))
          .then((r) => r.json())
          .then((d) => {
            if (d.url) {
              setTunnelUrl(`${d.url}${roomPath}`);
              setIsTunnelLoading(false);
            }
          })
          .catch(() => {});
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isOpen, roomId, roomPath]);

  if (!isOpen) return null;

  const handleStartTunnel = async () => {
    setIsTunnelLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/tunnel/start'), { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        setTunnelUrl(`${data.url}${roomPath}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTunnelLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'link' | 'id' | 'public') => {
    await copyTextToClipboard(text);
    if (type === 'public') {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    } else if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleNativeShare = async (url: string) => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `LiveCodeShare Room ${roomId}`,
          text: `Join my live collaborative coding room on LiveCodeShare:`,
          url
        });
        return;
      } catch (err) {
        // user cancelled or share failed, fallback to copy
      }
    }
    await copyToClipboard(url, linkType === 'public' ? 'public' : 'link');
  };

  const activeUrl = linkType === 'public' && tunnelUrl ? tunnelUrl : networkUrl || `${window.location.origin}${roomPath}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Share Live Room with Friends</h3>
              <p className="text-xs text-slate-400">Generate links for friends on any network or mobile data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 mt-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLinkType('public')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              linkType === 'public'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>24/7 Worldwide Link (Different Wi-Fi / Cellular)</span>
          </button>
          <button
            type="button"
            onClick={() => setLinkType('wifi')}
            className={`py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition ${
              linkType === 'wifi'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Same Wi-Fi</span>
          </button>
        </div>

        {/* Content */}
        <div className="py-4 flex flex-col items-center">
          {/* QR Code Container */}
          <div className="p-3.5 bg-white rounded-2xl shadow-inner border-4 border-cyan-500/30 flex flex-col items-center justify-center">
            <QRCodeSVG
              value={activeUrl}
              size={170}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400 text-center flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Point phone or tablet camera to open instantly
          </p>

          {/* Public 24/7 Link Section */}
          {linkType === 'public' && (
            <div className="w-full mt-4 space-y-3">
              {tunnelUrl ? (
                <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      24/7 Public Cloudflare Link:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                      ● Active (Runs while host is on)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={tunnelUrl}
                      onClick={(e) => e.currentTarget.select()}
                      onFocus={(e) => e.currentTarget.select()}
                      className="w-full px-3 py-2 bg-slate-950 border border-cyan-800/50 rounded-xl text-xs font-mono text-cyan-200 cursor-pointer select-all focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => copyToClipboard(tunnelUrl, 'public')}
                      className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-lg shadow-cyan-600/30"
                    >
                      {copiedPublic ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPublic ? 'Copied' : 'Copy'}
                    </button>
                    {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                      <button
                        onClick={() => handleNativeShare(tunnelUrl)}
                        title="Share link"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-lg shadow-emerald-600/30"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ✨ Your friends can open this on <strong>iPhone, Android, iPad, or PC anywhere in the world</strong> (no Wi-Fi match needed, works on 4G/5G). It will never disconnect as long as your laptop is running!
                  </p>
                </div>
              ) : isTunnelLoading ? (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <div className="text-xs font-semibold text-white">Generating 24/7 Worldwide Link...</div>
                  <p className="text-[11px] text-slate-400">Connecting your laptop to the Cloudflare edge network.</p>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3">
                  <p className="text-xs text-slate-300">
                    Want your friends on mobile data or at their own homes to join?
                  </p>
                  <button
                    onClick={handleStartTunnel}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate 24/7 Public Link Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Local Wi-Fi Link Section */}
          {linkType === 'wifi' && (
            <div className="w-full mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Wi-Fi Network Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={networkUrl}
                    onClick={(e) => e.currentTarget.select()}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 cursor-pointer select-all focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => copyToClipboard(networkUrl, 'link')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                  {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <button
                      onClick={() => handleNativeShare(networkUrl)}
                      title="Share link"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Works for any device connected to the same home or office Wi-Fi network.
              </p>
            </div>
          )}

          {/* Room Code Badge */}
          <div className="w-full mt-3 flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs">
            <div>
              <span className="text-slate-400">Room Code: </span>
              <span className="font-mono font-semibold text-white ml-1">{roomId}</span>
            </div>
            <button
              onClick={() => copyToClipboard(roomId, 'id')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedId ? 'Code Copied' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
