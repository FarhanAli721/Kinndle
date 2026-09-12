import React from 'react';
import { AspectRatioOption, StyleOption, QualityPreset } from '../../types';
import { Sliders, Monitor, Smartphone, Square, Image as ImageIcon, Camera, Check } from 'lucide-react';

interface SettingsDrawerProps {
  aspectRatios: AspectRatioOption[];
  selectedAspect: string;
  onSelectAspect: (aspect: string) => void;

  styles: StyleOption[];
  selectedStyle: string;
  onSelectStyle: (style: string) => void;

  qualityPresets: QualityPreset[];
  selectedQuality: string;
  onSelectQuality: (quality: string) => void;

  creativity: number;
  onCreativityChange: (val: number) => void;

  guidance: number;
  onGuidanceChange: (val: number) => void;

  imageTypes: string[];
  selectedImageType: string;
  onSelectImageType: (type: string) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  aspectRatios,
  selectedAspect,
  onSelectAspect,
  styles,
  selectedStyle,
  onSelectStyle,
  qualityPresets,
  selectedQuality,
  onSelectQuality,
  creativity,
  onCreativityChange,
  guidance,
  onGuidanceChange,
  imageTypes,
  selectedImageType,
  onSelectImageType,
}) => {
  const getAspectIcon = (ratio: string) => {
    switch (ratio) {
      case '16:9':
        return <Monitor className="w-3.5 h-3.5" />;
      case '9:16':
        return <Smartphone className="w-3.5 h-3.5" />;
      case '1:1':
        return <Square className="w-3.5 h-3.5" />;
      default:
        return <Camera className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Aspect Ratio Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-zinc-300 font-display uppercase tracking-wider">
            Aspect Ratio
          </label>
          <span className="text-[11px] font-mono text-zinc-400">
            {selectedAspect}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {aspectRatios.map((item) => {
            const isSelected = selectedAspect === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectAspect(item.id)}
                className={`group relative p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                  isSelected
                    ? 'bg-white/15 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-[1.02]'
                    : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
              >
                <div className="text-zinc-400 group-hover:text-white transition-colors">
                  {getAspectIcon(item.id)}
                </div>
                <span className="text-[10px] font-mono font-medium">{item.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-zinc-300 font-display uppercase tracking-wider">
            Visual Style
          </label>
          <span className="text-[11px] font-mono text-zinc-400 capitalize">
            {selectedStyle}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {styles.map((s) => {
            const isSelected = selectedStyle === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStyle(s.id)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white/15 border-white text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                }`}
              >
                <span className="text-xs font-semibold block">{s.label}</span>
                <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5 font-light">
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category / Image Type */}
      <div>
        <label className="text-xs font-semibold text-zinc-300 font-display uppercase tracking-wider block mb-2">
          Creative Category
        </label>
        <select
          value={selectedImageType}
          onChange={(e) => onSelectImageType(e.target.value)}
          className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-white/30"
        >
          {imageTypes.map((t) => (
            <option key={t} value={t} className="bg-zinc-900 text-zinc-200">
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Quality Presets */}
      <div>
        <label className="text-xs font-semibold text-zinc-300 font-display uppercase tracking-wider block mb-3">
          Render Quality
        </label>
        <div className="space-y-2">
          {qualityPresets.map((q) => {
            const isSelected = selectedQuality === q.id;
            return (
              <button
                key={q.id}
                onClick={() => onSelectQuality(q.id)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-white/15 border-white text-white'
                    : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{q.label}</div>
                  <div className="text-[10px] text-zinc-500">{q.detail}</div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders for Creativity & Guidance */}
      <div className="space-y-4 pt-2 border-t border-white/10">
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-mono">
            <span className="text-zinc-400">Creativity (Temp)</span>
            <span className="text-zinc-200">{creativity.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.2"
            step="0.1"
            value={creativity}
            onChange={(e) => onCreativityChange(parseFloat(e.target.value))}
            className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-mono">
            <span className="text-zinc-400">Prompt Guidance</span>
            <span className="text-zinc-200">{guidance.toFixed(0)}</span>
          </div>
          <input
            type="range"
            min="4"
            max="14"
            step="1"
            value={guidance}
            onChange={(e) => onGuidanceChange(parseInt(e.target.value))}
            className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
