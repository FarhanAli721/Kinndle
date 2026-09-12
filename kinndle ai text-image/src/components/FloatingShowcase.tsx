import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SHOWCASE_ARTWORKS } from '../data/showcase';
import { ExploreArtwork } from '../types';
import { Sparkles, Wand2 } from 'lucide-react';

interface FloatingShowcaseProps {
  onSelectArtwork: (artwork: ExploreArtwork) => void;
  onRemixInStudio: (prompt: string, style: string) => void;
}

export const FloatingShowcase: React.FC<FloatingShowcaseProps> = ({
  onSelectArtwork,
  onRemixInStudio,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const featured = SHOWCASE_ARTWORKS.slice(0, 6);

  return (
    <section className="relative py-12 px-4 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>Curated Universe</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
          Visualized with KINNDLE
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-2">
          Every artwork is rendered from natural language concepts enhanced by the KINNDLE Art Direction model.
        </p>
      </div>

      {/* Floating 3D Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 perspective-1000">
        {featured.map((art, index) => {
          // Floating variation based on index
          const floatDelay = index * 0.4;
          const rotateAngle = (index % 2 === 0 ? 1 : -1) * (1.2 + (index % 3) * 0.4);

          return (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: floatDelay, ease: [0.16, 1, 0.3, 1] }}
              style={{
                transform: `rotate(${rotateAngle}deg) translate3d(${mousePos.x * (0.3 + index * 0.1)}px, ${mousePos.y * (0.3 + index * 0.1)}px, 0)`,
              }}
              className="group relative rounded-3xl overflow-hidden glass-panel border border-white/10 hover:border-white/25 transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.08)] cursor-pointer"
              onClick={() => onSelectArtwork(art)}
              data-cursor="image"
            >
              {/* Image Aspect Box */}
              <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-zinc-950">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-wide bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                    {art.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/10 text-zinc-400">
                    {art.aspectRatio}
                  </span>
                </div>

                {/* Bottom details overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col justify-end">
                  <h3 className="font-display font-semibold text-white text-base tracking-wide mb-1">
                    {art.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3 font-light">
                    "{art.prompt}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      By {art.author}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemixInStudio(art.prompt, art.style);
                      }}
                      className="px-3 py-1.5 rounded-full bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-200 transition-colors shadow-sm"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Remix in Studio</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
