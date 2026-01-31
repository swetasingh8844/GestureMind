
import React from 'react';
import { SystemStatus } from '../types';
import { Volume2, Play, Pause, Youtube, Lock, Unlock } from 'lucide-react';

interface StatusBarProps {
  status: SystemStatus;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <StatusCard 
        label="Volume" 
        value={`${status.volume}%`} 
        icon={<Volume2 className="w-4 h-4" />} 
        color="text-blue-400"
      />
      <StatusCard 
        label="Playback" 
        value={status.isPlaying ? 'Playing' : 'Paused'} 
        icon={status.isPlaying ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />} 
        color={status.isPlaying ? 'text-green-400' : 'text-yellow-400'}
      />
      <StatusCard 
        label="Context" 
        value={status.currentApp} 
        icon={<Youtube className="w-4 h-4" />} 
        color="text-red-400"
      />
      <StatusCard 
        label="Security" 
        value={status.isLocked ? 'Locked' : 'Active'} 
        icon={status.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />} 
        color={status.isLocked ? 'text-red-500' : 'text-emerald-400'}
      />
    </div>
  );
};

const StatusCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="glass rounded-xl p-4 flex flex-col justify-between h-24">
    <div className="flex items-center justify-between text-slate-400">
      <span className="text-[10px] uppercase font-bold tracking-tighter">{label}</span>
      {icon}
    </div>
    <div className={`text-xl font-bold truncate ${color}`}>{value}</div>
  </div>
);
