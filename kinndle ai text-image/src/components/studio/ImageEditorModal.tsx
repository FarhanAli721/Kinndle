import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Wand2,
  Download,
  Check,
  RotateCw,
  FlipHorizontal,
  Undo2,
  Sliders,
  Palette,
  Crop,
  Layers,
  Image as ImageIcon,
  Loader2,
  Sun,
  Contrast,
  Aperture,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { GeneratedImageItem } from '../../types';
import { AgentAdapter } from '../../services/agentAdapter';
import { stampWatermarkToDataUrl, downloadImageWithWatermark } from '../../services/watermark';

interface ImageEditorModalProps {
  isOpen: boolean;
  initialImage: string | null; // Data URL or URL
  onClose: () => void;
  onSaveToCanvas: (item: GeneratedImageItem) => void;
}

type TabType = 'ai-edit' | 'adjust' | 'filters' | 'transform';

interface FilterPreset {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  vignette: number;
  grayscale: number;
  sepia: number;
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'original',
    name: 'Original',
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    vignette: 0,
    grayscale: 0,
    sepia: 0,
  },
  {
    id: 'cinematic',
    name: 'Cinematic Gold',
    brightness: 5,
    contrast: 22,
    saturation: 15,
    warmth: 20,
    vignette: 25,
    grayscale: 0,
    sepia: 10,
  },
  {
    id: 'neon-noir',
    name: 'Neo Noir',
    brightness: -5,
    contrast: 35,
    saturation: 30,
    warmth: -15,
    vignette: 40,
    grayscale: 0,
    sepia: 0,
  },
  {
    id: 'vintage',
    name: 'Vintage 35mm',
    brightness: 2,
    contrast: -8,
    saturation: -15,
    warmth: 25,
    vignette: 30,
    grayscale: 0,
    sepia: 35,
  },
  {
    id: 'monochrome',
    name: 'Editorial B&W',
    brightness: 5,
    contrast: 30,
    saturation: -100,
    warmth: 0,
    vignette: 20,
    grayscale: 100,
    sepia: 0,
  },
  {
    id: 'vivid',
    name: 'Vivid Pop',
    brightness: 8,
    contrast: 20,
    saturation: 45,
    warmth: 5,
    vignette: 10,
    grayscale: 0,
    sepia: 0,
  },
  {
    id: 'nordic',
    name: 'Muted Nordic',
    brightness: 0,
    contrast: 10,
    saturation: -30,
    warmth: -20,
    vignette: 15,
    grayscale: 0,
    sepia: 0,
  },
  {
    id: 'cyber',
    name: 'Cyberpunk',
    brightness: 10,
    contrast: 30,
    saturation: 60,
    warmth: -30,
    vignette: 35,
    grayscale: 0,
    sepia: 0,
  },
];

const AI_EDIT_SUGGESTIONS = [
  { label: 'Change Background', prompt: 'Change the background to a luxury modern architectural villa with warm ambient lighting' },
  { label: 'Cyberpunk Tokyo', prompt: 'Transform scene with rainy neon-lit cyberpunk Tokyo street reflections and volumetric fog' },
  { label: 'Cinematic Sunset', prompt: 'Bathe the subject in dramatic golden hour sunset rim lighting and warm anamorphic lens flare' },
  { label: 'Editorial Fashion', prompt: 'Make it a high-end Vogue magazine editorial cover with studio strobe lighting' },
  { label: 'Oil Painting', prompt: 'Convert into a masterwork oil painting with rich textured brushstrokes and classical chiaroscuro' },
  { label: 'Studio Minimalist', prompt: 'Place subject in a clean minimalist photo studio with softbox shadows and neutral backdrop' },
  { label: '3D Octane Render', prompt: 'Transform into a hyper-detailed 3D render with Octane materials, raytraced reflections, and volumetrics' },
  { label: 'Anime Movie', prompt: 'Re-render in modern Japanese animation cinema aesthetic with luminous skies and painted clouds' },
];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  initialImage,
  onClose,
  onSaveToCanvas,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active image state (source base64 or URL)
  const [activeImageSrc, setActiveImageSrc] = useState<string | null>(initialImage);
  const [imageFileName, setImageFileName] = useState<string>('Uploaded Image');
  const [activeTab, setActiveTab] = useState<TabType>('ai-edit');

  // AI Edit States
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual Adjustments States
  const [brightness, setBrightness] = useState<number>(0); // -50 to 50
  const [contrast, setContrast] = useState<number>(0); // -50 to 50
  const [saturation, setSaturation] = useState<number>(0); // -100 to 100
  const [warmth, setWarmth] = useState<number>(0); // -50 to 50
  const [vignette, setVignette] = useState<number>(0); // 0 to 100
  const [grayscale, setGrayscale] = useState<number>(0); // 0 to 100
  const [sepia, setSepia] = useState<number>(0); // 0 to 100
  const [blur, setBlur] = useState<number>(0); // 0 to 10

  // Transformations
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Watermark toggle
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Initialize or update image when modal opens or initialImage changes
  useEffect(() => {
    if (initialImage) {
      setActiveImageSrc(initialImage);
    }
  }, [initialImage]);

  // Redraw canvas whenever adjustments or image source changes
  useEffect(() => {
    if (!activeImageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      const isRotated90or270 = rotation === 90 || rotation === 270;
      const w = isRotated90or270 ? img.naturalHeight || img.height : img.naturalWidth || img.width;
      const h = isRotated90or270 ? img.naturalWidth || img.width : img.naturalHeight || img.height;

      canvas.width = w;
      canvas.height = h;

      ctx.save();
      // Handle transformations: rotation and flips around center
      ctx.translate(w / 2, h / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Build CSS filter string for canvas
      const bVal = 100 + brightness;
      const cVal = 100 + contrast;
      const sVal = 100 + saturation;
      const gVal = grayscale;
      const sepVal = sepia;
      const blVal = blur;

      ctx.filter = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%) grayscale(${gVal}%) sepia(${sepVal}%) blur(${blVal}px)`;

      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;
      ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
      ctx.restore();

      // Apply warmth overlay if set
      if (warmth !== 0) {
        ctx.save();
        ctx.fillStyle = warmth > 0 ? `rgba(255, 140, 0, ${Math.abs(warmth) * 0.0035})` : `rgba(0, 150, 255, ${Math.abs(warmth) * 0.0035})`;
        ctx.globalCompositeOperation = warmth > 0 ? 'color' : 'color';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Apply vignette if set
      if (vignette > 0) {
        ctx.save();
        const radius = Math.max(w, h) * 0.75;
        const gradient = ctx.createRadialGradient(w / 2, h / 2, radius * 0.3, w / 2, h / 2, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.85})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Apply signature 'kindle' watermark if enabled
      if (includeWatermark) {
        const fontSize = Math.max(16, Math.round(w * 0.024));
        ctx.font = `600 ${fontSize}px monospace, -apple-system, sans-serif`;
        const margin = Math.max(16, Math.round(w * 0.028));
        const text = 'kindle';

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = Math.max(4, Math.round(fontSize * 0.35));
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textBaseline = 'bottom';
        ctx.fillText(text, margin, h - margin);
        ctx.restore();
      }
    };

    img.src = activeImageSrc;
  }, [
    activeImageSrc,
    brightness,
    contrast,
    saturation,
    warmth,
    vignette,
    grayscale,
    sepia,
    blur,
    rotation,
    flipH,
    flipV,
    includeWatermark,
  ]);

  if (!isOpen) return null;

  // File processing for uploads
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setActiveImageSrc(dataUrl);
      resetAdjustments();
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const resetAdjustments = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setWarmth(0);
    setVignette(0);
    setGrayscale(0);
    setSepia(0);
    setBlur(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const applyPreset = (preset: FilterPreset) => {
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setWarmth(preset.warmth);
    setVignette(preset.vignette);
    setGrayscale(preset.grayscale);
    setSepia(preset.sepia);
  };

  // AI Modification Trigger
  const handleRunAiEdit = async () => {
    if (!aiPrompt.trim() || !activeImageSrc) return;
    setIsAiProcessing(true);
    setAiError(null);

    try {
      // Send image as reference with edit instructions
      const result = await AgentAdapter.generateImage({
        prompt: `Based on the uploaded image: ${aiPrompt.trim()}`,
        referenceImage: activeImageSrc,
        aspectRatio: '1:1',
        style: 'cinematic',
        quality: 'ultra',
        imageType: 'Cinematic',
      });

      if (result && result.imageUrl) {
        // Stamp watermark and update active image
        const stampedUrl = await stampWatermarkToDataUrl(result.imageUrl);
        setActiveImageSrc(stampedUrl);
        resetAdjustments();
        setAiPrompt('');
      }
    } catch (err: any) {
      console.error('AI Edit error:', err);
      setAiError(err?.message || 'Failed to process AI edit. Please try a different description.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Export current canvas state and set as active canvas in studio
  const handleSaveToStudio = async () => {
    if (!canvasRef.current) return;
    setIsSaving(true);
    try {
      const finalDataUrl = canvasRef.current.toDataURL('image/png');
      const item: GeneratedImageItem = {
        id: 'edit-' + Date.now(),
        imageUrl: finalDataUrl,
        prompt: aiPrompt ? `Edited: ${aiPrompt}` : `Edited ${imageFileName}`,
        aspectRatio: rotation === 90 || rotation === 270 ? 'Portrait' : '1:1',
        style: 'Custom Edit',
        quality: 'Masterpiece 8K',
        imageType: 'Edited Artwork',
        createdAt: new Date().toISOString(),
        referenceImageUsed: true,
        metadata: {
          agent: 'KINNDLE Image Studio',
          model: 'kinndle-editor-v2',
          dimensions: `${canvasRef.current.width}x${canvasRef.current.height}`,
        },
      };

      onSaveToCanvas(item);
      onClose();
    } catch (err) {
      console.error('Save to studio error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Direct Download
  const handleDownloadDirect = async () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    await downloadImageWithWatermark(dataUrl, `kindle-edit-${Date.now()}.png`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      <div
        className="relative max-w-6xl w-full max-h-[92vh] rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl flex flex-col lg:flex-row bg-[#08080c]"
        onClick={(e) => e.stopPropagation()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Top Header Bar */}
        <div className="absolute top-4 left-5 right-5 flex items-center justify-between z-30 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto bg-zinc-950/80 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white">KINNDLE Image Editor</span>
            <span className="text-zinc-500">·</span>
            <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[180px]">
              {imageFileName}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 border border-white/15 transition-all shadow-sm"
              title="Upload another image from your computer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Replace Image</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors border border-white/15"
              aria-label="Close editor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= LEFT SIDE: Live Canvas View ================= */}
        <div className="lg:w-7/12 relative bg-zinc-950/80 flex items-center justify-center p-6 pt-16 min-h-[380px] sm:min-h-[500px] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
          {/* Drag Overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-40 bg-white/10 backdrop-blur-md border-2 border-dashed border-white/60 flex flex-col items-center justify-center text-white">
              <Upload className="w-12 h-12 mb-2 animate-bounce" />
              <p className="font-display font-semibold text-lg">Drop image here to load</p>
            </div>
          )}

          {activeImageSrc ? (
            <div className="relative max-w-full max-h-[70vh] flex items-center justify-center group">
              {/* The Real Dynamic Canvas Rendering Filtered Pixels */}
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl object-contain border border-white/10"
              />

              {/* Processing Overlay */}
              {isAiProcessing && (
                <div className="absolute inset-0 rounded-2xl bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center z-30">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-pink-500/20 border border-white/20 flex items-center justify-center mb-3">
                    <Wand2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <p className="font-display font-semibold text-white text-sm">Applying AI Edit...</p>
                  <p className="text-xs font-mono text-zinc-400 mt-1 max-w-xs text-center">
                    Synthesizing changes with KINNDLE neural vision
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Upload Trigger when No Image Yet */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-white/20 hover:border-white/40 rounded-3xl cursor-pointer hover:bg-white/[0.02] transition-all text-center max-w-md"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-zinc-300 mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-white text-base">Select Image to Edit</h4>
              <p className="text-xs text-zinc-400 mt-1.5 max-w-xs leading-relaxed">
                Click to browse files from your computer or drag & drop directly onto this window.
              </p>
              <span className="mt-4 px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-semibold shadow-md">
                Browse Files
              </span>
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDE: Editing Control Suite ================= */}
        <div className="lg:w-5/12 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[85vh] bg-zinc-900/40">
          <div className="space-y-6 pt-10 sm:pt-12">
            {/* Top Editor Tab Selectors */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10">
              <button
                onClick={() => setActiveTab('ai-edit')}
                className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'ai-edit'
                    ? 'bg-white text-zinc-950 shadow-md font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Prompt Edit</span>
              </button>

              <button
                onClick={() => setActiveTab('filters')}
                className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'filters'
                    ? 'bg-white text-zinc-950 shadow-md font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Looks</span>
              </button>

              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'adjust'
                    ? 'bg-white text-zinc-950 shadow-md font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust</span>
              </button>

              <button
                onClick={() => setActiveTab('transform')}
                className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'transform'
                    ? 'bg-white text-zinc-950 shadow-md font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Transform</span>
              </button>
            </div>

            {/* TAB 1: AI Prompt Modification */}
            {activeTab === 'ai-edit' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="text-xs font-semibold text-zinc-200 block mb-1.5">
                    What would you like to edit or change?
                  </label>
                  <p className="text-[11px] text-zinc-500 mb-2">
                    Describe any modification — change background, alter lighting, transform style, or add elements.
                  </p>
                  <div className="relative">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Change the background to a luxury modern villa with golden sunset lighting..."
                      rows={3}
                      className="w-full bg-black/40 border border-white/15 focus:border-white/40 rounded-2xl p-3.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {aiError && (
                  <p className="text-[11px] text-rose-400 font-mono bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20">
                    {aiError}
                  </p>
                )}

                {/* Quick 1-Click Transformation Tags */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                    Quick AI Transformation Prompts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_EDIT_SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAiPrompt(s.prompt)}
                        className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 transition-all text-left"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Run AI Edit Button */}
                <button
                  onClick={handleRunAiEdit}
                  disabled={isAiProcessing || !aiPrompt.trim()}
                  className="w-full py-3 rounded-2xl bg-white text-zinc-950 font-display font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg cursor-pointer"
                >
                  {isAiProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Generating AI Edit...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Apply AI Edit</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: Filter Presets */}
            {activeTab === 'filters' && (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-medium">Curated Photographic Grades</span>
                  <button
                    onClick={resetAdjustments}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono flex items-center gap-1"
                  >
                    <Undo2 className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {FILTER_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all text-left group"
                    >
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white block">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">
                        {p.id === 'original' ? 'Neutral look' : 'Color graded'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Fine Sliders Adjustments */}
            {activeTab === 'adjust' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Fine Tone & Exposure</span>
                  <button
                    onClick={resetAdjustments}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono flex items-center gap-1"
                  >
                    <Undo2 className="w-3 h-3" /> Reset
                  </button>
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" /> Brightness
                    </span>
                    <span>{brightness > 0 ? `+${brightness}` : brightness}</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Contrast className="w-3.5 h-3.5" /> Contrast
                    </span>
                    <span>{contrast > 0 ? `+${contrast}` : contrast}</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" /> Saturation
                    </span>
                    <span>{saturation > 0 ? `+${saturation}` : saturation}</span>
                  </div>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Warmth */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Warmth / Color Balance</span>
                    <span>{warmth > 0 ? `+${warmth}` : warmth}</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={warmth}
                    onChange={(e) => setWarmth(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Vignette */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Cinematic Vignette</span>
                    <span>{vignette}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={vignette}
                    onChange={(e) => setVignette(Number(e.target.value))}
                    className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Blur / Soft Focus */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Soft Dream Blur</span>
                    <span>{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Transform & Orient */}
            {activeTab === 'transform' && (
              <div className="space-y-4 animate-in fade-in">
                <span className="text-xs font-semibold text-zinc-200 block mb-2">
                  Orientation & Mirroring
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex flex-col items-center justify-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-all"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    onClick={() => setFlipH((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-xs transition-all ${
                      flipH
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-white/[0.04] hover:bg-white/[0.1] border-white/10 text-zinc-300'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    <span>Flip Horiz</span>
                  </button>

                  <button
                    onClick={() => setFlipV((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-xs transition-all ${
                      flipV
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-white/[0.04] hover:bg-white/[0.1] border-white/10 text-zinc-300'
                    }`}
                  >
                    <div className="rotate-90">
                      <FlipHorizontal className="w-4 h-4" />
                    </div>
                    <span>Flip Vert</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Current Rotation Angle
                  </span>
                  <p className="text-xs font-mono text-zinc-300">
                    {rotation}° rotation · {flipH ? 'Mirrored horizontally' : 'Standard orientation'}
                  </p>
                </div>
              </div>
            )}

            {/* Watermark Toggle */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-zinc-200 block">Stamp 'kindle' Watermark</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Embeds signature watermark in bottom-left pixels
                </span>
              </div>
              <button
                onClick={() => setIncludeWatermark(!includeWatermark)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  includeWatermark ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-zinc-950 transition-transform ${
                    includeWatermark ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom Action CTAs */}
          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleSaveToStudio}
              disabled={isSaving || !activeImageSrc}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-white text-zinc-950 font-display font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-all shadow-lg active:scale-98 disabled:opacity-40 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Apply & Set as Canvas Image</span>
            </button>

            <button
              onClick={handleDownloadDirect}
              disabled={!activeImageSrc}
              className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-display font-medium text-xs flex items-center justify-center gap-1.5 transition-all border border-white/10 disabled:opacity-40"
              title="Download adjusted image to computer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
