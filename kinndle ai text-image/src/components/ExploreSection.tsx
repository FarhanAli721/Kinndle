import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SHOWCASE_ARTWORKS } from '../data/showcase';
import { ExploreArtwork } from '../types';
import { Compass, Wand2, Heart, Copy, Check } from 'lucide-react';

interface ExploreSectionProps {
  onSelectArtwork: (art: ExploreArtwork) => void;
  onRemixInStudio: (prompt: string, style: string) => void;
}

const CATEGORIES = [
  'All',
  'Cinematic',
  'Portrait',
  'Fashion',
  'Product',
  'Fantasy',
  'Architecture',
  'Abstract',
] as const;

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  onSelectArtwork,
  onRemixInStudio,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered =
    activeCategory === 'All'
      ? SHOWCASE_ARTWORKS
      : SHOWCASE_ARTWORKS.filter((art) => art.category === activeCategory);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleCopyPrompt = async (art: ExploreArtwork, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(art.enhancedPrompt || art.prompt);
      setCopiedId(art.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="explore-section" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Visual Library</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Explore Imaginations
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-lg font-light">
            Discover prompts and styles crafted by creators using KINNDLE. Tap any creation to view prompt anatomy or remix in the studio.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((art, idx) => {
          const isCopied = copiedId === art.id;
          const currentLikes = (likes[art.id] || 0) + art.likes;

          return (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              onClick={() => onSelectArtwork(art)}
              className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              data-cursor="image"
            >
              {/* Image Box */}
              <div className="relative aspect-[4/5] overflow-hidden bg-zinc-950">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Category & Aspect badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur-md text-zinc-200 border border-white/10">
                    {art.category}
                  </span>
                </div>

                {/* Like Button */}
                <button
                  onClick={(e) => handleLike(art.id, e)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-md text-zinc-300 hover:text-rose-400 transition-colors border border-white/10"
                  title="Like artwork"
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>

                {/* Hover Quick Actions */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => handleCopyPrompt(art, e)}
                    className="px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-zinc-200 hover:text-white border border-white/10 flex items-center gap-1"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied' : 'Prompt'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemixInStudio(art.prompt, art.style);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Remix</span>
                  </button>
                </div>
              </div>

              {/* Title & Author Footer */}
              <div className="p-4 bg-zinc-950/70 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-white text-sm tracking-wide truncate">
                    {art.title}
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {currentLikes} likes
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1 font-light mt-1">
                  "{art.prompt}"
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
