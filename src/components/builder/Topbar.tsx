'use client';

import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { undo, redo, selectNode } from '@/store/slices/flowSlice';
import { Undo, Redo, Settings } from 'lucide-react';

export function Topbar({ onTogglePreview, showPreview }: { onTogglePreview: () => void, showPreview: boolean }) {
  const flow = useSelector((state: RootState) => state.flow);
  const dispatch = useDispatch();

  const canUndo = (flow.past && flow.past.length > 0) || false;
  const canRedo = (flow.future && flow.future.length > 0) || false;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          if (canRedo) {
            dispatch(redo());
          }
        } else {
          e.preventDefault();
          if (canUndo) {
            dispatch(undo());
          }
        }
      } else if (modifier && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) {
          dispatch(redo());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, canUndo, canRedo]);

  return (
    <div className="w-full flex flex-col bg-[#131313] border-b border-white/5 z-10 shrink-0">
      {/* Main Header Row */}
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-tight">{flow.name}</h1>
          <span className="text-sm font-medium text-on-surface-variant italic">Edited just now</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Undo and Redo Buttons */}
          <div className="flex items-center gap-0.5 bg-[#1a1a1a] border border-white/5 rounded-full p-1 mr-2 shadow-inner">
            <button
              onClick={() => dispatch(undo())}
              disabled={!canUndo}
              className={`p-1.5 rounded-full transition-all ${
                canUndo 
                  ? 'text-white hover:bg-white/10 hover:scale-105 active:scale-95' 
                  : 'text-white/25 cursor-not-allowed opacity-40'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(redo())}
              disabled={!canRedo}
              className={`p-1.5 rounded-full transition-all ${
                canRedo 
                  ? 'text-white hover:bg-white/10 hover:scale-105 active:scale-95' 
                  : 'text-white/25 cursor-not-allowed opacity-40'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm font-medium text-on-surface-variant hover:text-white cursor-pointer transition-colors" onClick={onTogglePreview}>
            {showPreview ? "Hide Preview" : "Show Preview"}
          </span>
          <span className="text-sm font-medium text-on-surface-variant hover:text-white cursor-pointer transition-colors">Save Draft</span>
          <button 
            onClick={() => dispatch(selectNode({ id: 'global' }))}
            className="h-10 px-4 rounded-full bg-[#1a1a1a] text-white border border-white/5 font-semibold text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-[#8FE3FF]" />
            Global Settings
          </button>
          <button className="h-10 px-6 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors">
            Set Live
          </button>
        </div>
      </div>
    </div>
  );
}
