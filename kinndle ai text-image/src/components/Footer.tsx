import React from 'react';
import { Sparkles, Wand2, Shield, Heart } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onSelectTab: (tab: 'studio' | 'explore' | 'features' | 'story') => void;
  onOpenStudio: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenStudio }) => {
  return (
    <footer className="border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand info */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Logo size="sm" withGlow />
            <span className="font-display text-lg font-bold text-white tracking-wider">
              KINNDLE
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-light">
            Imagine it. Create it. · Built on real autonomous AI agent architecture.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
          <button
            onClick={() => onSelectTab('studio')}
            className="hover:text-white transition-colors"
          >
            Studio
          </button>
          <button
            onClick={() => onSelectTab('explore')}
            className="hover:text-white transition-colors"
          >
            Explore
          </button>
          <button
            onClick={() => onSelectTab('features')}
            className="hover:text-white transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => onSelectTab('story')}
            className="hover:text-white transition-colors"
          >
            Story
          </button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-zinc-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Agent Online</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-300">Kinndle v2.4</span>
        </div>
      </div>
    </footer>
  );
};
