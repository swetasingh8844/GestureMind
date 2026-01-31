
export type ActionType = 
  | 'PLAY_VIDEO'
  | 'PAUSE_VIDEO'
  | 'PLAY_SONG'
  | 'PAUSE_SONG'
  | 'VOLUME_UP'
  | 'VOLUME_DOWN'
  | 'OPEN_YOUTUBE'
  | 'OPEN_GMAIL'
  | 'SCROLL_UP'
  | 'SCROLL_DOWN'
  | 'LOCK_SYSTEM'
  | 'NEXT_TAB'
  | 'NONE';

export interface GestureState {
  label: string;
  confidence: number;
  timestamp: number;
}

export interface ActionLog {
  id: string;
  action: ActionType;
  reasoning: string;
  timestamp: Date;
}

export interface SystemStatus {
  isLocked: boolean;
  volume: number;
  isPlaying: boolean;
  currentApp: string;
}
