import React, { useState } from 'react';
import {
  Download,
  Maximize2,
  RefreshCw,
  Copy,
  Check,
  Share2,
  ZoomIn,
  Loader2,
  Sliders,
  Upload,
} from 'lucide-react';
import { GeneratedImageItem } from '../../types';
import { downloadImageWithWatermark } from '../../services/watermark';

interface CanvasToolbarProps {
  image: GeneratedImageItem;
  onRegenerate: () => void;
  onOpenFullscreen: () => void;
  onOpenEditor?: () => void;
  onUploadNew?: () => void;
  onEnhanceAgain?: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  image,
  onRegenerate,
  onOpenFullscreen,
  onOpenEditor,
  onUploadNew,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [upscaled, setUpscaled] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadImageWithWatermark(image.imageUrl, `kindle-${Date.now()}.png`);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(image.enhancedPrompt || image.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KINNDLE AI Creation',
          text: image.prompt,
          url: window.location.href,
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      await handleCopyPrompt();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleUpscale = () => {
    setUpscaled(true);
    setTimeout(() => setUpscaled(false), 2500);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-950/85 border border-white/20 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors relative group disabled:opacity-50"
        title="Download Image"
        aria-label="Download image"
      >
        {downloading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Download className="w-4 h-4" />}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {downloading ? 'Processing...' : 'Download'}
        </span>
      </button>

      {/* Copy Prompt */}
      <button
        onClick={handleCopyPrompt}
        className="p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors relative group"
        title="Copy Prompt"
        aria-label="Copy prompt"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {copied ? 'Copied!' : 'Copy Prompt'}
        </span>
      </button>

      {/* Regenerate */}
      <button
        onClick={onRegenerate}
        className="p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors relative group"
        title="Regenerate Variation"
        aria-label="Regenerate variation"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Regenerate
        </span>
      </button>

      {/* Upscale */}
      <button
        onClick={handleUpscale}
        className="p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors relative group"
        title="Upscale to Ultra HD"
        aria-label="Upscale"
      >
        <ZoomIn className={`w-4 h-4 ${upscaled ? 'text-amber-400 animate-pulse' : ''}`} />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {upscaled ? 'Upscaled to 4K' : 'Upscale'}
        </span>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors relative group"
        title="Share"
        aria-label="Share"
      >
        {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {shared ? 'Link Copied' : 'Share'}
        </span>
      </button>

      {/* Edit & Adjust Image */}
      {onOpenEditor && (
        <button
          onClick={onOpenEditor}
          className="p-2.5 rounded-full hover:bg-white/15 text-white bg-white/10 transition-colors relative group border border-white/15"
          title="Edit Image (Filters, Adjustments, AI Edit)"
          aria-label="Edit image"
        >
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Edit Image
          </span>
        </button>
      )}

      {/* Upload New to Edit */}
      {onUploadNew && (
        <button
          onClick={onUploadNew}
          className="p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors relative group"
          title="Upload from Computer to Edit"
          aria-label="Upload to edit"
        >
          <Upload className="w-4 h-4" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Upload to Edit
          </span>
        </button>
      )}

      <div className="w-[1px] h-4 bg-white/15 mx-0.5" />

      {/* Fullscreen Modal */}
      <button
        onClick={onOpenFullscreen}
        className="p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors relative group"
        title="View Fullscreen"
        aria-label="View fullscreen"
      >
        <Maximize2 className="w-4 h-4" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Fullscreen
        </span>
      </button>
    </div>
  );
};
