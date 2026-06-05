'use client';

import * as React from 'react';
import { MessageSquare, Mail, History, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';

import * as UserComment from './templates/User Comment';
import * as UserDM from './templates/User DM';
import * as UserReplyStory from './templates/User Reply Story';
import * as UserEnquiry from './templates/User Enquiry';

const TEMPLATE_CATEGORIES = [
  {
    id: 'user_comment',
    title: 'User Comment',
    emoji: '💬',
    icon: MessageSquare,
    colorClass: 'text-[#8FE3FF]',
    glowClass: 'border-[#8FE3FF]/40 bg-[#8FE3FF]/5 shadow-[0_0_15px_rgba(143,227,255,0.15)]',
    Components: [
      UserComment.ReplyAndPlainTextDM,
      UserComment.QuickReplyPills,
      UserComment.FollowersOnlyDiscountCode,
      UserComment.ClassicRandomGiveaway,
      UserComment.MostEngagedFanWins,
      UserComment.AIRankedBestComment,
      UserComment.FlashGiveaway,
      UserComment.Top3MultiWinner,
      UserComment.SpinWheelGamification,
      UserComment.WeightedHybridRandom,
      UserComment.TwoHourFlashSale,
      UserComment.CommentMarathon,
    ]
  },
  {
    id: 'user_dm',
    title: 'User DM',
    emoji: '✉️',
    icon: Mail,
    colorClass: 'text-[#C084FC]',
    glowClass: 'border-[#C084FC]/40 bg-[#C084FC]/5 shadow-[0_0_15px_rgba(192,132,252,0.15)]',
    Components: [
      UserDM.ButtonTemplate,
      UserDM.WelcomeAutoReply,
      UserDM.DMCatalogCarousel,
      UserDM.DMEntryPrivateGiveaway,
    ]
  },
  {
    id: 'user_reply_story',
    title: 'User Reply Story',
    emoji: '📸',
    icon: History,
    colorClass: 'text-[#F472B6]',
    glowClass: 'border-[#F472B6]/40 bg-[#F472B6]/5 shadow-[0_0_15px_rgba(244,114,182,0.15)]',
    Components: [
      UserReplyStory.StoryReplyPlainDM,
      UserReplyStory.StoryReplyProductCarousel,
    ]
  },
  {
    id: 'user_enquiry',
    title: 'User Enquiry',
    emoji: '🛍️',
    icon: ShoppingBag,
    colorClass: 'text-[#34D399]',
    glowClass: 'border-[#34D399]/40 bg-[#34D399]/5 shadow-[0_0_15px_rgba(52,211,153,0.15)]',
    Components: [
      UserEnquiry.ProductCarouselDM,
      UserEnquiry.SpecificReelProductInquiry,
    ]
  }
];

export function LeftSidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setActiveCategory(prev => (prev === id ? null : id));
  };

  const activeCategoryData = TEMPLATE_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <TooltipProvider>
      <div className="flex h-full shrink-0 z-20">
        {/* 4-Icon Vertical Rail representing the categories */}
        <div className="w-16 h-full bg-[#161616] border-r border-[#2d2d2d] flex flex-col items-center py-6 gap-5 shadow-2xl relative select-none">
          {TEMPLATE_CATEGORIES.map(category => {
            const isActive = activeCategory === category.id;
            const Icon = category.icon;
            return (
              <Tooltip key={category.id} delayDuration={150}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border border-white/5 bg-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 relative group",
                      isActive && cn("text-white border-white/10 scale-105", category.glowClass)
                    )}
                  >
                    <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive && category.colorClass)} />
                    {isActive && (
                      <div className={cn("absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-current", category.colorClass)} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2 bg-[#0F1011] border border-white/10 text-white font-semibold">
                  <span>{category.emoji} {category.title}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Dynamic sub-menu dropdown panel */}
        <AnimatePresence mode="wait">
          {activeCategoryData && (
            <motion.div
              key={activeCategoryData.id}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
              className="h-full bg-[#1c1b1b] border-r border-[#393939] flex flex-col shadow-2xl overflow-hidden relative"
            >
              <div className="px-5 mt-6 mb-5 select-none flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-bold text-white tracking-widest uppercase flex items-center gap-2">
                    <span className={activeCategoryData.colorClass}>{activeCategoryData.emoji}</span>
                    <span>{activeCategoryData.title}</span>
                  </h2>
                  <p className="text-[11px] text-on-surface-variant mt-1 leading-normal">
                    {activeCategoryData.Components.length} automations available
                  </p>
                </div>
                <button
                  onClick={() => setActiveCategory(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 space-y-1.5 pb-10 scrollbar-thin scrollbar-thumb-white/5">
                {activeCategoryData.Components.map((Component, i) => (
                  <Component key={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
