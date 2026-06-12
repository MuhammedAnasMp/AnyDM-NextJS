'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { cn } from '@/lib/utils';

export const getCategoryForTemplate = (templateId: string | null): string | null => {
  if (!templateId) return null;
  const commentTemplates = ['1', '2', '9', '18'];
  const dmTemplates = ['4', '7'];
  const storyTemplates = ['5'];
  const ecommerceTemplates = ['3', '6', '8', '19'];
  const gamificationTemplates = ['10', '11', '12', '13', '14', '15', '16', '17', '20'];

  if (commentTemplates.includes(templateId)) return 'user_comment';
  if (dmTemplates.includes(templateId)) return 'user_dm';
  if (storyTemplates.includes(templateId)) return 'user_reply_story';
  if (ecommerceTemplates.includes(templateId)) return 'ecommerce';
  if (gamificationTemplates.includes(templateId)) return 'gamification';
  return null;
};

const categoryColors: Record<string, { border: string, bg: string, text: string, shadow: string }> = {
  user_comment: {
    border: 'border-[#8FE3FF]/40',
    bg: 'bg-[#8FE3FF]/10',
    text: 'text-[#8FE3FF]',
    shadow: 'shadow-[0_0_15px_rgba(143,227,255,0.15)]'
  },
  user_dm: {
    border: 'border-[#C084FC]/40',
    bg: 'bg-[#C084FC]/10',
    text: 'text-[#C084FC]',
    shadow: 'shadow-[0_0_15px_rgba(192,132,252,0.15)]'
  },
  user_reply_story: {
    border: 'border-[#F472B6]/40',
    bg: 'bg-[#F472B6]/10',
    text: 'text-[#F472B6]',
    shadow: 'shadow-[0_0_15px_rgba(244,114,182,0.15)]'
  },
  ecommerce: {
    border: 'border-[#34D399]/40',
    bg: 'bg-[#34D399]/10',
    text: 'text-[#34D399]',
    shadow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]'
  },
  gamification: {
    border: 'border-[#FAC775]/40',
    bg: 'bg-[#FAC775]/10',
    text: 'text-[#FAC775]',
    shadow: 'shadow-[0_0_15px_rgba(250,199,117,0.15)]'
  }
};

interface TemplateItemProps {
  title: string;
  desc: string;
  icon: LucideIcon;
  onClick?: () => void;
  nodeType?: string;
  templateId?: string;
}

export function TemplateItem({ title, desc, icon: Icon, onClick, nodeType, templateId }: TemplateItemProps) {
  const selectedTemplateId = useSelector((state: RootState) => state.flow.nodes.find(n => n.templateId)?.templateId || null);
  const isSelected = templateId !== undefined && selectedTemplateId === templateId;

  const categoryId = getCategoryForTemplate(templateId || null);
  const colors = categoryId ? categoryColors[categoryId] : null;

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
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none active:scale-[0.99] transition-all group",
        isSelected && colors
          ? cn(colors.border, colors.bg, colors.shadow)
          : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-300",
        isSelected && colors
          ? cn("bg-transparent", colors.border)
          : "bg-[#2a2a2a] border-white/5 group-hover:border-white/10"
      )}>
        <Icon className={cn("w-5 h-5 transition-colors duration-300", isSelected && colors ? colors.text : "text-white")} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-white truncate">{title}</span>
        <span className="text-[10px] text-on-surface-variant mt-0.5 truncate leading-none">{desc}</span>
      </div>
    </div>
  );
}

