import React, { useState, useRef } from 'react';
import { ParticleField } from './components/ParticleField';
import { MagneticCursor } from './components/MagneticCursor';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FloatingShowcase } from './components/FloatingShowcase';
import { CreateStudio } from './components/studio/CreateStudio';
import { ExploreSection } from './components/ExploreSection';
import { FeatureSection } from './components/FeatureSection';
import { StorySection } from './components/StorySection';
import { Footer } from './components/Footer';
import { CinematicModal } from './components/CinematicModal';
import { GeneratedImageItem, ExploreArtwork } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'explore' | 'features' | 'story'>('studio');

  // Studio initial states when remixing from explore or showcase
  const [studioPrompt, setStudioPrompt] = useState<string>('');
  const [studioStyle, setStudioStyle] = useState<string>('cinematic');
  const [studioReferenceImage, setStudioReferenceImage] = useState<string | null>(null);

  // Fullscreen modal state
  const [activeModalItem, setActiveModalItem] = useState<GeneratedImageItem | ExploreArtwork | null>(null);

  const studioRef = useRef<HTMLDivElement | null>(null);
  const exploreRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const storyRef = useRef<HTMLDivElement | null>(null);

  const scrollToStudio = () => {
    setActiveTab('studio');
    studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToExplore = () => {
    setActiveTab('explore');
    exploreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectTab = (tab: 'studio' | 'explore' | 'features' | 'story') => {
    setActiveTab(tab);
    if (tab === 'studio') {
      studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'explore') {
      exploreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'features') {
      featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'story') {
      storyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRemixInStudio = (prompt: string, style: string) => {
    setStudioPrompt(prompt);
    setStudioStyle(style.toLowerCase());
    scrollToStudio();
  };

  const handleUseImageWithImage = (imageUrl: string, prompt?: string, style?: string) => {
    setStudioReferenceImage(imageUrl);
    if (prompt) setStudioPrompt(prompt);
    if (style) setStudioStyle(style.toLowerCase());
    scrollToStudio();
  };

  return (
    <div className="relative min-h-screen bg-[#050508] text-zinc-100 selection:bg-white selection:text-black overflow-x-hidden font-sans">
      {/* Interactive Ambient Particle & Light Field */}
      <ParticleField />

      {/* Desktop Magnetic Custom Cursor */}
      <MagneticCursor />

      {/* Floating Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenStudio={scrollToStudio}
      />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* Cinematic Hero */}
        <HeroSection
          onStartCreating={scrollToStudio}
          onExplore={scrollToExplore}
        />

        {/* Floating 3D Showcase */}
        <FloatingShowcase
          onSelectArtwork={(art) => setActiveModalItem(art)}
          onRemixInStudio={handleRemixInStudio}
        />

        {/* Master Creation Studio Section */}
        <div ref={studioRef} className="pt-8">
          <CreateStudio
            initialPrompt={studioPrompt}
            initialStyle={studioStyle}
            initialReferenceImage={studioReferenceImage}
            onOpenFullscreen={(item) => setActiveModalItem(item)}
          />
        </div>

        {/* Explore / Gallery Section */}
        <div ref={exploreRef} className="pt-12">
          <ExploreSection
            onSelectArtwork={(art) => setActiveModalItem(art)}
            onRemixInStudio={handleRemixInStudio}
          />
        </div>

        {/* How It Works & Interactive Demos */}
        <div ref={featuresRef} className="pt-12">
          <FeatureSection />
        </div>

        {/* Editorial Story / Brand Philosophy */}
        <div ref={storyRef} className="pt-12 pb-20">
          <StorySection onStartCreating={scrollToStudio} />
        </div>
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={handleSelectTab}
        onOpenStudio={scrollToStudio}
      />

      {/* Fullscreen Cinematic Lightbox Modal */}
      <CinematicModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onRemixInStudio={handleRemixInStudio}
        onUseAsReference={handleUseImageWithImage}
      />
    </div>
  );
}
