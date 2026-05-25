import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image as ImageIcon, Sparkles, CheckCircle2, PlusCircle, X, Camera, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { Category, Priority } from '../types';
import { useToastActions } from './ui/Toast';
import { useComplaints } from '../contexts/ComplaintContext';
import { AIProcessingOverlay } from './AIProcessingOverlay';

interface ComplaintFormProps {
  onSuccess?: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess }) => {
  const { toast, clearToasts } = useToastActions();
  const { addComplaint, analyzeComplaint } = useComplaints();
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ 
    category: string; 
    priority: string; 
    explanation: string; 
    department: string;
    resolution_estimate: number;
    sentiment: string;
    summary: string;
    urgency_score: number;
    related_context: string;
    confidence_score?: number;
    is_duplicate?: boolean;
    duplicate_ref?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = async () => {
    if (!description || description.length < 5) {
      toast("Short Description", "Please provide a more detailed description.");
      return;
    }
    
    clearToasts();
    setIsSubmitting(true);
    try {
      await addComplaint(
        description, 
        aiResult?.category || 'Other', 
        aiResult?.priority || 'Medium', 
        aiResult?.explanation || 'Manual submission', 
        aiResult?.department || 'General', 
        isAnonymous,
        imageBase64,
        {
          summary: aiResult?.summary,
          sentiment: aiResult?.sentiment,
          resolution_estimate: aiResult?.resolution_estimate,
          urgency_score: aiResult?.urgency_score,
          confidence_score: aiResult?.confidence_score,
          is_duplicate: aiResult?.is_duplicate,
          duplicate_ref: aiResult?.duplicate_ref
        }
      );
      toast("Issue Logged!", "Your request has been tracked in the audit log.");
      setDescription('');
      setAiResult(null);
      removeImage();
      setIsAnonymous(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Submission error:", err);
      toast("Error", err.message || "Failed to submit. Check your database setup.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error(err);
      toast("Camera Error", "Could not access the camera. Make sure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageBase64(dataUrl);

        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            setImageFile(file);
          });
      }
      stopCamera();
    }
  };

  const analyzeIssue = async () => {
    if ((!description || description.length < 5) && !imageBase64) return;
    clearToasts();
    setIsAnalyzing(true);
    
    try {
      const data = await analyzeComplaint(
        description, 
        imageBase64 || undefined, 
        imageFile?.type || 'image/jpeg'
      );
      setAiResult(data);
      toast("AI Insights Ready", "Refined analysis complete.");
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast("AI Offline", "Using manual classification instead.");
      setAiResult({
        category: 'Maintenance',
        priority: 'Medium',
        department: 'Facilities',
        explanation: 'AI was slow to respond. Please review these settings.',
        resolution_estimate: 24,
        sentiment: 'Neutral',
        summary: 'Manual classification due to service interruption.',
        urgency_score: 45,
        related_context: 'General maintenance buffer',
        confidence_score: 0.4
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10">
      <AnimatePresence>
        {isAnalyzing && <AIProcessingOverlay />}
        {isCameraActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0807]/90 backdrop-blur-xl p-4"
          >
             <div className="w-full max-w-2xl bg-[#151110] border border-white/10 rounded-[40px] p-4 flex flex-col items-center gap-6 shadow-2xl">
                <div className="w-full relative bg-black rounded-[32px] overflow-hidden aspect-video">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
               <div className="flex gap-4 w-full px-4 mb-4">
                  <button onClick={stopCamera} className="w-1/3 h-14 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button onClick={captureImage} className="flex-1 h-14 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-colors">
                    Capture Photo
                  </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-white tracking-tighter">Submit New Issue</h2>
          <button 
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors",
              isAnonymous ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
            )}
            title="Submit anonymously"
          >
            <EyeOff className="w-4 h-4" />
            {isAnonymous ? "Incognito Active" : "Go Incognito"}
          </button>
        </div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Our AI will automatically categorize and prioritize your request based on campus guidelines.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="bg-[#12100f] border border-[#221c1a] rounded-[40px] p-6 md:p-10 space-y-10"
      >
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Issue Description</label>
          <div className="relative group">
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-48 bg-white/[0.03] border border-white/5 rounded-[32px] p-6 md:p-8 text-white placeholder:text-slate-600 focus:ring-0 focus:border-[#ff6b00]/40 transition-all resize-none text-lg"
              placeholder="E.g., WiFi is not working in the library since morning..."
            />
            <div className="absolute bottom-6 right-6 flex gap-2">
               <button onClick={startCamera} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-slate-400 transition-colors" title="Take Photo">
                  <Camera className="w-5 h-5" />
               </button>
               <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-slate-400 transition-colors" title="Upload Image">
                  <ImageIcon className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Photo Evidence (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            
            {imageBase64 ? (
               <div className="h-20 bg-white/[0.02] border border-white/10 rounded-3xl flex items-center justify-between px-4 group">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                     <img src={imageBase64} alt="Upload preview" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex flex-col overflow-hidden">
                     <span className="text-xs font-bold text-white truncate max-w-[150px]">{imageFile?.name || 'captured-photo'}</span>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Image attached</span>
                   </div>
                 </div>
                 <button onClick={removeImage} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-colors shrink-0">
                   <X className="w-4 h-4" />
                 </button>
               </div>
            ) : (
               <div className="flex gap-4">
                 <div onClick={() => fileInputRef.current?.click()} className="flex-1 h-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center hover:border-[#ff6b00]/20 transition-all cursor-pointer">
                    <PlusCircle className="w-6 h-6 text-slate-600" />
                 </div>
                 <div onClick={startCamera} className="w-20 h-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center hover:border-[#ff6b00]/20 transition-all cursor-pointer group">
                    <Camera className="w-6 h-6 text-slate-600 group-hover:text-[#ff6b00] transition-colors" />
                 </div>
               </div>
            )}
          </div>
          
          <div className="flex items-end">
            <button
              onClick={analyzeIssue}
              disabled={isAnalyzing || (!description.trim() && !imageBase64)}
              className="w-full h-16 bg-white text-black rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 transition-all disabled:opacity-50 group"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-[#ff6b00]" />
                  AI Classification
                </>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {aiResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden group"
            >
              {/* Futuristic Background Blur & Glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6b0015] to-transparent" />
              
              <div className="bg-[#151210] border border-[#ff6b0020] rounded-[48px] p-8 md:p-12 space-y-10 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b0005] blur-[100px] rounded-full -mr-32 -mt-32" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ff6b0010] border border-[#ff6b0020] rounded-2xl flex items-center justify-center text-[#ff6b00]">
                       <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#ff6b00] uppercase tracking-[0.3em] mb-1">Intelligence Assessment</p>
                      <h3 className="text-2xl font-black text-white tracking-tight leading-none">Operational Analysis Complete</h3>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Validated</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Urgency Matrix</p>
                    <div className="relative">
                       <p className="text-4xl font-black text-white tracking-tighter mb-4">{aiResult.urgency_score}%</p>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${aiResult.urgency_score}%` }}
                            className={cn(
                              "h-full transition-all duration-1000",
                              aiResult.urgency_score > 70 ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "bg-[#ff6b00]"
                            )}
                          />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sentiment Analytics</p>
                    <p className="text-3xl font-black text-white tracking-tighter uppercase">{aiResult.sentiment}</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Affective Response Detected</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Routing</p>
                    <p className="text-3xl font-black text-[#ff6b00] tracking-tighter italic">{aiResult.department}</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Target Department Assign</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resolution ETA</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{aiResult.resolution_estimate} Hours</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      Confidence: {( (aiResult.confidence_score || 0.9) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {aiResult.is_duplicate && (
                   <div className="bg-rose-500/10 border border-rose-500/20 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                           <EyeOff className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Duplicate Detected</p>
                          <p className="text-sm font-bold text-slate-300">A similar issue was recently reported. This may be grouped automatically.</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-rose-500/10 rounded-full">
                         <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Cluster Match</span>
                      </div>
                   </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] relative group/summary">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Summary</p>
                       <p className="text-lg font-bold text-slate-200 leading-tight mb-4 italic">"{aiResult.summary}"</p>
                       <p className="text-xs font-medium text-slate-500 leading-relaxed italic border-t border-white/5 pt-4">"{aiResult.explanation}"</p>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-4 space-y-6">
                    <div className="p-6 h-full bg-[#ff6b0005] border border-[#ff6b0015] rounded-[32px] flex flex-col justify-between">
                       <div>
                         <p className="text-[10px] font-black text-[#ff6b00] uppercase tracking-widest mb-3">Context Match</p>
                         <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">{aiResult.related_context}</p>
                       </div>
                       <div className="pt-6">
                          <div className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center",
                            aiResult.priority === 'High' ? "bg-rose-500 text-white shadow-xl shadow-rose-950/40" : "bg-white text-black"
                          )}>
                            {aiResult.priority} Priority Node
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => {
                      setAiResult(null);
                      clearToasts();
                    }}
                    className="flex-1 h-14 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                  >
                    Adjust Report
                  </button>
                  <button
                    onClick={handleManualSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] h-14 bg-[#ff6b00] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#ff7b1a] transition-all shadow-2xl shadow-orange-950/40 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Execute Dispatch
                        <div className="w-6 h-6 bg-black/10 rounded-full flex items-center justify-center">
                          <PlusCircle className="w-3.5 h-3.5" />
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

