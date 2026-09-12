import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wand2,
  Sparkles,
  Sliders,
  Clock,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  Maximize2,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import { AgentAdapter } from '../../services/agentAdapter';
import {
  AgentConfigResponse,
  GeneratedImageItem,
  PromptEnhanceResult,
  ReferenceAnalysisResult,
} from '../../types';
import { INSPIRATION_PROMPTS } from '../../data/showcase';
import { ReferenceUploader } from './ReferenceUploader';
import { CanvasToolbar } from './CanvasToolbar';
import { SettingsDrawer } from './SettingsDrawer';
import { HistoryDrawer } from './HistoryDrawer';
import { stampWatermarkToDataUrl } from '../../services/watermark';

interface CreateStudioProps {
  initialPrompt?: string;
  initialStyle?: string;
  initialReferenceImage?: string | null;
  onOpenFullscreen: (item: GeneratedImageItem) => void;
}

export const CreateStudio: React.FC<CreateStudioProps> = ({
  initialPrompt = '',
  initialStyle = 'cinematic',
  initialReferenceImage = null,
  onOpenFullscreen,
}) => {
  const [config, setConfig] = useState<AgentConfigResponse | null>(null);

  // Form State
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [enhanceBreakdown, setEnhanceBreakdown] = useState<PromptEnhanceResult['breakdown'] | null>(null);
  const [directorNote, setDirectorNote] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<string | null>(initialReferenceImage || null);

  useEffect(() => {
    if (initialReferenceImage) {
      setReferenceImage(initialReferenceImage);
    }
  }, [initialReferenceImage]);

  // Settings
  const [selectedAspect, setSelectedAspect] = useState<string>('16:9');
  const [selectedStyle, setSelectedStyle] = useState<string>(initialStyle || 'cinematic');
  const [selectedQuality, setSelectedQuality] = useState<string>('ultra');
  const [selectedImageType, setSelectedImageType] = useState<string>('Cinematic');
  const [creativity, setCreativity] = useState<number>(0.7);
  const [guidance, setGuidance] = useState<number>(8);

  // Tabs on Right Sidebar: 'settings' | 'history'
  const [rightTab, setRightTab] = useState<'settings' | 'history'>('settings');

  // Generation & Enhancement States
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('Initializing creative agent...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Input Focus State
  const [isPromptFocused, setIsPromptFocused] = useState<boolean>(false);

  // Active Displayed Image
  const [currentImage, setCurrentImage] = useState<GeneratedImageItem | null>(null);
  const [history, setHistory] = useState<GeneratedImageItem[]>([]);

  // Load config on mount
  useEffect(() => {
    AgentAdapter.getConfig().then((cfg) => {
      setConfig(cfg);
    });

    // Default hero canvas image if none generated yet
    setCurrentImage({
      id: 'initial-preview',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
      prompt: 'A solitary obsidian monolith resting in an endless black desert under twilight skies',
      enhancedPrompt: 'SUBJECT: Monolithic black mirror slab · ENVIRONMENT: Vast dark sand desert during twilight · LIGHTING: Volumetric silver dusk light · CAMERA: 35mm anamorphic wide shot · MOOD: Mysterious, monumental · STYLE: Cinematic photorealism · ASPECT RATIO: 16:9',
      aspectRatio: '16:9',
      style: 'Cinematic',
      quality: 'Ultra HD 4K',
      imageType: 'Cinematic',
      createdAt: new Date().toISOString(),
      metadata: {
        agent: 'KINNDLE',
        model: 'gemini-3.1-flash-lite-image',
        dimensions: '1344x768',
      },
    });
  }, []);

  // Update prompt if props change
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    if (initialStyle) {
      setSelectedStyle(initialStyle);
    }
  }, [initialPrompt, initialStyle]);

  // Handle Prompt Enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    setErrorMsg(null);
    try {
      const res = await AgentAdapter.enhancePrompt({
        prompt,
        style: selectedStyle,
        imageType: selectedImageType,
        aspectRatio: selectedAspect,
      });

      setEnhancedPrompt(res.enhancedPrompt);
      setEnhanceBreakdown(res.breakdown);
      setDirectorNote(res.directorNote);
      if (res.suggestedAspect) {
        setSelectedAspect(res.suggestedAspect);
      }
    } catch (err: any) {
      console.error('Enhance error:', err);
      setErrorMsg(err?.message || 'Prompt enhancement failed.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);

    // Dynamic loading typography sequence
    const steps = [
      'Understanding your vision...',
      'Art Direction: Composing lighting & camera angle...',
      'Synthesizing photorealistic materials & depth...',
      'Refining 8k high-frequency textures...',
      'Finalizing cinematic masterpiece...',
    ];
    let stepIndex = 0;
    setGenerationStep(steps[0]);

    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setGenerationStep(steps[stepIndex]);
    }, 1800);

    try {
      const generated = await AgentAdapter.generateImage({
        prompt,
        enhancedPrompt: enhancedPrompt || undefined,
        aspectRatio: selectedAspect,
        style: selectedStyle,
        quality: selectedQuality,
        referenceImage,
        imageType: selectedImageType,
        creativity,
        guidance,
      });

      // Bake the 'kindle' watermark directly inside the image pixels in the bottom-left corner
      let finalizedItem = generated;
      try {
        const watermarkedUrl = await stampWatermarkToDataUrl(generated.imageUrl);
        finalizedItem = {
          ...generated,
          imageUrl: watermarkedUrl,
        };
      } catch (wErr) {
        console.warn('Watermark stamp error:', wErr);
      }

      clearInterval(stepInterval);
      setCurrentImage(finalizedItem);
      setHistory((prev) => [finalizedItem, ...prev]);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Generation error:', err);
      setErrorMsg(err?.message || 'Failed to generate image. Please check agent parameters or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseInspiration = (item: { prompt: string; category: string }) => {
    setPrompt(item.prompt);
    setSelectedImageType(item.category);
    setEnhancedPrompt('');
    setEnhanceBreakdown(null);
  };

  const handleReuseFromHistory = (item: GeneratedImageItem) => {
    setPrompt(item.prompt);
    if (item.enhancedPrompt) setEnhancedPrompt(item.enhancedPrompt);
    setSelectedAspect(item.aspectRatio);
    setSelectedStyle(item.style);
    setCurrentImage(item);
  };

  return (
    <section id="studio-section" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Creative Studio
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs font-mono text-zinc-500">
              Agent Model: {config?.model || 'gpt-5.6-terra'}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Studio Canvas
          </h2>
        </div>

        {/* Right Tab Selector (Settings vs History) */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-900/80 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setRightTab('settings')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              rightTab === 'settings'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Parameters</span>
          </button>
          <button
            onClick={() => setRightTab('history')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              rightTab === 'history'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-white/20 text-white">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-rose-100 font-mono text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3-Column Creative Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: Prompt Editor & Controls ================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Glass Prompt Panel */}
          <div
            data-cursor="prompt"
            className={`relative rounded-3xl p-5 transition-all duration-300 ${
              isPromptFocused
                ? 'glass-panel-glow border-white/40 shadow-[0_0_40px_rgba(255,255,255,0.08)] bg-zinc-900/80'
                : 'glass-panel border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-zinc-300 font-display uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Prompt Studio</span>
              </label>

              {/* Enhance Prompt Button */}
              {config?.capabilities.promptEnhancement && (
                <button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !prompt.trim()}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isEnhancing
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 active:scale-95 disabled:opacity-40 disabled:pointer-events-none'
                  }`}
                  title="Enhance prompt with KINNDLE Art Direction Engine"
                >
                  <Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} />
                  <span>{isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}</span>
                </button>
              )}
            </div>

            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsPromptFocused(true)}
                onBlur={() => setIsPromptFocused(false)}
                rows={4}
                placeholder="Describe what you imagine..."
                className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed font-normal"
              />
            </div>

            {/* Enhancing Feedback Animation */}
            {isEnhancing && (
              <div className="mt-3 p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                <span className="font-mono text-[11px]">Understanding your vision...</span>
              </div>
            )}

            {/* Enhanced Prompt Display */}
            {enhancedPrompt && !isEnhancing && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Enhanced by KINNDLE
                  </span>
                  <button
                    onClick={() => setEnhancedPrompt('')}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-xs text-zinc-300 font-light leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                  {enhancedPrompt}
                </p>

                {/* Director Note */}
                {directorNote && (
                  <p className="text-[11px] text-zinc-400 italic font-serif">
                    Art Director: "{directorNote}"
                  </p>
                )}

                {/* Breakdown Chips */}
                {enhanceBreakdown && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {enhanceBreakdown.subject && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-white/[0.04] text-zinc-400 border border-white/5">
                        Subject: {enhanceBreakdown.subject}
                      </span>
                    )}
                    {enhanceBreakdown.lighting && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-white/[0.04] text-zinc-400 border border-white/5">
                        Light: {enhanceBreakdown.lighting}
                      </span>
                    )}
                    {enhanceBreakdown.camera && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-white/[0.04] text-zinc-400 border border-white/5">
                        Lens: {enhanceBreakdown.camera}
                      </span>
                    )}
                    {enhanceBreakdown.mood && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-white/[0.04] text-zinc-400 border border-white/5">
                        Mood: {enhanceBreakdown.mood}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reference Image Upload Area */}
          {config?.capabilities.referenceImages && (
            <ReferenceUploader
              referenceImage={referenceImage}
              onReferenceChange={setReferenceImage}
            />
          )}

          {/* Preset Inspiration Pills */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mb-2">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Inspiration Presets</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUseInspiration(item)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/5 hover:border-white/15 transition-all text-left truncate max-w-full"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* The GENERATE Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`group relative w-full py-4 px-6 rounded-2xl font-display font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer ${
              isGenerating
                ? 'bg-zinc-800 text-zinc-400 border border-white/10 cursor-not-allowed'
                : 'bg-white text-zinc-950 hover:bg-zinc-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] border border-white/80'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
                <span>Creating your vision...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-zinc-950 transition-transform group-hover:scale-110" />
                <span>Generate</span>
                <ArrowRight className="w-4 h-4 text-zinc-950 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

        {/* ================= CENTER COLUMN: Large Image Canvas ================= */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center justify-center min-h-[460px] sm:min-h-[520px] bg-[#08080c]">
            {/* Ambient edge glow */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/10 shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]" />

            {/* GENERATION STATE */}
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950/90 backdrop-blur-md z-30">
                {/* Scanning line animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-scan-line pointer-events-none" />

                {/* Animated placeholder graphic */}
                <div className="relative w-24 h-24 mb-6 rounded-2xl bg-white/[0.04] border border-white/15 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-pink-500/20 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>

                {/* Dynamic loading typography */}
                <p className="font-display font-semibold text-white text-base tracking-wide text-center">
                  Creating your vision...
                </p>
                <p className="text-xs font-mono text-zinc-400 mt-2 text-center max-w-xs animate-pulse">
                  {generationStep}
                </p>

                {/* Elegant non-fake progress wave */}
                <div className="mt-6 flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['8px', '22px', '8px'] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut',
                      }}
                      className="w-1 rounded-full bg-white/70"
                    />
                  ))}
                </div>
              </div>
            ) : currentImage ? (
              /* READY STATE: Image Result with Cinematic Reveal */
              <motion.div
                initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full group flex items-center justify-center"
                data-cursor="image"
              >
                <div className="relative max-w-full max-h-[620px] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
                  <img
                    src={currentImage.imageUrl}
                    alt={currentImage.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain max-h-[620px] rounded-3xl"
                    onError={(e) => {
                      // Fallback to high-res thematic Unsplash visual if host has hotlink constraints
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes('unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop';
                      }
                    }}
                  />

                  {/* Watermark says kindle in left corner in bottom without dot or black background */}
                  <div
                    id="watermark-kindle-studio"
                    className="absolute bottom-4 left-5 z-20 pointer-events-none select-none text-white/90 font-mono text-sm tracking-wider lowercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold"
                  >
                    kindle
                  </div>

                  {/* Subtle light sweep across image once on render */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl mix-blend-overlay">
                    <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-20 animate-light-sweep" />
                  </div>
                </div>

                {/* Floating minimal toolbar on hover */}
                <CanvasToolbar
                  image={currentImage}
                  onRegenerate={handleGenerate}
                  onOpenFullscreen={() => onOpenFullscreen(currentImage)}
                />
              </motion.div>
            ) : (
              /* Idle Empty State */
              <div className="p-8 text-center text-zinc-500">
                <Wand2 className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                <p className="text-sm font-medium text-zinc-400">Your Canvas is Ready</p>
                <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
                  Type an idea on the left and tap Generate to create with KINNDLE.
                </p>
              </div>
            )}
          </div>

          {/* Active Canvas Metadata Footer */}
          {currentImage && (
            <div className="w-full mt-3 px-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span className="truncate max-w-[240px] text-zinc-400">
                "{currentImage.prompt}"
              </span>
              <div className="flex items-center gap-2">
                <span>{currentImage.aspectRatio}</span>
                <span>·</span>
                <span>{currentImage.style}</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: Settings or History ================= */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-5 border border-white/10 shadow-lg">
          {rightTab === 'settings' && config && (
            <SettingsDrawer
              aspectRatios={config.aspectRatios}
              selectedAspect={selectedAspect}
              onSelectAspect={setSelectedAspect}
              styles={config.styles}
              selectedStyle={selectedStyle}
              onSelectStyle={setSelectedStyle}
              qualityPresets={config.qualityPresets}
              selectedQuality={selectedQuality}
              onSelectQuality={setSelectedQuality}
              creativity={creativity}
              onCreativityChange={setCreativity}
              guidance={guidance}
              onGuidanceChange={setGuidance}
              imageTypes={config.imageTypes}
              selectedImageType={selectedImageType}
              onSelectImageType={setSelectedImageType}
            />
          )}

          {rightTab === 'history' && (
            <HistoryDrawer
              history={history}
              onSelectImage={onOpenFullscreen}
              onReusePrompt={handleReuseFromHistory}
              onClearHistory={() => setHistory([])}
            />
          )}
        </div>
      </div>
    </section>
  );
};
