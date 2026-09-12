import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowDown, Wand2, ShieldCheck, Flame } from 'lucide-react';
import { Logo } from './Logo';

interface HeroSectionProps {
  onStartCreating: () => void;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartCreating, onExplore }) => {
  const headline = 'Imagine it. Create it.';
  const letters = Array.from(headline);

  // Magnetic button state
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.28;
    const deltaY = (e.clientY - centerY) * 0.28;
    setBtnOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
  };

  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center overflow-hidden">
      {/* Subtle radial ambient spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-gradient-to-b from-white/[0.04] via-zinc-800/[0.03] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-zinc-300 font-mono tracking-wide mb-8 backdrop-blur-md shadow-lg"
      >
        <Logo size="xs" withGlow />
        <span className="text-white font-semibold">KINNDLE</span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-300">Creative Visual Agent</span>
      </motion.div>

      {/* Main Headline character by character */}
      <div className="relative mb-6">
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white select-none">
          {letters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 35, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.7,
                delay: 0.2 + index * 0.035,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>

        {/* Ambient Light Sweep passing across the headline */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-25 animate-light-sweep" />
        </div>
      </div>

      {/* Subtitle fading upward */}
      <motion.p
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
        className="text-base sm:text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed mb-10"
      >
        Turn your imagination into extraordinary images.
        <span className="block text-sm sm:text-base text-zinc-500 mt-2 font-normal">
          Zero prompt engineering required. An intelligent Art Director that understands Hindi, Hinglish, casual notes, and creative briefs.
        </span>
      </motion.p>

      {/* Primary and Secondary CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 justify-center w-full max-w-md"
      >
        {/* Magnetic Start Creating CTA */}
        <button
          ref={buttonRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={onStartCreating}
          style={{
            transform: `translate3d(${btnOffset.x}px, ${btnOffset.y}px, 0)`,
          }}
          className="group relative w-full sm:w-auto px-8 py-4 rounded-full font-display font-semibold text-sm sm:text-base text-zinc-950 bg-white hover:bg-zinc-100 transition-all duration-200 shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
        >
          <Wand2 className="w-4 h-4 text-zinc-950 transition-transform group-hover:rotate-12" />
          <span>Start Creating</span>
          <div className="absolute inset-0 rounded-full border border-white/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Secondary Explore CTA */}
        <button
          onClick={onExplore}
          className="w-full sm:w-auto px-6 py-4 rounded-full font-display font-medium text-sm sm:text-base text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all backdrop-blur-md active:scale-95"
        >
          Explore Showcase
        </button>
      </motion.div>

      {/* Value pillars minimal row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-500 font-mono"
      >
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-zinc-400" />
          <span>Real Agent Reasoning</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block" />
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>Multi-modal Reference Synthesis</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block" />
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Production Studio Fidelity</span>
        </div>
      </motion.div>

      {/* Down indicator */}
      <motion.button
        onClick={onStartCreating}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6, y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        className="mt-12 text-zinc-500 hover:text-zinc-300 transition-colors p-2"
        aria-label="Scroll down to studio"
      >
        <ArrowDown className="w-5 h-5" />
      </motion.button>
    </section>
  );
};
