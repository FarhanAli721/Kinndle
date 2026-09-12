import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

interface StorySectionProps {
  onStartCreating: () => void;
}

export const StorySection: React.FC<StorySectionProps> = ({ onStartCreating }) => {
  return (
    <section id="story-section" className="py-28 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      {/* Decorative Brand Logo & Spark */}
      <div className="flex flex-col items-center justify-center gap-4 mb-6">
        <Logo size="lg" withGlow />
        <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>The Philosophy</span>
        </div>
      </div>

      {/* Large Editorial Headline */}
      <div className="space-y-6 sm:space-y-8 select-none">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-zinc-400 tracking-tight leading-tight"
        >
          Your imagination has <span className="text-white font-serif italic">no interface</span>.
        </motion.h2>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-white to-zinc-400 tracking-tight leading-none"
        >
          So we built one.
        </motion.h2>
      </div>

      {/* Editorial Narrative */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mt-12 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 font-light leading-relaxed space-y-4"
      >
        <p>
          Generative tools often forced creators to act like software programmers—memorizing comma-separated tags, technical weights, and model flags.
        </p>
        <p className="text-zinc-300">
          KINNDLE inverts this relationship. Our agent reads your imagination, reasons about lighting, materials, and composition as an art director would, and manifests the visual without compromise.
        </p>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12"
      >
        <button
          onClick={onStartCreating}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-bold text-sm sm:text-base text-zinc-950 bg-white hover:bg-zinc-200 transition-all shadow-[0_0_35px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] active:scale-95"
        >
          <span>Create Something Extraordinary</span>
          <ArrowRight className="w-4 h-4 text-zinc-950" />
        </button>
      </motion.div>
    </section>
  );
};
