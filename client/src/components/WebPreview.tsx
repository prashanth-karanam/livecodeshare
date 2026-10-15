import React, { useState, useEffect } from 'react';
import { RefreshCw, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';

interface WebPreviewProps {
  code: string;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ code }) => {
  const [key, setKey] = useState(0);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Auto-refresh when code changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setKey((prev) => prev + 1);
    }, 600);
    return () => clearTimeout(timer);
  }, [code]);

  const openInNewTab = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getContainerWidth = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-[375px] h-[667px] my-auto shadow-2xl rounded-2xl border-4 border-slate-700';
      case 'tablet':
        return 'max-w-[768px] h-[90%] my-auto shadow-2xl rounded-xl border-4 border-slate-700';
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 text-slate-200">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-cyan-400">Live Web Preview</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Viewport switchers */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setDeviceMode('desktop')}
            title="Desktop Fullscreen"
            className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            title="Tablet View (768px)"
            className={`p-1 rounded ${deviceMode === 'tablet' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            title="Mobile View (375px)"
            className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setKey((k) => k + 1)}
            title="Reload Iframe"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={openInNewTab}
            title="Open in new window"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame wrapper */}
      <div className="flex-1 bg-slate-900/40 p-2 overflow-auto flex items-center justify-center">
        <iframe
          key={key}
          title="web-preview"
          srcDoc={code}
          sandbox="allow-scripts allow-modals allow-same-origin"
          className={`bg-white transition-all duration-300 ${getContainerWidth()}`}
        />
      </div>
    </div>
  );
};
