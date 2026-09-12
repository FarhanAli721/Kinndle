import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wand2,
  Sparkles,
  Sliders,
  Layers,
  ArrowRight,
  Eye,
  Camera,
  Film,
  Check,
} from 'lucide-react';

export const FeatureSection: React.FC = () => {
  // Demo 1: Interactive prompt expansion
  const [smartPromptActive, setSmartPromptActive] = useState(true);

  // Demo 2: Style switch
  const [activeStyleDemo, setActiveStyleDemo] = useState<'cinematic' | 'fashion' | 'cyberpunk'>('cinematic');

  const styleDemos = {
    cinematic: {
      title: 'Cinematic 35mm',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
      lens: 'Anamorphic 35mm f/1.4',
      light: 'Volumetric Dusk & Rim Light',
    },
    fashion: {
      title: 'Haute Couture Editorial',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
      lens: '85mm Portrait f/1.2',
      light: 'High-Contrast Beauty Dish',
    },
    cyberpunk: {
      title: 'Neon Noir & Rain',
      image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop',
      lens: '50mm Prime f/1.2',
      light: 'Cyan & Magenta Atmospheric Haze',
    },
  };

  return (
    <section id="features-section" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Intelligent Creative Architecture</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          How KINNDLE Works
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 mt-3 leading-relaxed font-light">
          An autonomous creative agent acting as your personal Art Director, Cinematographer, and Master Photographer.
        </p>
      </div>

      {/* FEATURE 1: Smart Prompting Expansion */}
      <div className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xl">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
            <Sparkles className="w-3 h-3" />
            <span>Prompt Enhancement Engine</span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Write naturally. KINNDLE articulates the art.
          </h3>
          <p className="text-sm text-zinc-400 font-light leading-relaxed">
            You don't need to know technical prompts, camera focal lengths, or lighting terminology. Write in plain English, Hinglish, or casual one-liners. KINNDLE structures the 11 essential visual dimensions automatically.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setSmartPromptActive(!smartPromptActive)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all flex items-center gap-2 border border-white/10"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{smartPromptActive ? 'View Raw Input' : 'See KINNDLE Enhancement'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Comparison Card */}
        <div className="relative rounded-2xl bg-zinc-950/80 border border-white/15 p-6 shadow-2xl font-mono text-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <span className="text-[11px] text-zinc-500 uppercase">Interactive Transform</span>
            <span className={`px-2 py-0.5 rounded text-[10px] ${smartPromptActive ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-zinc-300'}`}>
              {smartPromptActive ? 'Enhanced Output' : 'Casual User Input'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {!smartPromptActive ? (
              <motion.div
                key="raw"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="text-zinc-500 text-[10px]">USER CASUAL INPUT:</div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-200 text-sm font-sans font-medium leading-relaxed">
                  "Ek Turkish couple sunset ke time beach pe romantic pose mein"
                </div>
                <p className="text-[11px] text-zinc-500 font-sans">
                  Plain language with intent, emotional mood, and setting.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="enhanced"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="text-emerald-400 text-[10px] flex items-center gap-1.5">
                  <Check className="w-3 h-3" /> KINNDLE ART DIRECTION SPECIFICATION:
                </div>
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-100 text-xs leading-relaxed space-y-1.5 font-light">
                  <p><span className="text-purple-300 font-semibold">[SUBJECT]</span> Stylish Turkish couple, natural emotional chemistry</p>
                  <p><span className="text-purple-300 font-semibold">[LIGHTING]</span> Golden hour rim light, soft Mediterranean glow</p>
                  <p><span className="text-purple-300 font-semibold">[CAMERA]</span> 85mm portrait lens f/1.4, shallow depth of field</p>
                  <p><span className="text-purple-300 font-semibold">[TEXTURES]</span> Authentic skin micro-pores, linen fabric, sea spray</p>
                  <p><span className="text-purple-300 font-semibold">[MOOD]</span> Intimate, cinematic, timeless</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FEATURE 2: Creative Control & Style Switching */}
      <div className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xl">
        <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden border border-white/15 aspect-[16/10] bg-zinc-950">
          <img
            src={styleDemos[activeStyleDemo].image}
            alt={styleDemos[activeStyleDemo].title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-white font-semibold block text-sm">
                {styleDemos[activeStyleDemo].title}
              </span>
              <span className="text-zinc-400 text-[10px]">
                {styleDemos[activeStyleDemo].lens} · {styleDemos[activeStyleDemo].light}
              </span>
            </div>
            <span className="px-2 py-1 rounded bg-white/20 text-white backdrop-blur-md text-[10px]">
              Active Preset
            </span>
          </div>
        </div>

        <div className="order-1 lg:order-2 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
            <Sliders className="w-3 h-3" />
            <span>Precise Style Presets</span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Infinite aesthetic spectrum. Zero guesswork.
          </h3>
          <p className="text-sm text-zinc-400 font-light leading-relaxed">
            Switch effortlessly between editorial fashion, cinematic 35mm film, architectural brutalism, or octane 3D renders without losing subject consistency.
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            {(['cinematic', 'fashion', 'cyberpunk'] as const).map((styleKey) => (
              <button
                key={styleKey}
                onClick={() => setActiveStyleDemo(styleKey)}
                className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all border ${
                  activeStyleDemo === styleKey
                    ? 'bg-white text-zinc-950 border-white font-semibold shadow-md'
                    : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {styleKey}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
