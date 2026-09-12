import React, { useRef, useState } from 'react';
import { Plus, Upload, X, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { AgentAdapter } from '../../services/agentAdapter';
import { ReferenceAnalysisResult } from '../../types';

interface ReferenceUploaderProps {
  referenceImage: string | null;
  onReferenceChange: (base64: string | null) => void;
  onAnalysisComplete?: (analysis: ReferenceAnalysisResult) => void;
}

export const ReferenceUploader: React.FC<ReferenceUploaderProps> = ({
  referenceImage,
  onReferenceChange,
  onAnalysisComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      onReferenceChange(base64);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2400);

      // Trigger vision analysis
      if (onAnalysisComplete) {
        try {
          setIsAnalyzing(true);
          const analysis = await AgentAdapter.analyzeReference(base64);
          onAnalysisComplete(analysis);
        } catch (err) {
          console.warn('Reference vision analysis failed:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!referenceImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative rounded-2xl border transition-all duration-300 p-3.5 flex items-center justify-between cursor-pointer ${
            isDragging
              ? 'border-white/50 bg-white/10 scale-[1.01] shadow-[0_0_20px_rgba(255,255,255,0.15)]'
              : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 hover:scale-[1.005]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
              {isDragging ? (
                <Upload className="w-4 h-4 animate-bounce text-white" />
              ) : (
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-200 group-hover:text-white">
                {isDragging ? 'Drop Image Here' : '+ Image with Image (Reference Guide)'}
              </p>
              <p className="text-[11px] text-zinc-500 font-light">
                Generate new image using an uploaded image + prompt
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-zinc-400 px-2 py-1 rounded bg-white/[0.06] border border-white/10">
            Image with Image
          </span>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-white/20 bg-zinc-900/60 p-3 flex items-center justify-between backdrop-blur-md animate-in fade-in zoom-in-95 duration-300 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/20 flex-shrink-0 bg-black">
              <img
                src={referenceImage}
                alt="Reference Thumbnail"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">
                  {justAdded ? 'Image with Image Attached' : 'Image with Image Active'}
                </span>
                {justAdded && <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">
                {isAnalyzing ? (
                  <span className="inline-flex items-center gap-1 text-purple-300 animate-pulse">
                    <Sparkles className="w-3 h-3" /> Analyzing composition...
                  </span>
                ) : (
                  'Blending reference image with prompt'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onReferenceChange(null);
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
            title="Remove Reference"
            aria-label="Remove reference image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
