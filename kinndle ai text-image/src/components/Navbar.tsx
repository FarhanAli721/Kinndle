import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight, Wand2, Compass, Layers, Info } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  activeTab: 'studio' | 'explore' | 'features' | 'story';
  onSelectTab: (tab: 'studio' | 'explore' | 'features' | 'story') => void;
  onOpenStudio: () => void;
  agentModel?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenStudio,
  agentModel = 'gpt-5.6-terra',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'studio', label: 'Create', icon: Wand2 },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'features', label: 'Features', icon: Layers },
    { id: 'story', label: 'Story', icon: Info },
  ] as const;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav
            className={`mx-auto flex items-center justify-between rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 ${
              isScrolled
                ? 'bg-zinc-950/75 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl'
                : 'bg-zinc-900/40 border border-white/5 backdrop-blur-md'
            }`}
          >
            {/* Brand Logo */}
            <button
              onClick={() => onSelectTab('studio')}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <Logo size="sm" withGlow />

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base sm:text-lg font-bold tracking-wider text-white">
                    KINNDLE
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-white/[0.06] text-zinc-300 border border-white/10 font-mono">
                    AI AGENT
                  </span>
                </div>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 bg-zinc-950/40 p-1 rounded-full border border-white/[0.06]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'text-white bg-white/10 shadow-sm border border-white/10'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Action CTA */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Agent</span>
              </div>

              <button
                onClick={onOpenStudio}
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-100 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-95"
              >
                <span>Start Creating</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-950 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Full-Screen Glass Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#050508]/95 backdrop-blur-2xl md:hidden flex flex-col justify-between p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" withGlow />
              <span className="font-display text-lg font-bold text-white tracking-wider">
                KINNDLE
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 my-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl text-left font-display text-lg transition-all ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-zinc-400 hover:text-white bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-zinc-300" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </button>
              );
            })}
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
              <span>Agent Integration</span>
              <span className="text-emerald-400 font-semibold">Live ({agentModel})</span>
            </div>
            <button
              onClick={() => {
                onOpenStudio();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3.5 rounded-xl font-display font-bold text-sm text-zinc-950 bg-white flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Studio</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
