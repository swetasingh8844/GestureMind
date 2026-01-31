
import React from 'react';
import { ActionLog } from '../types';

interface ConsoleProps {
  logs: ActionLog[];
}

export const Console: React.FC<ConsoleProps> = ({ logs }) => {
  return (
    <div className="glass rounded-xl p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">System Logs</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 mono text-xs scrollbar-hide">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Waiting for gestures...</div>
        )}
        {[...logs].reverse().map((log) => (
          <div key={log.id} className="border-l-2 border-indigo-500/50 pl-3 py-1">
            <div className="flex justify-between text-indigo-400 mb-1">
              <span>{log.action}</span>
              <span className="text-[10px] text-slate-500">
                {log.timestamp.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">{log.reasoning}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
