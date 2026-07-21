'use client';

import * as React from 'react';
import { useState } from 'react';
import { MessageSquare, Mail, History, ShoppingBag, Trophy, Sparkles, Menu as MenuIcon, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import DMContentEditor from '@/app/dashboard/inbox/wellcome/page';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getCategoryForTemplate } from './TemplateItem';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/services/api.service';

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
      UserComment.TwoHourFlashSale,
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
      UserDM.IceBreakerReplyFlow,
      UserDM.PersistentMenuReplyFlow,
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
    ]
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    emoji: '🛍️',
    icon: ShoppingBag,
    colorClass: 'text-[#34D399]',
    glowClass: 'border-[#34D399]/40 bg-[#34D399]/5 shadow-[0_0_15px_rgba(52,211,153,0.15)]',
    Components: [
      UserEnquiry.ProductCarouselDM,
      UserEnquiry.SpecificReelProductInquiry,
      UserDM.DMCatalogCarousel,
      UserReplyStory.StoryReplyProductCarousel,
    ]
  },
  {
    id: 'gamification',
    title: 'Gamification',
    emoji: '🏆',
    icon: Trophy,
    colorClass: 'text-[#FAC775]',
    glowClass: 'border-[#FAC775]/40 bg-[#FAC775]/5 shadow-[0_0_15px_rgba(250,199,117,0.15)]',
    hidden: true,
    Components: [
      UserComment.ClassicRandomGiveaway,
      UserComment.MostEngagedFanWins,
      UserComment.AIRankedBestComment,
      UserComment.FlashGiveaway,
      UserComment.Top3MultiWinner,
      UserComment.SpinWheelGamification,
      UserComment.WeightedHybridRandom,
      UserComment.CommentMarathon,
      UserDM.DMEntryPrivateGiveaway,
    ]
  }
];

export function LeftSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const flowId = searchParams.get('id');
  // Restore panel from URL param after full-page reloads (e.g. from Canvas init)
  const urlWelcome = searchParams.get('welcome') as 'icebreakers' | 'persistent_menu' | null;

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoadingWelcome, setIsLoadingWelcome] = useState<'icebreakers' | 'persistent_menu' | null>(null);
  const [welcomeTab, setWelcomeTab] = useState<'icebreakers' | 'persistent_menu' | null>(urlWelcome);

  const nodes = useSelector((state: RootState) => state.flow.nodes);
  const selectedTemplateId = React.useMemo(() => {
    return nodes.find(n => n.templateId)?.templateId || null;
  }, [nodes]);

  const selectedCategory = React.useMemo(() => {
    return getCategoryForTemplate(selectedTemplateId);
  }, [selectedTemplateId]);

  const toggleCategory = (id: string) => {
    setActiveCategory(prev => (prev === id ? null : id));
    setWelcomeTab(null);
  };

  const handleWelcomeIconClick = async (tab: 'icebreakers' | 'persistent_menu') => {
    setIsLoadingWelcome(tab);
    setActiveCategory(null);
    setWelcomeTab(tab);
    try {
      const res = await api.get('/automations/');
      const list = Array.isArray(res.data) ? res.data : [];
      const expectedName = tab === 'icebreakers' ? 'Welcome Message Flow' : 'Persistent Menu Flow';
      const match = list.find((f: any) => f.name === expectedName);
      if (match) {
        // Load the flow in canvas (client-side, no reload — local state preserved)
        router.push(`/dashboard/automations?id=${match.id}`);
      } else {
        // Empty canvas with init card — use canvas_init param (not 'open' which triggers popup)
        router.push(`/dashboard/automations?canvas_init=${tab}`);
      }
      // Show mock UI panel in sidebar
      setWelcomeTab(tab);
    } catch {
      router.push(`/dashboard/automations?canvas_init=${tab}`);
      setWelcomeTab(tab);
    } finally {
      setIsLoadingWelcome(null);
    }
  };

  const activeCategoryData = TEMPLATE_CATEGORIES.find(c => c.id === activeCategory);

  // Sidebar rail remains rendered at all times

  return (
    <TooltipProvider>
      <div className="flex h-full shrink-0 z-20">
        {/* 4-Icon Vertical Rail representing the categories */}
        <div className="w-16 h-full bg-[#161616] border-r border-[#2d2d2d] flex flex-col items-center py-6 gap-5 shadow-2xl relative select-none">
          {TEMPLATE_CATEGORIES.filter(c => !c.hidden).map(category => {
            const isActive = activeCategory === category.id;
            const isSelected = activeCategory === null && selectedCategory === category.id;
            const isActiveOrSelected = isActive || isSelected;
            const Icon = category.icon;
            return (
              <Tooltip key={category.id} delayDuration={150}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border border-white/5 bg-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 relative group",
                      isActiveOrSelected && cn("text-white border-white/10 scale-105", category.glowClass)
                    )}
                  >
                    <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActiveOrSelected && category.colorClass)} />
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

          {/* Separator */}
          <div className="w-8 h-px bg-white/10 my-1" />

          {/* Icebreakers Button */}
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleWelcomeIconClick('icebreakers')}
                disabled={isLoadingWelcome !== null}
                className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/5 bg-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 relative group disabled:opacity-60"
              >
                {isLoadingWelcome === 'icebreakers'
                  ? <Loader2 className="w-5 h-5 animate-spin text-[#8FE3FF]" />
                  : <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2 bg-[#0F1011] border border-white/10 text-white font-semibold">
              <span>✨ Welcome Questions</span>
            </TooltipContent>
          </Tooltip>

          {/* Persistent Menu Button */}
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleWelcomeIconClick('persistent_menu')}
                disabled={isLoadingWelcome !== null}
                className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/5 bg-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 relative group disabled:opacity-60"
              >
                {isLoadingWelcome === 'persistent_menu'
                  ? <Loader2 className="w-5 h-5 animate-spin text-[#C084FC]" />
                  : <MenuIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2 bg-[#0F1011] border border-white/10 text-white font-semibold">
              <span>☰ Persistent Menu</span>
            </TooltipContent>
          </Tooltip>
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

              <div
                onClickCapture={() => {
                  // Hide the template selection panel after a template is chosen
                  setTimeout(() => {
                    setActiveCategory(null);
                  }, 150);
                }}
                className="flex-1 overflow-y-auto px-3 space-y-1.5 pb-10 scrollbar-thin scrollbar-thumb-white/5"
              >
                {activeCategoryData.Components.map((Component, i) => (
                  <Component key={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Welcome Mock UI Panel */}
          {welcomeTab !== null && !activeCategoryData && (
            <motion.div
              key={`welcome-panel-${welcomeTab}`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="h-full bg-[#131313] border-r border-[#393939] flex flex-col shadow-2xl overflow-hidden relative"
            >
              <div className="px-5 pt-5 pb-4 border-b border-[#2d2d2d] flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-[13px] font-bold text-white tracking-widest uppercase flex items-center gap-2">
                    {welcomeTab === 'icebreakers'
                      ? <><Sparkles className="w-4 h-4 text-[#8FE3FF]" /><span>Welcome Questions</span></>
                      : <><MenuIcon className="w-4 h-4 text-[#C084FC]" /><span>Persistent Menu</span></>}
                  </h2>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    {welcomeTab === 'icebreakers' ? 'Suggested icebreaker questions' : 'Navigation menu shortcuts'}
                  </p>
                </div>
                <button
                  onClick={() => setWelcomeTab(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                <DMContentEditor defaultTab={welcomeTab} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

