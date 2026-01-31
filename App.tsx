import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Console } from './components/Console';
import { StatusBar } from './components/StatusBar';
import { interpretGesture } from './services/geminiActionService';
import { ActionLog, ActionType, SystemStatus } from './types';
import { Camera as CameraIcon, CameraOff, Zap, Mail, Music, Youtube, Layout, BrainCircuit, ExternalLink, Sparkles, Music2 } from 'lucide-react';

declare const Hands: any;
declare const Camera: any;
declare const drawConnectors: any;
declare const drawLandmarks: any;
declare const HAND_CONNECTIONS: any;

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [lastReasoning, setLastReasoning] = useState<string>("");
  const [autoTriggerMsg, setAutoTriggerMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<SystemStatus>({
    isLocked: false,
    volume: 50,
    isPlaying: true,
    currentApp: 'System'
  });

  const lastProcessedTime = useRef<number>(0);
  const DEBOUNCE_MS = 2500; 
  const cameraInstance = useRef<any>(null);
  const handsInstance = useRef<any>(null);

  const triggerAutoOpen = (url: string, label: string) => {
    setAutoTriggerMsg(`LINK ENGAGED: OPENING ${label}...`);
    const win = window.open(url, '_blank');
    if (!win) {
       setAutoTriggerMsg(`POP-UP BLOCKED! PLEASE ALLOW FOR ${label}`);
    }
    setTimeout(() => setAutoTriggerMsg(null), 3000);
  };

  const addLog = useCallback((action: ActionType, reasoning: string) => {
    const newLog: ActionLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      reasoning,
      timestamp: new Date()
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  }, []);

  const handleAction = useCallback((action: ActionType, reasoning: string) => {
    setLastReasoning(reasoning);
    if (action === 'NONE') return;

    addLog(action, reasoning);

    setStatus(prev => {
      switch (action) {
        case 'OPEN_YOUTUBE': 
          triggerAutoOpen('https://www.youtube.com', 'YOUTUBE');
          return { ...prev, currentApp: 'YouTube' };
        case 'OPEN_GMAIL':
          triggerAutoOpen('https://mail.google.com', 'GMAIL');
          return { ...prev, currentApp: 'Gmail' };
        case 'PLAY_SONG': 
          // Middle finger: Open YouTube Music
          triggerAutoOpen('https://music.youtube.com', 'YT MUSIC');
          return { ...prev, isPlaying: true, currentApp: 'Music' };
        case 'PAUSE_SONG': 
          // O-Sign: Pause only if in music/system context
          return { ...prev, isPlaying: false };
        case 'VOLUME_UP': 
          return { ...prev, volume: Math.min(100, prev.volume + 10) };
        case 'VOLUME_DOWN': 
          return { ...prev, volume: Math.max(0, prev.volume - 10) };
        case 'LOCK_SYSTEM': 
          return { ...prev, isLocked: true };
        default: return prev;
      }
    });
  }, [addLog]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    handsInstance.current = hands;

    const onResults = async (results: any) => {
      const canvasCtx = canvasRef.current?.getContext('2d');
      if (!canvasCtx || !canvasRef.current || isCameraOff || status.isLocked) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#6366f1', lineWidth: 4 });
          drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });
        }

        const now = Date.now();
        if (now - lastProcessedTime.current > DEBOUNCE_MS && !isProcessing && !quotaExceeded) {
          setIsProcessing(true);
          lastProcessedTime.current = now;
          
          const handData = results.multiHandLandmarks[0].map((l: any) => ({
            x: l.x.toFixed(3),
            y: l.y.toFixed(3)
          }));

          try {
            const response = await interpretGesture(handData);
            if (response.reasoning.includes("QUOTA_EXCEEDED")) {
              setQuotaExceeded(true);
              setTimeout(() => setQuotaExceeded(false), 15000);
            }
            handleAction(response.action, response.reasoning);
          } catch (error) {
            console.error(error);
          } finally {
            setIsProcessing(false);
          }
        }
      } else {
        if (Date.now() - lastProcessedTime.current > 4000) {
          setLastReasoning("");
        }
      }
      canvasCtx.restore();
    };

    hands.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && !isCameraOff && !status.isLocked && handsInstance.current) {
          try {
            await handsInstance.current.send({ image: videoRef.current });
          } catch (e) {}
        }
      },
      width: 1280,
      height: 720
    });
    
    cameraInstance.current = camera;
    if (!isCameraOff && !status.isLocked) {
        camera.start().catch(() => {});
    }

    return () => {
      if (cameraInstance.current) cameraInstance.current.stop();
      if (handsInstance.current) {
        handsInstance.current.close();
        handsInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isCameraOff || status.isLocked) {
      cameraInstance.current?.stop();
    } else {
      cameraInstance.current?.start().catch(() => {});
    }
  }, [isCameraOff, status.isLocked]);

  const renderVirtualView = () => {
    if (status.currentApp === 'Music' || status.currentApp === 'YouTube') {
      const isMusic = status.currentApp === 'Music';
      return (
        <div className={`absolute inset-0 ${isMusic ? 'bg-zinc-950' : 'bg-black'} flex flex-col p-6 animate-in fade-in duration-500 z-10`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-red-600">
              {isMusic ? <Music2 className="w-8 h-8" /> : <Youtube className="w-8 h-8 fill-current" />}
              <span className="font-bold text-xl tracking-tighter text-white uppercase">{isMusic ? 'NeuralMusic' : 'NeuralTube'}</span>
            </div>
            <div className="flex gap-2">
               <a href={isMusic ? "https://music.youtube.com" : "https://www.youtube.com"} target="_blank" className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded-full text-[10px] text-white uppercase font-bold tracking-widest transition-all">
                <ExternalLink className="w-3 h-3" /> Go Direct
               </a>
               <button onClick={() => setStatus(s => ({...s, currentApp: 'System'}))} className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] text-slate-400 hover:text-white uppercase font-bold tracking-widest transition-all">Back</button>
            </div>
          </div>
          <div className="flex-1 rounded-2xl bg-zinc-900 overflow-hidden relative border border-white/5 shadow-2xl flex flex-col items-center justify-center">
            {!status.isPlaying && <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex items-center justify-center font-bold text-5xl text-white tracking-widest">SIGNAL PAUSED</div>}
            <div className={`w-44 h-44 rounded-full border-4 border-red-600/30 flex items-center justify-center relative transition-all duration-500 ${status.isPlaying ? 'scale-110 shadow-[0_0_60px_rgba(220,38,38,0.2)]' : 'scale-95'}`}>
               <Music className={`w-20 h-20 text-red-600 ${status.isPlaying ? 'animate-pulse' : 'opacity-10'}`} />
            </div>
            <div className="mt-10 text-center px-4">
              <div className="text-[10px] font-mono text-red-600/60 mb-1 tracking-[0.5em] uppercase">Hyperlink Protocol 0x44</div>
              <div className="text-lg font-bold text-white tracking-tight uppercase">{isMusic ? 'YouTube Music Stream' : 'YouTube Video Stream'}</div>
            </div>
          </div>
        </div>
      );
    }
    
    if (status.currentApp === 'Gmail') {
      return (
        <div className="absolute inset-0 bg-slate-950 flex flex-col p-6 animate-in fade-in duration-500 z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-blue-400">
              <Mail className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tighter text-white uppercase">NeuralMail</span>
            </div>
            <div className="flex gap-2">
               <a href="https://mail.google.com" target="_blank" className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-[10px] text-white uppercase font-bold tracking-widest transition-all">
                <ExternalLink className="w-3 h-3" /> Go To Inbox
               </a>
               <button onClick={() => setStatus(s => ({...s, currentApp: 'System'}))} className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] text-slate-400 hover:text-white uppercase font-bold tracking-widest transition-all">Exit</button>
            </div>
          </div>
          <div className="flex-1 space-y-3 px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-blue-400 text-[10px] uppercase">Encryption_Node_{i}</span>
                  <span className="text-[9px] text-slate-600 font-mono">0x22:FF:{i}D</span>
                </div>
                <div className="text-sm text-white font-bold mb-1 uppercase tracking-tighter">Mail Redirect Initialized</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Gesture deciphered: Small finger (Pinky) for Gmail.</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen w-screen flex flex-col p-4 md:p-8 space-y-6 overflow-hidden">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">GestureMind</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.3em]">Direct Link Link v4.5</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCameraOff(!isCameraOff)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              isCameraOff 
              ? 'bg-red-500/10 border-red-500/30 text-red-500' 
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isCameraOff ? <CameraOff className="w-4 h-4" /> : <CameraIcon className="w-4 h-4" />}
            {isCameraOff ? 'LINK_DISABLED' : 'SENSORS_ACTIVE'}
          </button>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold transition-colors ${
            isCameraOff ? 'bg-slate-900 border-slate-800 text-slate-600' :
            quotaExceeded ? 'bg-red-500/10 border-red-500 text-red-500' :
            isProcessing ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 
            'bg-green-500/10 border-green-500 text-green-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isCameraOff ? 'bg-slate-800' : quotaExceeded ? 'bg-red-500 animate-pulse' : isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
            {isCameraOff ? 'OFFLINE' : quotaExceeded ? 'QUOTA_HIT' : isProcessing ? 'INTERPRETING...' : 'CONNECTED'}
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="relative flex-1 rounded-2xl overflow-hidden glass shadow-2xl flex items-center justify-center bg-slate-900/50">
            {renderVirtualView()}
            
            {!isCameraOff && (
              <>
                <div className="scanner-line z-20 opacity-10 pointer-events-none"></div>
                <video ref={videoRef} className="hidden" playsInline muted />
                <canvas ref={canvasRef} className="w-full h-full object-cover scale-x-[-1]" />
                
                {/* Automation Overlay */}
                {autoTriggerMsg && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="px-10 py-6 bg-red-600 rounded-2xl border-4 border-white/20 shadow-[0_0_120px_rgba(220,38,38,0.5)] flex flex-col items-center gap-4">
                       <Sparkles className="w-10 h-10 text-white animate-spin" />
                       <span className="text-lg font-black text-white uppercase tracking-[0.2em]">{autoTriggerMsg}</span>
                       <div className="text-[10px] text-white/60 font-mono animate-pulse uppercase tracking-widest">Redirecting via Neural Link...</div>
                    </div>
                  </div>
                )}

                {lastReasoning && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 fade-in duration-500 w-full max-w-sm px-4">
                    <div className="px-6 py-3 bg-black/90 backdrop-blur-2xl rounded-full border border-red-500/40 flex items-center gap-3 shadow-2xl justify-center">
                      <BrainCircuit className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{lastReasoning}</span>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 left-4 flex gap-2 z-30">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/10 text-white/80 uppercase tracking-tighter">Cam_Input_12</span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600/80 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-tighter">
                    <Layout className="w-3 h-3" />
                    <span>Neural_Capture_Active</span>
                  </div>
                </div>

                {isProcessing && (
                  <div className="absolute top-4 right-4 z-30">
                    <div className="px-4 py-1 bg-amber-500 text-black text-[10px] font-black rounded-full animate-pulse uppercase tracking-widest">Interpreting</div>
                  </div>
                )}

                <div className="absolute inset-0 border-[6px] pointer-events-none transition-colors duration-700 z-20" style={{ borderColor: isProcessing ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.05)' }}></div>
              </>
            )}

            {isCameraOff && (
              <div className="flex flex-col items-center space-y-4 text-slate-600 text-center animate-in zoom-in duration-300">
                <Layout className="w-16 h-16 opacity-10" />
                <p className="text-[10px] font-mono tracking-[0.5em] uppercase opacity-40">Optical_Link_Offline</p>
                <button onClick={() => setIsCameraOff(false)} className="px-8 py-2.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30">Restore Signal</button>
              </div>
            )}
          </div>
          
          <StatusBar status={status} />
        </div>

        <aside className="lg:col-span-4 flex flex-col space-y-6 min-h-0">
          <div className="flex-1 min-h-0">
            <Console logs={logs} />
          </div>

          <div className="glass rounded-xl p-6 border-indigo-500/10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-6 flex items-center justify-between">
              Auto_Command_Set
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <KeymapItem icon="🖐️" label="OPEN PALM" action="AUTO-OPEN YOUTUBE" color="text-red-500" />
              <KeymapItem icon="🖕" label="MIDDLE FINGER" action="YT MUSIC LINK" color="text-emerald-500" />
              <KeymapItem icon="🤙" label="PINKY FINGER" action="GMAIL LINK" color="text-blue-500" />
              <KeymapItem icon="👌" label="O-SIGN" action="PAUSE SIGNAL" color="text-amber-500" />
              <KeymapItem icon="👍" label="THUMB_UP" action="VOLUME +" color="text-indigo-400" />
              <KeymapItem icon="👎" label="THUMB_DN" action="VOLUME -" color="text-indigo-400" />
            </div>
            <p className="mt-5 text-[9px] text-slate-600 uppercase font-mono italic leading-relaxed">* Note: Pop-ups must be enabled for automatic redirection features to work correctly.</p>
          </div>
        </aside>
      </main>

      <footer className="text-center text-slate-800 text-[8px] font-black uppercase tracking-[1em] py-2 opacity-10">
        NEURAL INTERFACE TERMINAL // NODE_0X9A4F // AES-512 SECURE
      </footer>
    </div>
  );
};

const KeymapItem = ({ icon, label, action, color }: any) => (
  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-inner">{icon}</div>
      <div className="flex flex-col">
        <span className="font-black text-white text-[9px] tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity">{label}</span>
        <span className={`text-[10px] uppercase font-black ${color} mt-0.5 tracking-tight`}>{action}</span>
      </div>
    </div>
  </div>
);

export default App;