'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';

interface TemplateItemProps {
  title: string;
  desc: string;
  icon: LucideIcon;
  onClick?: () => void;
  nodeType?: string;
}

export function TemplateItem({ title, desc, icon: Icon, onClick, nodeType }: TemplateItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (nodeType) {
      e.dataTransfer.setData('nodeType', nodeType);
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  return (
    <div 
      draggable={!!nodeType}
      onDragStart={handleDragStart}
      onClick={onClick}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 cursor-pointer select-none active:scale-[0.99] transition-all group"
    >
      <div className="w-9 h-9 rounded-lg bg-[#2a2a2a] flex items-center justify-center border border-white/5 shrink-0 group-hover:border-white/10">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-white truncate">{title}</span>
        <span className="text-[10px] text-on-surface-variant mt-0.5 truncate leading-none">{desc}</span>
      </div>
    </div>
  );
}
