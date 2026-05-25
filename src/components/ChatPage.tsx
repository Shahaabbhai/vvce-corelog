import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useComplaints } from '../contexts/ComplaintContext';
import { Message, Complaint } from '../types';
import { 
  Send, 
  Hash, 
  Clock, 
  User as UserIcon, 
  Search, 
  Plus, 
  Paperclip, 
  Mic, 
  X,
  Sparkles, 
  CheckCheck, 
  Info, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Loader2,
  Play,
  Pause,
  Download,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useToast } from './ui/Toast';

// Custom Voice Player Component
const VoicePlayer: React.FC<{ url: string; id: string }> = ({ url, id }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate a random-looking waveform for the futuristic design
  const waveformBars = useMemo(() => {
    return Array.from({ length: 40 }).map(() => Math.random() * 80 + 20);
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setError(null);
    setIsReady(false);
    setProgress(0);
    setCurrentTime(0);

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const onLoadedMetadata = () => {
      if (audio.duration !== Infinity && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsReady(true);
    };

    const onCanPlayThrough = () => {
      setIsReady(true);
      if (audio.duration !== Infinity && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onError = (e: any) => {
      console.error("Audio Load Error for ID:", id, e);
      setError("Asset unavailable");
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplaythrough', onCanPlayThrough);
    audio.addEventListener('error', onError);

    // Explicitly load
    audio.load();

    // Check if already loaded
    if (audio.readyState >= 1) {
      onLoadedMetadata();
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('canplaythrough', onCanPlayThrough);
      audio.removeEventListener('error', onError);
    };
  }, [url]);

  const togglePlay = async () => {
    if (!audioRef.current || !isReady) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error("Playback Error:", err);
      setError("Playback blocked");
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !isReady || !audioRef.current.duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const px = x / rect.width;
    const seekTime = px * audioRef.current.duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(px * 100);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3 min-w-[280px] p-2 bg-black/20 rounded-[20px] border border-white/5 shadow-inner">
      <audio 
        ref={audioRef} 
        className="hidden" 
        preload="auto" 
        src={url}
      />
      
      <div className="flex items-center gap-4">
        <button 
          onClick={togglePlay}
          disabled={!isReady || !!error}
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg border border-white/10 group",
            isReady 
              ? isPlaying 
                ? "bg-[#ff6b001a] text-[#ff6b00] border-[#ff6b0030] hover:bg-[#ff6b002a]" 
                : "bg-white/5 text-white hover:bg-white/10" 
              : "bg-white/5 text-slate-700 cursor-wait"
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-1" />
          )}
        </button>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center px-1">
             <div className="flex items-center gap-2">
               <span className={cn(
                 "text-[8px] font-black uppercase tracking-[0.2em]", 
                 error ? "text-rose-500" : isPlaying ? "text-[#ff6b00]" : "text-slate-500"
               )}>
                 {error ? "Signal Fail" : isPlaying ? "Streaming" : isReady ? "Voice Node" : "Loading"}
               </span>
               {isPlaying && (
                 <div className="flex gap-0.5">
                    {[1, 2, 3].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [2, 6, 2] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-0.5 bg-[#ff6b00] rounded-full"
                      />
                    ))}
                 </div>
               )}
             </div>
             <span className="text-[9px] font-mono text-slate-500 tabular-nums">
               {formatTime(currentTime)} / {formatTime(duration || 0)}
             </span>
          </div>
          
          <div 
            className="h-10 flex items-center gap-[2px] cursor-pointer group/wave relative"
            onClick={handleSeek}
          >
            {waveformBars.map((h, i) => {
              const barProgress = (i / waveformBars.length) * 100;
              const isPast = progress > barProgress;
              return (
                <div 
                  key={i}
                  style={{ height: `${h}%` }}
                  className={cn(
                    "flex-1 rounded-full transition-all duration-300",
                    isPast 
                      ? isPlaying ? "bg-[#ff6b00]" : "bg-[#ff6b0080]" 
                      : "bg-white/10 group-hover/wave:bg-white/20"
                  )}
                />
              );
            })}
            
            {/* Seek Indicator */}
            {isReady && (
              <div 
                className="absolute top-0 bottom-0 w-[1px] bg-white opacity-0 group-hover/wave:opacity-40 pointer-events-none"
                style={{ left: `${progress}%` }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 px-1">
         <div className="flex items-center gap-2 opacity-50">
            <Volume2 className="w-3 h-3 text-slate-500" />
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Source: {id.substring(0, 6)}</p>
         </div>
         <div className="flex items-center gap-3">
           <a 
             href={url} 
             download={`VVCE_VOICE_${id.substring(0, 8)}.webm`}
             className="p-1 px-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all flex items-center gap-2 group"
           >
             <Download className="w-3 h-3 group-hover:animate-bounce" />
             <span className="text-[8px] font-black uppercase tracking-widest text-[7px]">Export</span>
           </a>
         </div>
      </div>
    </div>
  );
};

const ChatPage: React.FC = () => {
  const { user, role, isConfigured } = useAuth();
  const { complaints, updateComplaintStatus } = useComplaints();
  const toast = useToast();
  
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // New recording and file states
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => 
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [complaints, searchQuery]);

  useEffect(() => {
    if (!complaints.length) return;
    if (!selectedComplaintId) {
      setSelectedComplaintId(complaints[0].id);
    }
  }, [complaints, selectedComplaintId]);

  // Fetch messages and setup subscriptions
  useEffect(() => {
    if (!selectedComplaintId || !isConfigured) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('complaint_id', selectedComplaintId)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setMessages(data);
        
        // Mark unread messages as read
        const unread = data.filter(m => {
          const isMsgStudent = m.sender_role === 'student';
          const isUserStudent = role === 'student';
          return (isUserStudent ? !isMsgStudent : isMsgStudent) && !m.is_read;
        });
        if (unread.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unread.map(m => m.id));
        }
      }
    };

    fetchMessages();

    // Typing and Message Realtime
    const channel = supabase.channel(`complaint:${selectedComplaintId}`);
    
    channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `complaint_id=eq.${selectedComplaintId}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        // If message is from others, mark as read after a small delay
        if ((payload.new as Message).sender_role !== role) {
           setTimeout(() => {
             supabase.from('messages').update({ is_read: true }).eq('id', (payload.new as Message).id).then();
           }, 2000);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `complaint_id=eq.${selectedComplaintId}`
      }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, is_read: payload.new.is_read } : m));
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== user?.id) {
          setIsTyping(prev => ({ ...prev, [payload.userId]: payload.typing }));
          // Auto clear typing after 5 seconds if no stop signal
          if (payload.typing) {
            setTimeout(() => {
              setIsTyping(prev => ({ ...prev, [payload.userId]: false }));
            }, 5000);
          }
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [selectedComplaintId, isConfigured, role, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // AI Suggestions logic
  const getAiSuggestions = async () => {
    if (!selectedComplaintId || !selectedComplaint) return;
    setIsGettingSuggestions(true);
    try {
      const history = messages.slice(-5).map(m => ({ 
        role: m.sender_role, 
        message: m.message 
      }));
      
      const response = await fetch('/api/ai/chat-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintContext: selectedComplaint.description,
          history,
          role
        })
      });
      const data = await response.json();
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Failed to get AI suggestions");
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender_role !== role) {
       getAiSuggestions();
    } else {
       setAiSuggestions([]);
    }
  }, [messages.length, role]);

  const handleSendMessage = async (msgText: string, type: 'text' | 'file' | 'voice' = 'text', attachment?: string) => {
    if ((!msgText.trim() && !attachment) || !selectedComplaintId || !user) return;
    
    setIsSending(true);
    try {
      // Primary attempt: Include new enterprise messaging columns
      const { error } = await supabase.from('messages').insert({
        complaint_id: selectedComplaintId,
        sender_id: user.id,
        sender_role: role,
        message: msgText.trim() || null,
        message_type: type,
        attachment_url: attachment || null,
        is_read: false
      });
      
      if (error) {
        // Fallback: If columns are missing in DB, insert with core fields only
        if (error.message?.includes('column') || error.code === '42703') {
           console.warn("DB Schema mismatch: Falling back to legacy message structure.");
           const { error: fallbackError } = await supabase.from('messages').insert({
             complaint_id: selectedComplaintId,
             sender_id: user.id,
             sender_role: role,
             message: attachment ? `[${type.toUpperCase()}]${attachment}` : msgText.trim()
           });
           if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }
      setNewMessage('');
    } catch (err: any) {
      toast("Send Failed", err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 5MB for base64 demo
    if (file.size > 5 * 1024 * 1024) {
      toast("File Too Large", "Maximum file size is 5MB for transmission.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await handleSendMessage(file.name, 'file', base64);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Audio Visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      audioContextRef.current = audioCtx;
      analyzerRef.current = analyzer;

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        analyzer.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(average);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // Determine most compatible mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
        'audio/aac',
        'audio/wav'
      ];
      
      const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

      const newRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const chunks: Blob[] = [];

      newRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      newRecorder.onstop = async () => {
        if (chunks.length === 0) return;
        
        const finalType = newRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: finalType });
        
        // Safety check for empty recordings
        if (blob.size < 100) {
           toast("Recording Failed", "The audio capture was too short or empty.");
           return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          // Ensure base64 isn't overly massive for DB (limit to 2MB roughly)
          if (base64.length > 2.5 * 1024 * 1024) {
             toast("Voice Note Too Long", "Please keep recordings under 2 minutes.");
             return;
          }
          await handleSendMessage("Voice Message", 'voice', base64);
        };
        reader.readAsDataURL(blob);
        
        // Cleanup stream
        stream.getTracks().forEach(track => track.stop());
        
        // Cleanup Audio Analysis
        if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      newRecorder.start(250); // Collect data in smaller chunks for stability
      setRecorder(newRecorder);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast("Mic Access Denied", "Could not access microphone for voice message.");
    }
  };

  const stopRecording = (shouldDiscard = false) => {
    if (recorder && recorder.state !== 'inactive') {
      if (shouldDiscard) {
        recorder.onstop = () => {
           // Overwrite onstop to just cleanup
           if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
           if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
      }
      recorder.stop();
      setIsRecording(false);
      setRecorder(null);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!selectedComplaintId || !user) return;
    supabase.channel(`complaint:${selectedComplaintId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, typing: isTyping }
    });
  };

  const selectedComplaint = complaints.find(c => c.id === selectedComplaintId);
  const someoneTyping = Object.values(isTyping).some(Boolean);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 p-2 md:p-0">
      {/* Enhanced Sidebar */}
      <div className="hidden lg:flex w-80 bg-[#12100f] border border-[#221c1a] rounded-[32px] flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Conversations</h2>
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white cursor-pointer transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="relative group">
            <input 
              type="text"
              placeholder="Search ref or keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-[#ff6b00]/30 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700 group-focus-within:text-[#ff6b00] transition-colors" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {filteredComplaints.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                 <AlertCircle className="w-6 h-6 text-slate-700" />
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">No matching operational logs</p>
            </div>
          )}
          {filteredComplaints.map(c => {
            const isActive = selectedComplaintId === c.id;
            const statusColor = c.status === 'Resolved' ? 'text-emerald-500' : c.status === 'In Progress' ? 'text-[#ff6b00]' : 'text-slate-500';
            
            return (
              <button
                key={c.id}
                onClick={() => setSelectedComplaintId(c.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all group relative",
                  isActive ? "bg-[#ff6b0008] border border-[#ff6b0015]" : "hover:bg-white/[0.02] border border-transparent"
                )}
              >
                {isActive && <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#ff6b00] rounded-full" />}
                <div className="flex justify-between items-start mb-2">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "text-[#ff6b00]" : "text-slate-500")}>
                    {c.category}
                  </span>
                  <div className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border", 
                    c.status === 'Resolved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    c.status === 'In Progress' ? "bg-[#ff6b0010] border-[#ff6b0020] text-[#ff6b00]" :
                    "bg-white/5 border-white/10 text-slate-400"
                  )}>
                    {c.status}
                  </div>
                </div>
                <p className={cn("text-xs font-bold truncate transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>
                  {c.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                   <div className="w-4 h-4 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-mono text-slate-600">ID</div>
                   <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{c.id.split('-')[0]}</span>
                   <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Clock className="w-2.5 h-2.5 text-slate-700" />
                      <span className="text-[8px] font-bold text-slate-700">LV: 2m</span>
                   </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modern Main Chat Area */}
      <div className="flex-1 bg-[#12100f] border border-[#221c1a] rounded-[32px] flex flex-col overflow-hidden relative shadow-2xl">
        {selectedComplaint ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-[#12100f] flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-2xl flex items-center justify-center relative">
                   <Hash className="w-5 h-5 text-[#ff6b00]" />
                   <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#12100f] rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{selectedComplaint.category}</h3>
                    <div className="px-2 py-0.5 bg-white/5 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/10">Ref: {selectedComplaint.id.split('-')[0]}</div>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-0.5 line-clamp-1 italic max-w-md">"{selectedComplaint.description}"</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 {role === 'admin' && (
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                       <button 
                         onClick={() => {
                           updateComplaintStatus(selectedComplaint.id, 'Resolved');
                           toast("Status Updated", "Marked as resolved.");
                         }}
                         className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                       >
                         Resolve
                       </button>
                       <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
                          <ChevronDown className="w-4 h-4" />
                       </button>
                    </div>
                 )}
                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white cursor-pointer transition-colors transition-all active:scale-95">
                   <MoreVertical className="w-5 h-5" />
                 </div>
              </div>
            </div>

            {/* AI Insights Bar */}
            <div className="px-6 py-2 bg-gradient-to-r from-[#ff6b0008] to-transparent border-b border-white/5 flex items-center gap-3">
               <Sparkles className="w-3 h-3 text-[#ff6b00] animate-pulse" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AI Summary:</span>
               <span className="text-[10px] font-bold text-slate-300 italic truncate italic">{selectedComplaint.ai_summary || "Analyzing ongoing dialogue for optimal resolution path..."}</span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed opacity-90">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-xs mx-auto">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center mb-6 animate-bounce">
                    <Hash className="w-8 h-8 text-[#ff6b00] opacity-50" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Initiate Protocol</h4>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest leading-relaxed">System ready for message dispatch. All communications logged.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, idx) => {
                    const isMine = msg.sender_role === role;
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const isGrouped = prevMsg && prevMsg.sender_role === msg.sender_role && (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 120000);

                    // Unified message type detection (handles legacy fallback format too)
                    const isVoice = msg.message_type === 'voice' || (msg.message && msg.message.startsWith('[VOICE]'));
                    const isFile = msg.message_type === 'file' || (msg.message && msg.message.startsWith('[FILE]'));
                    const isText = !isVoice && !isFile;

                    // Extraction for legacy fallback URL
                    const getUrl = () => {
                      if (msg.attachment_url) return msg.attachment_url;
                      if (isVoice && msg.message?.startsWith('[VOICE]')) return msg.message.substring(7);
                      if (isFile && msg.message?.startsWith('[FILE]')) return msg.message.split('] ')[1] || '';
                      return '';
                    };

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        key={msg.id} 
                        className={cn(
                          "flex gap-4 group relative",
                          isMine ? "flex-row-reverse" : "flex-row",
                          isGrouped ? "mt-[-20px]" : "mt-4"
                        )}
                      >
                        {!isGrouped && (
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 flex-shrink-0 transition-transform group-hover:scale-110 shadow-lg",
                            isMine ? "bg-[#ff6b00] text-white" : "bg-white/5 text-slate-300"
                          )}>
                            <UserIcon className="w-5 h-5" />
                          </div>
                        )}
                        {isGrouped && <div className="w-10 flex-shrink-0" />}

                        <div className={cn("flex flex-col max-w-[70%]", isMine ? "items-end" : "items-start")}>
                          {!isGrouped && (
                            <div className="flex items-center gap-3 mb-1.5 px-0.5">
                              <span className={cn("text-[10px] font-black uppercase tracking-[0.1em]", isMine ? "text-[#ff6b00]" : "text-slate-200")}>
                                {msg.sender_role === 'super_admin' ? 'Super Admin' : 
                                 msg.sender_role === 'admin' ? 'Admin' : 
                                 msg.sender_role === 'department_staff' ? 'Staff' : 'Student'} 
                                {isMine && " (You)"}
                              </span>
                              <span className="text-[9px] font-bold text-slate-600">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                          <div className={cn(
                            "text-sm font-medium leading-[1.6] transition-all",
                            isMine 
                              ? "bg-[#ff6b00] text-white rounded-[24px] rounded-tr-sm hover:brightness-110 shadow-2xl shadow-orange-950/20" 
                              : "bg-[#151110] text-slate-200 rounded-[24px] rounded-tl-sm border border-white/5 hover:border-white/10",
                            isVoice ? "p-1 min-w-[280px]" : "px-5 py-3.5"
                          )}>
                            {isText && msg.message}
                            {isFile && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 bg-black/10 p-3 rounded-xl border border-white/5">
                                   <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                                      <Paperclip className="w-5 h-5 text-[#ff6b00]" />
                                   </div>
                                   <div className="flex-1">
                                      <p className="text-xs font-black truncate max-w-[150px]">{msg.message?.replace('[FILE] ', '')}</p>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase">Document Attachment</p>
                                   </div>
                                </div>
                                <a 
                                  href={getUrl() || '#'} 
                                  download="attachment"
                                  className="block w-full py-2 text-center bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
                                >
                                  Download Asset
                                </a>
                              </div>
                            )}
                            {isVoice && (
                               <VoicePlayer url={getUrl()} id={msg.id} />
                            )}
                          </div>
                          
                          {/* Read Receipts */}
                          {isMine && idx === messages.length - 1 && (
                            <div className="flex items-center gap-1 mt-1.5 px-1 opacity-60">
                               <CheckCheck className={cn("w-3 h-3 transition-colors", msg.is_read ? "text-emerald-500" : "text-slate-600")} />
                               <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{msg.is_read ? "ACKNOWLEDGED" : "DISPATCHED"}</span>
                            </div>
                          )}
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {someoneTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex gap-4 items-center"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                       <Loader2 className="w-5 h-5 text-[#ff6b00] animate-spin" />
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-tl-none border border-white/5">
                       <div className="flex gap-1">
                          <span className="w-1 h-1 bg-[#ff6b00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 bg-[#ff6b00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 bg-[#ff6b00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Interaction Layer */}
            <div className="p-6 bg-[#12100f] border-t border-white/5 space-y-4">
              {/* AI Suggested Replies */}
              <AnimatePresence>
                 {(aiSuggestions.length > 0 || isGettingSuggestions) && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="flex flex-wrap gap-2 pt-2"
                   >
                     {isGettingSuggestions ? (
                       <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                          <Sparkles className="w-3 h-3 text-[#ff6b00] animate-spin" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Generating neural routes...</span>
                       </div>
                     ) : (
                       aiSuggestions.map((suggestion, i) => (
                         <button
                           key={i}
                           onClick={() => handleSendMessage(suggestion)}
                           className="px-4 py-2 rounded-xl bg-[#ff6b0008] border border-[#ff6b0015] text-[10px] font-black text-[#ff6b00] uppercase tracking-widest hover:bg-[#ff6b0015] transition-all active:scale-95 italic"
                         >
                           "{suggestion}"
                         </button>
                       ))
                     )}
                   </motion.div>
                 )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="relative group flex items-end gap-3 bg-[#0a0807] border border-white/10 rounded-[28px] p-2 focus-within:border-[#ff6b00]/30 transition-all shadow-inner">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                
                <div className="flex items-center gap-1 pl-2 mb-1.5">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all"
                   >
                      <Plus className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={isRecording ? stopRecording : startRecording}
                     className={cn(
                       "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                       isRecording ? "bg-rose-500 text-white animate-pulse" : "text-slate-600 hover:text-white hover:bg-white/5"
                     )}
                   >
                      <Mic className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="flex-1 relative">
                  {isRecording ? (
                    <div className="flex items-center gap-4 py-4 px-2">
                       <div className="relative w-8 h-8 flex items-center justify-center">
                          <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
                          <div className="w-2 h-2 bg-rose-500 rounded-full" />
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                               <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">On Air</span>
                               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">Neural Audio Uplink...</span>
                             </div>
                             <span className="text-[9px] font-mono text-rose-500 tabular-nums">
                               {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                             </span>
                          </div>
                          <div className="h-1.5 bg-rose-950/30 rounded-full overflow-hidden flex items-center px-0.5">
                             <motion.div 
                               className="h-1 bg-rose-500 rounded-full"
                               animate={{ width: `${Math.min(100, Math.max(5, (audioLevel / 128) * 100))}%` }}
                               transition={{ type: 'spring', bounce: 0, duration: 0.05 }}
                             />
                          </div>
                       </div>
                       <button 
                         onClick={() => stopRecording(true)}
                         className="p-2 bg-white/5 hover:bg-rose-500/20 text-slate-600 hover:text-rose-500 rounded-xl transition-all group"
                         title="Discard Transmission"
                       >
                          <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
                       </button>
                    </div>
                  ) : (
                    <textarea
                      ref={inputRef as any}
                      rows={1}
                      value={newMessage}
                      onChange={e => {
                        setNewMessage(e.target.value);
                        handleTyping(e.target.value.length > 0);
                      }}
                      onBlur={() => handleTyping(false)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(newMessage);
                        }
                      }}
                      placeholder="Transmit operational directive..."
                      className="w-full bg-transparent border-none py-4 px-2 text-sm font-medium text-white placeholder:text-slate-700 focus:ring-0 resize-none max-h-32 min-h-[56px] custom-scrollbar"
                    />
                  )}
                </div>

                <div className="flex items-center gap-1 pr-1 mb-1.5">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:text-[#ff6b00] hover:bg-[#ff6b0008] transition-all"
                   >
                      <Paperclip className="w-5 h-5" />
                   </button>
                   <button
                    onClick={() => isRecording ? stopRecording() : handleSendMessage(newMessage)}
                    disabled={(!newMessage.trim() && !isRecording) || isSending}
                    className="w-12 h-12 bg-[#ff6b00] text-white rounded-2xl flex items-center justify-center hover:bg-[#ff7b1a] shadow-xl shadow-orange-950/40 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-[#ff6b00] rounded-full shadow-[0_0_8px_#ff6b00]" />
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Link: ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Clock className="w-3 h-3 text-slate-700" />
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Uptime: 14h 22m</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Shift+Enter for newline</span>
                 </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#12100f]">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[48px] flex items-center justify-center mb-8 relative">
               <Hash className="w-10 h-10 text-slate-700" />
               <div className="absolute inset-0 bg-[#ff6b00] blur-[40px] opacity-10 rounded-full animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] mb-4 italic">No Active Uplink</h3>
            <p className="text-xs font-black text-slate-600 uppercase tracking-[0.15em] max-w-xs leading-loose">Select a sectoral log from the directory to establish a communication channel.</p>
            <div className="mt-12 flex gap-4">
               <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Status: NOMINAL</div>
               <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">Safety Mesh: ENABLED</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
