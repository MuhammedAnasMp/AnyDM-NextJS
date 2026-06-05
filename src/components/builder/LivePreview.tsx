'use client';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { motion } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { serializeFlowToDatabase } from '@/lib/flowParser';

export function LivePreview({ onClose }: { onClose: () => void }) {
  const flow = useSelector((state: RootState) => state.flow);
  
  return (
    <motion.div 
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className="absolute top-4 right-6 bottom-4 w-[340px] bg-[#1a1a1a] border border-white/10 flex flex-col rounded-2xl shadow-2xl z-30"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 px-5">
        <h3 className="text-base font-bold text-white tracking-tight">Flow Preview</h3>
        <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Phone Mockup Area */}
      <div className="flex-1 px-5 pb-5 flex flex-col min-h-0">
        <div className="flex-1 w-full bg-[#000000] rounded-[2rem] border-[6px] border-[#252525] relative overflow-hidden flex flex-col shadow-inner">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#252525] rounded-b-2xl z-20" />
          
          {/* Instagram Header */}
          <div className="flex justify-between items-center text-white px-4 pt-8 pb-3 z-10 w-full relative">
             <span className="font-semibold text-sm">Instagram</span>
             <Camera className="h-5 w-5" />
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-5">
            {/* Mock User Flow */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="bg-[#262626] text-white text-[13px] px-3 py-2 rounded-2xl rounded-tr-sm self-end max-w-[85%] border border-white/5">
                How much is the summer bundle? link please! 🔥
              </div>
              <div className="flex items-center gap-2 self-end">
                <span className="text-[12px] bg-[#262626] text-white px-3 py-1.5 rounded-full border border-white/5">Check your DMs!</span>
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-500 overflow-hidden border border-white/10 shrink-0">
                  <div className="w-full h-full bg-black mix-blend-overlay opacity-30" />
                </div>
              </div>
            </div>

            {/* AI Reply Card Mock */}
            <div className="mt-8">
              <div className="bg-white rounded-xl p-3 flex gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-black leading-tight">Elena Rossi</span>
                  <span className="text-[12px] text-gray-500 leading-tight mt-0.5 line-clamp-2">Hey! Summer Launch is $49.99...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Action Area */}
      <div className="p-5 pt-0 mt-auto">
        <div className="flex items-center gap-2 mb-3 px-1 text-on-surface-variant">
           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
           <span className="text-[10px] font-bold uppercase tracking-widest">AI Performance</span>
        </div>
        <button 
          className="w-full py-3.5 rounded-xl bg-surface-container-highest border border-white/5 text-white font-semibold text-sm hover:bg-[#393939] transition-colors cursor-pointer"
          onClick={() => {
             const payload = serializeFlowToDatabase(flow);
             console.log(payload);
          }}
        >
          Test End-to-End
        </button>
      </div>
    </motion.div>
  );
}
