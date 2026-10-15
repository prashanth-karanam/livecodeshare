import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, X, Smartphone, Globe, Wifi } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface ShareModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ roomId, isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [networkUrl, setNetworkUrl] = useState<string>('');
  const [networkList, setNetworkList] = useState<{ interface: string; ip: string }[]>([]);

  const currentOrigin = window.location.origin;
  const roomPath = `/room/${roomId}`;
  const shareableUrl = `${currentOrigin}${roomPath}`;

  useEffect(() => {
    fetch(getApiUrl('/api/network-info'))
      .then(res => res.json())
      .then(data => {
        if (data.addresses && data.addresses.length > 0) {
          setNetworkList(data.addresses);
          setNetworkUrl(`http://${data.addresses[0].ip}:${data.port || 3000}${roomPath}`);
        }
      })
      .catch(() => {
        // Fallback to current origin
        setNetworkUrl(shareableUrl);
      });
  }, [roomId, roomPath, shareableUrl]);

  if (!isOpen) return null;

  const activeQrUrl = networkUrl || shareableUrl;

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Invite Friends to Code</h3>
              <p className="text-xs text-slate-400">Scan with phone/tablet or send room link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 flex flex-col items-center">
          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl shadow-inner border-4 border-cyan-500/30 flex flex-col items-center justify-center">
            <QRCodeSVG
              value={activeQrUrl}
              size={180}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400 text-center flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Point any phone or tablet camera to open instantly
          </p>

          {/* Quick Copy Link */}
          <div className="w-full mt-5 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Direct Room Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={activeQrUrl}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(activeQrUrl, true)}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition shrink-0 shadow-lg shadow-cyan-600/20"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Room ID Badge */}
            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <div className="text-xs">
                <span className="text-slate-400">Room Code: </span>
                <span className="font-mono font-semibold text-white ml-1">{roomId}</span>
              </div>
              <button
                onClick={() => copyToClipboard(roomId, false)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId ? 'Code Copied' : 'Copy Code'}
              </button>
            </div>

            {/* Wi-Fi & Network info */}
            {networkList.length > 0 && (
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-xl text-xs space-y-1">
                <div className="font-medium text-cyan-300 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" /> Same Wi-Fi Access:
                </div>
                <p className="text-slate-300">
                  Friends on the same Wi-Fi can open <span className="font-mono text-cyan-200">{activeQrUrl}</span> on phones, tablets, or laptops.
                </p>
              </div>
            )}

            {/* Remote Internet Access Note */}
            <div className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl text-xs space-y-1">
              <div className="font-medium text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> Mobile Data / Remote Friends:
              </div>
              <p className="text-slate-400">
                To invite friends outside your Wi-Fi, run <code className="px-1.5 py-0.5 bg-slate-900 text-cyan-400 rounded">npx untun tunnel 3000</code> or Cloudflare Tunnel to share a public link!
              </p>
            </div>
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
