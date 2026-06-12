'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addNode, selectNode, setFlow } from '@/store/slices/flowSlice';
import { CanvasNode, CanvasEdges } from './CanvasNode';
import { NodeType, FlowState } from '@/lib/types';
import { Xwrapper, useXarrow } from 'react-xarrows';
import { CanvasContext } from './CanvasContext';
import { Minus, Plus } from 'lucide-react';

// Initial dummy data matching the screenshot
const screenshotFlow: FlowState = {
  id: 'f1',
  name: 'Price Inquiry',
  selectedNodeId: null,
  nodes: [
    {
      id: 'n_trigger',
      type: 'trigger',
      position: { x: 100, y: 150 },
      data: {}
    },
    {
      id: 'n_filter',
      type: 'condition',
      position: { x: 450, y: 150 },
      data: {}
    },
    {
      id: 'n_action1',
      type: 'action',
      position: { x: 900, y: 80 },
      data: { isPrimary: false, action_label: "ACTION 1", is_placeholder: true }
    },
    {
      id: 'n_action2',
      type: 'action',
      position: { x: 900, y: 280 },
      data: { isPrimary: true, action_label: "PRIMARY ACTION", is_placeholder: true }
    }
  ],
  edges: [
    { id: 'e1', source: 'n_trigger', target: 'n_filter' },
    { id: 'e2', source: 'n_filter', target: 'n_action1' },
    { id: 'e3', source: 'n_filter', target: 'n_action2' }
  ]
};

function XarrowUpdater({ trigger }: { trigger: any }) {
  const updateXarrow = useXarrow();
  React.useEffect(() => {
    updateXarrow();
    
    const handleCustomUpdate = () => updateXarrow();
    window.addEventListener('update-xarrow', handleCustomUpdate);
    return () => window.removeEventListener('update-xarrow', handleCustomUpdate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
}

export function Canvas() {
  const dispatch = useDispatch();
  const flow = useSelector((state: RootState) => state.flow);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [scale, setScale] = React.useState(1);
  const [isPanning, setIsPanning] = React.useState(false);
  
  // Initialize with sample items if empty
  React.useEffect(() => {
    if (flow.nodes.length === 0) {
      dispatch(setFlow(screenshotFlow));
    }
  }, [dispatch, flow.nodes.length]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      let newScale = scale + delta;
      newScale = Math.min(Math.max(0.2, newScale), 2);
      
      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      
      const ratio = 1 - newScale / scale;
      
      const newX = pan.x + (cursorX - pan.x) * ratio;
      const newY = pan.y + (cursorY - pan.y) * ratio;
      
      setPan({ x: newX, y: newY });
      setScale(newScale);
      
      if (flow.selectedNodeId) {
        dispatch(selectNode(null));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [pan, scale, dispatch, flow.selectedNodeId]);

  const zoomToScale = (newScale: number) => {
    const targetScale = Math.min(Math.max(0.2, newScale), 2);
    const container = containerRef.current;
    if (!container) {
      setScale(targetScale);
      return;
    }

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const ratio = 1 - targetScale / scale;

    const newX = pan.x + (centerX - pan.x) * ratio;
    const newY = pan.y + (centerY - pan.y) * ratio;

    setPan({ x: newX, y: newY });
    setScale(targetScale);

    if (flow.selectedNodeId) {
      dispatch(selectNode(null));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.target as HTMLElement).classList.contains('canvas-container'))) {
      setIsPanning(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as NodeType;
    if (!type) return;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale - 128;
      const y = (e.clientY - rect.top - pan.y) / scale - 40;
      
      dispatch(addNode({ type, position: { x, y } }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <CanvasContext.Provider value={{ pan, scale }}>
      <div 
        className="canvas-container flex-1 relative overflow-hidden bg-[#131313] select-none"
        ref={containerRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => dispatch(selectNode(null))}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px)',
            backgroundSize: `${24 * scale}px ${24 * scale}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />
        <Xwrapper>
          <XarrowUpdater trigger={`${pan.x}-${pan.y}-${scale}`} />
          {flow.nodes.map(node => (
            <CanvasNode key={node.id} id={node.id} />
          ))}
          <CanvasEdges />
        </Xwrapper>

        {/* Zoom Controls Overlay */}
        <div 
          className="absolute bottom-6 left-6 z-30 flex items-center gap-3 bg-[#161622]/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={() => zoomToScale(scale - 0.1)}
            disabled={scale <= 0.2}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all shrink-0"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Zoom Slider */}
          <div className="flex items-center">
            <input
              type="range"
              min="0.2"
              max="2"
              step="0.05"
              value={scale}
              onChange={(e) => zoomToScale(parseFloat(e.target.value))}
              className="w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-200 transition-all"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${((scale - 0.2) / 1.8) * 100}%, #27272a ${((scale - 0.2) / 1.8) * 100}%, #27272a 100%)`
              }}
            />
          </div>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={() => zoomToScale(scale + 0.1)}
            disabled={scale >= 2}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all shrink-0"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-white/10 mx-1 shrink-0" />

          {/* Reset / Zoom Level Button */}
          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
              if (flow.selectedNodeId) {
                dispatch(selectNode(null));
              }
            }}
            className="px-2 py-1 rounded-lg text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 active:bg-white/10 cursor-pointer transition-all shrink-0 font-mono"
            title="Reset Zoom & Pan"
          >
            {Math.round(scale * 100)}%
          </button>
        </div>
      </div>
    </CanvasContext.Provider>
  );
}
