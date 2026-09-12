import React from 'react';
import { GeneratedImageItem } from '../../types';
import { Clock, Wand2, Download, Trash2, Eye } from 'lucide-react';

interface HistoryDrawerProps {
  history: GeneratedImageItem[];
  onSelectImage: (item: GeneratedImageItem) => void;
  onReusePrompt: (item: GeneratedImageItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectImage,
  onReusePrompt,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
        <p className="text-xs font-medium text-zinc-400">No images generated yet</p>
        <p className="text-[11px] text-zinc-600 mt-1 max-w-xs mx-auto">
          Your creations will appear here with full metadata, prompts, and downloads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-400">
          {history.length} {history.length === 1 ? 'Creation' : 'Creations'}
        </span>
        <button
          onClick={onClearHistory}
          className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors font-mono flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectImage(item)}
            className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 bg-zinc-950 transition-all duration-300 aspect-square cursor-pointer shadow-md"
            data-cursor="image"
          >
            <img
              src={item.imageUrl}
              alt={item.prompt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Watermark in left corner in bottom without black background */}
            <div className="absolute bottom-2 left-2 pointer-events-none select-none text-[10px] font-mono font-semibold text-white/90 lowercase z-10 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] group-hover:opacity-0 transition-opacity">
              kindle
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
              <div className="flex justify-end">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 text-zinc-300 backdrop-blur-sm border border-white/10">
                  {item.aspectRatio}
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-white line-clamp-2 font-light leading-tight">
                  {item.prompt}
                </p>
                <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReusePrompt(item);
                    }}
                    className="flex-1 py-1 rounded bg-white/20 hover:bg-white text-zinc-200 hover:text-zinc-950 text-[9px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="Reuse Prompt"
                  >
                    <Wand2 className="w-2.5 h-2.5" />
                    <span>Reuse</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectImage(item);
                    }}
                    className="p-1 rounded bg-white/10 hover:bg-white/30 text-zinc-200 text-[9px]"
                    title="View Fullscreen"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
