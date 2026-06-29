'use client';

import * as React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import SimulationWalkthrough from './SimulationWalkthrough';

export function LivePreview({ onClose }: { onClose: () => void }) {
  const dragControls = useDragControls();
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [width, setWidth] = React.useState(330);
  const [isMounted, setIsMounted] = React.useState(false);

  const resizeRef = React.useRef<{ startX: number; startWidth: number; isResizing: boolean }>({
    startX: 0,
    startWidth: 0,
    isResizing: false
  });

  const calculateCardHeight = (w: number) => {
    const phoneW = w - 32; // subtracting horizontal padding px-4 (32px)
    const phoneH = Math.round(phoneW * (19.5 / 9)); // exactly 19.5:9 ratio
    const controlsH = Math.round(42 * ((w - 32) / 298)); // scaled controls space height
    return phoneH + controlsH + 53 + 32; // phone + controls + header (53px) + vertical padding py-4 (32px)
  };

  React.useEffect(() => {
    const savedWidth = localStorage.getItem("livePreviewWidth");
    if (savedWidth) {
      const w = parseInt(savedWidth, 10);
      if (!isNaN(w) && w >= 260 && w <= 500) {
        setWidth(w);
      }
    }
    setIsMounted(true);
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    setPosition(prev => ({
      x: prev.x + info.offset.x,
      y: prev.y + info.offset.y
    }));
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setWidth(330);
    localStorage.setItem("livePreviewWidth", "330");
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    resizeRef.current = {
      startX: e.clientX,
      startWidth: width,
      isResizing: true
    };
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizeRef.current.isResizing) return;
    e.stopPropagation();
    
    const deltaX = e.clientX - resizeRef.current.startX;
    let newWidth = resizeRef.current.startWidth + deltaX;
    newWidth = Math.min(Math.max(260, newWidth), 500); // lock between 260px and 500px wide
    setWidth(newWidth);
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    if (resizeRef.current.isResizing) {
      e.stopPropagation();
      e.currentTarget.releasePointerCapture(e.pointerId);
      resizeRef.current.isResizing = false;
      localStorage.setItem("livePreviewWidth", String(width));
    }
  };

  if (!isMounted) {
    return null; // Prevent SSR mismatch
  }

  const height = calculateCardHeight(width);

  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ x: position.x, y: position.y, opacity: 0 }}
      animate={{ x: position.x, y: position.y, opacity: 1 }}
      exit={{ opacity: 0 }}
      onDragEnd={handleDragEnd}
      style={{ width, height }}
      className="absolute top-4 right-6 bg-[#1a1a1a] border border-white/10 flex flex-col rounded-2xl shadow-2xl z-30 select-none overflow-hidden touch-none"
    >
      {/* Header (acts as drag handle) */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between p-4 px-5 shrink-0 border-b border-white/5 bg-[#161616] rounded-t-2xl cursor-grab active:cursor-grabbing select-none"
      >
        <h3 className="text-xs font-bold text-white tracking-wider uppercase select-none pointer-events-none">Live Path Walkthrough</h3>
        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          <button 
            type="button"
            onClick={handleReset} 
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-white/5"
            title="Reset Position & Size"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={onClose} 
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-white/5"
            title="Close Preview"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
      
      {/* Phone Mockup Area */}
      <div className="flex-1 px-4 py-4 flex flex-col min-h-0 relative overflow-hidden">
        <div 
          style={{
            width: '298px',
            height: '688px', // phone height 646px + controls space 42px
            transform: `scale(${(width - 32) / 298})`,
            transformOrigin: 'top left',
          }}
          className="shrink-0"
        >
          <SimulationWalkthrough onStepChange={() => {}} />
        </div>
      </div>

      {/* Resize Handle at Bottom-Right */}
      <div 
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        className="absolute bottom-0.5 right-0.5 w-6 h-6 cursor-se-resize z-50 flex items-center justify-center select-none active:scale-95 transition-transform"
        title="Drag to Resize (Preserves iPhone Aspect Ratio)"
      >
        <svg className="w-3.5 h-3.5 text-zinc-500 hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="6" y1="21" x2="21" y2="6" />
          <line x1="12" y1="21" x2="21" y2="12" />
          <line x1="18" y1="21" x2="21" y2="18" />
        </svg>
      </div>
    </motion.div>
  );
}
