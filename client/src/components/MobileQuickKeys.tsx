import React from 'react';

interface MobileQuickKeysProps {
  onInsertKey: (symbol: string) => void;
}

const QUICK_KEYS = [
  { label: 'Tab', val: '  ' },
  { label: '{ }', val: '{}' },
  { label: '( )', val: '()' },
  { label: '[ ]', val: '[]' },
  { label: ';', val: ';' },
  { label: '=>', val: '=> ' },
  { label: '"', val: '""' },
  { label: "'", val: "''" },
  { label: ':', val: ':' },
  { label: '=', val: ' = ' },
  { label: '<', val: '<' },
  { label: '>', val: '>' },
  { label: '+', val: ' + ' },
  { label: '-', val: ' - ' },
  { label: '!', val: '!' },
  { label: '//', val: '// ' },
  { label: '#', val: '# ' }
];

export const MobileQuickKeys: React.FC<MobileQuickKeysProps> = ({ onInsertKey }) => {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-900/95 border-t border-slate-800 overflow-x-auto select-none shrink-0 scrollbar-none">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1 shrink-0">
        Keys:
      </span>
      {QUICK_KEYS.map((k) => (
        <button
          key={k.label}
          type="button"
          onClick={() => onInsertKey(k.val)}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 active:text-white rounded-md text-xs font-mono text-slate-300 font-medium shrink-0 transition"
        >
          {k.label}
        </button>
      ))}
    </div>
  );
};
