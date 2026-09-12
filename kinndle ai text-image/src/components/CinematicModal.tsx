import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check, Wand2, Maximize2, Share2, Sparkles, Loader2, Layers } from 'lucide-react';
import { GeneratedImageItem, ExploreArtwork } from '../types';
import { downloadImageWithWatermark } from '../services/watermark';

interface CinematicModalProps {
  item: GeneratedImageItem | ExploreArtwork | null;
  onClose: () => void;
  onRemixInStudio: (prompt: string, style: string) => void;
  onUseAsReference?: (imageUrl: string, prompt?: string, style?: string) => void;
}

export const CinematicModal: React.FC<CinematicModalProps> = ({
  item,
  onClose,
  onRemixInStudio,
  onUseAsReference,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const promptText = ('enhancedPrompt' in item && item.enhancedPrompt) ? item.enhancedPrompt : item.prompt;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadImageWithWatermark(item.imageUrl, `kindle-${Date.now()}.png`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Top Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors z-50 border border-white/15"
        aria-label="Close viewer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Modal Dialog Card */}
      <div
        className="relative max-w-6xl w-full max-h-[90vh] rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl flex flex-col lg:flex-row bg-[#08080c]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: High-res Image Display with watermark in bottom-left */}
        <div className="lg:w-7/12 relative bg-zinc-950 flex items-center justify-center overflow-hidden min-h-[340px] sm:min-h-[480px]">
          <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
            <img
              src={item.imageUrl}
              alt={item.prompt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[80vh]"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('unsplash.com')) {
                  target.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop';
                }
              }}
            />

            {/* Watermark says kindle in left corner in bottom without dot or black background */}
            <div
              id="watermark-kindle-modal"
              className="absolute bottom-4 left-5 z-20 pointer-events-none select-none text-white/90 font-mono text-sm tracking-wider lowercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold"
            >
              kindle
            </div>
          </div>
        </div>

        {/* Right Side: Metadata, Prompt Anatomy & Actions */}
        <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/10 bg-zinc-900/50">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>KINNDLE RENDERING</span>
                <span>·</span>
                <span>{item.aspectRatio}</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                {'title' in item ? item.title : 'Generated Artwork'}
              </h3>
            </div>

            {/* Prompt Specification Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 uppercase tracking-wider">Concept / Prompt</span>
                <button
                  onClick={handleCopy}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-zinc-300 font-light leading-relaxed max-h-48 overflow-y-auto">
                {promptText}
              </div>
            </div>

            {/* Parameters Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-500 block uppercase">Style</span>
                <span className="text-zinc-200 font-medium mt-0.5 block capitalize">{item.style}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-500 block uppercase">Aspect Ratio</span>
                <span className="text-zinc-200 font-medium mt-0.5 block">{item.aspectRatio}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                onRemixInStudio(item.prompt, item.style);
                onClose();
              }}
              className="flex-1 py-3 px-3 rounded-xl bg-white text-zinc-950 font-display font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-all shadow-md"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Remix Prompt</span>
            </button>

            {onUseAsReference && (
              <button
                onClick={() => {
                  onUseAsReference(item.imageUrl, item.prompt, item.style);
                  onClose();
                }}
                className="flex-1 py-3 px-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/15 shadow-md"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Image with Image</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-display font-medium text-xs flex items-center justify-center gap-1.5 transition-all border border-white/10 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
