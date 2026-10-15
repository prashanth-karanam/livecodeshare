import React, { useState } from 'react';
import { Terminal, Play, Trash2, ArrowRightCircle, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConsoleOutputProps {
  output: string;
  stderr: string;
  isLoading: boolean;
  executionTime?: number | null;
  exitCode?: number | null;
  onClear: () => void;
  stdin: string;
  setStdin: (v: string) => void;
  onRun: () => void;
  isRunnable: boolean;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  output,
  stderr,
  isLoading,
  executionTime,
  exitCode,
  onClear,
  stdin,
  setStdin,
  onRun,
  isRunnable
}) => {
  const [showStdin, setShowStdin] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 text-slate-200">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 shrink-0 text-xs select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">Execution Output</span>
          {executionTime !== undefined && executionTime !== null && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono">
              <Clock className="w-3 h-3 text-cyan-400" />
              {executionTime}ms
            </span>
          )}
          {exitCode !== undefined && exitCode !== null && (
            <span
              className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-mono ${
                exitCode === 0
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
              }`}
            >
              {exitCode === 0 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              exit {exitCode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              showStdin
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Stdin Input
          </button>
          <button
            onClick={onClear}
            title="Clear Output"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {isRunnable && (
            <button
              onClick={onRun}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium text-xs shadow-md shadow-emerald-600/20 transition ml-1"
            >
              <Play className="w-3 h-3 fill-current" />
              {isLoading ? 'Running...' : 'Run'}
            </button>
          )}
        </div>
      </div>

      {/* Stdin Drawer if active */}
      {showStdin && (
        <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 shrink-0">
          <label className="text-[11px] text-slate-400 mb-1 block font-medium flex items-center gap-1">
            <ArrowRightCircle className="w-3 h-3 text-cyan-400" /> Standard Input (stdin):
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Provide standard input lines here before running..."
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>
      )}

      {/* Terminal Output Display */}
      <div className="flex-1 p-3 overflow-auto font-mono text-xs leading-relaxed select-text space-y-2">
        {isLoading && (
          <div className="flex items-center gap-2 text-cyan-400 py-2">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Executing code in cloud sandbox...</span>
          </div>
        )}

        {!isLoading && !output && !stderr && (
          <div className="text-slate-500 italic py-4 text-center">
            Click "Run" or press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 text-[11px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 text-[11px]">Enter</kbd> to execute.
          </div>
        )}

        {output && (
          <div className="text-slate-100 whitespace-pre-wrap break-words">
            {output}
          </div>
        )}

        {stderr && (
          <div className="text-rose-400 whitespace-pre-wrap break-words bg-rose-950/20 p-2 rounded-lg border border-rose-900/30">
            {stderr}
          </div>
        )}
      </div>
    </div>
  );
};
