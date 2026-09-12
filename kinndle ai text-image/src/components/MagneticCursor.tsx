import React, { useEffect, useState } from 'react';

export const MagneticCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'image' | 'prompt'>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-cursor="prompt"]')) {
        setCursorType('prompt');
      } else if (target.closest('[data-cursor="image"]') || target.closest('img')) {
        setCursorType('image');
      } else if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer')
      ) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      {cursorType === 'default' && (
        <div className="-translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white/70 backdrop-blur-sm shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
      )}

      {cursorType === 'pointer' && (
        <div className="-translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-white/50 bg-white/10 backdrop-blur-md transition-all duration-200 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      )}

      {cursorType === 'image' && (
        <div className="-translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/30 backdrop-blur-md shadow-2xl transition-all duration-200">
          <span className="text-[10px] uppercase font-semibold tracking-widest text-zinc-100 font-display">
            View
          </span>
        </div>
      )}

      {cursorType === 'prompt' && (
        <div className="-translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-white/90 border border-white backdrop-blur-md shadow-2xl transition-all duration-200">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-950 font-display">
            Create
          </span>
        </div>
      )}
    </div>
  );
};
