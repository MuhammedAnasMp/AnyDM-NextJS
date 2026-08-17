'use client';

import * as React from 'react';
import { useState } from 'react';
import { MessageSquare, Mail, History, ShoppingBag, Trophy, Sparkles, Menu as MenuIcon, Loader2, X, PillIcon, ChevronLeft, HdIcon, FocusIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import DMContentEditor from '@/components/builder/WelcomeContentEditor';
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
    emoji: MessageSquare,
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
    emoji: Mail,
    icon: Mail,
    colorClass: 'text-[#C084FC]',
    glowClass: 'border-[#C084FC]/40 bg-[#C084FC]/5 shadow-[0_0_15px_rgba(192,132,252,0.15)]',
    Components: [
      UserDM.UserSharesPostToDM,
      UserDM.ButtonTemplate,
      UserDM.WelcomeAutoReply,
      UserDM.IceBreakerReplyFlow,
      // UserDM.PersistentMenuReplyFlow,
    ]
  },
  {
    id: 'user_reply_story',
    title: 'User Reply Story',
    emoji: History,
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
    emoji: ShoppingBag,
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

function ZoomLevelDisplay() {
  const [zoom, setZoom] = React.useState(1);
  React.useEffect(() => {
    const handler = (e: Event) => setZoom((e as CustomEvent).detail);
    window.addEventListener('zoom-level', handler);
    return () => window.removeEventListener('zoom-level', handler);
  }, []);
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Vertical slider */}
      <input
        type="range"
        min="0.2"
        max="2"
        step="0.05"
        value={zoom}
        onChange={(e) => window.dispatchEvent(new CustomEvent('canvas-zoom-set', { detail: parseFloat(e.target.value) }))}
        className="appearance-none cursor-pointer accent-white"
        style={{
          writingMode: 'vertical-lr' as any,
          direction: 'rtl' as any,
          height: '60px',
          width: '4px',
          background: `linear-gradient(to top, #ffffff 0%, #ffffff ${((zoom - 0.2) / 1.8) * 100}%, #27272a ${((zoom - 0.2) / 1.8) * 100}%, #27272a 100%)`
        }}
      />
      {/* Zoom % reset button */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('canvas-zoom-reset'))}
        className="text-[9px] font-mono font-bold text-white/40 hover:text-white transition-colors py-0.5"
        title="Reset Zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
    </div>
  );
}

export function LeftSidebar() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const flowId = searchParams.get('id');
  const welcomeParam = searchParams.get('welcome');
  const initParam = searchParams.get('canvas_init');

  // Restore panel from URL param after full-page reloads
  const urlWelcome = welcomeParam as 'icebreakers' | 'persistent_menu' | null;

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoadingWelcome, setIsLoadingWelcome] = useState<'icebreakers' | 'persistent_menu' | null>(null);
  const [welcomeTab, setWelcomeTab] = useState<'icebreakers' | 'persistent_menu' | null>(urlWelcome);

  const nodes = useSelector((state: RootState) => state.flow.nodes);
  const flow = useSelector((state: RootState) => state.flow);
  const flowName = flow.name;

  const selectedTemplateId = React.useMemo(() => {
    return nodes.find(n => n.templateId)?.templateId || null;
  }, [nodes]);

  const selectedCategory = React.useMemo(() => {
    return getCategoryForTemplate(selectedTemplateId);
  }, [selectedTemplateId]);

  const isIcebreakerActive = React.useMemo(() => {
    if (activeCategory || selectedCategory) return false;
    if (welcomeParam === 'icebreakers' || initParam === 'icebreakers' || welcomeTab === 'icebreakers') {
      return true;
    }
    if (flowName === "Welcome Message Flow" || nodes.some(n => n.data?.is_icebreaker_trigger)) {
      return true;
    }
    return false;
  }, [activeCategory, selectedCategory, welcomeTab, welcomeParam, initParam, flowName, nodes]);

  const isMenuActive = React.useMemo(() => {
    if (activeCategory || selectedCategory) return false;
    if (welcomeParam === 'persistent_menu' || initParam === 'persistent_menu' || welcomeTab === 'persistent_menu') {
      return true;
    }
    if (flowName === "Persistent Menu Flow" || nodes.some(n => n.data?.is_menu_trigger)) {
      return true;
    }
    return false;
  }, [activeCategory, selectedCategory, welcomeTab, welcomeParam, initParam, flowName, nodes]);

  const modeParam = searchParams.get('mode');
  const isEditMode = modeParam === 'edit' || searchParams.get('edit') === 'true';

  const activeWelcomeTab = React.useMemo(() => {
    if (welcomeTab) return welcomeTab;
    if (urlWelcome) return urlWelcome;
    if (isEditMode) {
      if (flowName === "Welcome Message Flow" || nodes.some(n => n.data?.is_icebreaker_trigger)) return 'icebreakers';
      if (flowName === "Persistent Menu Flow" || nodes.some(n => n.data?.is_menu_trigger)) return 'persistent_menu';
    }
    return null;
  }, [welcomeTab, urlWelcome, isEditMode, flowName, nodes]);

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  React.useEffect(() => {
    const handleToggle = () => {
      setIsPanelCollapsed(prev => !prev);
    };
    window.addEventListener('toggle-welcome-panel', handleToggle);
    return () => window.removeEventListener('toggle-welcome-panel', handleToggle);
  }, []);

  React.useEffect(() => {
    const handleScheduleState = (e: Event) => {
      setIsScheduleOpen((e as CustomEvent).detail);
    };
    window.addEventListener('schedule-popover-state', handleScheduleState);
    return () => window.removeEventListener('schedule-popover-state', handleScheduleState);
  }, []);

  // Hide entire sidebar if editing a regular flow (non-welcome flow) with mode=edit or if user collapsed panel
  if (isPanelCollapsed || (isEditMode && !activeWelcomeTab)) {
    return null;
  }

  const toggleCategory = (id: string) => {
    const next = activeCategory === id ? null : id;
    setActiveCategory(next);
    if (next !== null) {
      setWelcomeTab(null);
      if (typeof window !== 'undefined' && window.location.search) {
        window.history.replaceState({}, '', '/dashboard/automations');
      }
    }
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

  return (
    <TooltipProvider>
      <div className={cn("flex h-full shrink-0 z-20", isScheduleOpen && "hidden sm:flex")}>
        {/* 4-Icon Vertical Rail representing the categories (Hidden when editing existing flow) */}
        {!isEditMode && (
          <div className="w-12 sm:w-16 h-full bg-[#161616] border-r border-[#2d2d2d] flex flex-col items-center py-3 gap-3 sm:gap-5 shadow-2xl relative select-none">
            {TEMPLATE_CATEGORIES.filter(c => !c.hidden).map(category => {
              const isActive = activeCategory === category.id;
              const isSelected = activeCategory === null && !isIcebreakerActive && !isMenuActive && selectedCategory === category.id;
              const isActiveOrSelected = isActive || isSelected;
              const Icon = category.icon;
              const Emoji = category.emoji;

              return (
                <Tooltip key={category.id} delayDuration={150}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border border-white/5 bg-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 relative group",
                        isActiveOrSelected && cn("text-white border-white/10 scale-105", category.glowClass)
                      )}
                    >
                      <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110", isActiveOrSelected && category.colorClass)} />
                      {isActive && (
                        <div className={cn("absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-current", category.colorClass)} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2 bg-[#0F1011] border border-white/10 text-white font-semibold">
                    <div className='flex justify-center items-center gap-2'>
                      <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110")} />
                      {category.title}</div>
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
                  className={cn(
                    "w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border border-white/5 bg-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 relative group disabled:opacity-60",
                    isIcebreakerActive && "text-white border-[#8FE3FF]/40 bg-[#8FE3FF]/5 shadow-[0_0_15px_rgba(143,227,255,0.15)] scale-105"
                  )}
                >
                  {isLoadingWelcome === 'icebreakers'
                    ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#8FE3FF]" />
                    : <PillIcon className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110", isIcebreakerActive && "text-[#8FE3FF]")} />}
                  {isIcebreakerActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-[#8FE3FF]" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2 bg-[#0F1011] border border-white/10 text-white font-semibold flex gap-1 justify-center items-center">
                <PillIcon size={15} />
                <span>
                  Welcome Questions</span>
              </TooltipContent>
            </Tooltip>

            {/* Persistent Menu Button */}
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleWelcomeIconClick('persistent_menu')}
                  disabled={isLoadingWelcome !== null}
                  className={cn(
                    "w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border border-white/5 bg-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 relative group disabled:opacity-60",
                    isMenuActive && "text-white border-[#C084FC]/40 bg-[#C084FC]/5 shadow-[0_0_15px_rgba(192,132,252,0.15)] scale-105"
                  )}
                >
                  {isLoadingWelcome === 'persistent_menu'
                    ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#C084FC]" />
                    : <MenuIcon className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110", isMenuActive && "text-[#C084FC]")} />}
                  {isMenuActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-[#C084FC]" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2 bg-[#0F1011] border border-white/10 text-white font-semibold">
                <span>☰ Persistent Menu</span>
              </TooltipContent>
            </Tooltip>
            {/* Mobile-only zoom controls at bottom of rail */}
            <div className="sm:hidden mt-auto flex flex-col items-center gap-1 pb-6">
              <div className="w-8 h-px bg-white/10 mb-1" />
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('canvas-zoom-in'))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                <PlusIcon size={15} />
                {/* <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> */}
              </button>
              <ZoomLevelDisplay />
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('canvas-zoom-out'))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                <MinusIcon size={15} />
                {/* <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg> */}
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('canvas-focus-flow'))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                title="Focus"
              >
                <FocusIcon size={15} />
                {/* <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#8FE3FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> */}
              </button>
            </div>
          </div>
        )}


        {/* Dynamic sub-menu dropdown panel */}
        <AnimatePresence mode="wait">
          {activeCategoryData && (
            <motion.div
              key={activeCategoryData.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="h-full bg-[#131313] border-r border-[#2d2d2d] flex flex-col shadow-2xl overflow-hidden relative w-[220px] sm:w-[320px]"
            >
              <div className="p-4 border-b border-[#2d2d2d] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  {/* <span className="text-lg">{activeCategoryData.emoji}</span> */}
                  <activeCategoryData.emoji className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110")} />
                  <h2 className="text-sm font-bold text-white tracking-tight">{activeCategoryData.title}</h2>
                </div>
                {!isEditMode && (
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div
                onClickCapture={() => {
                  // Hide the template selection panel after a template is chosen
                  setTimeout(() => {
                    setActiveCategory(null);
                  }, 150);
                }}
                className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 pb-10 scrollbar-thin scrollbar-thumb-white/5"
              >
                {activeCategoryData.Components.map((Component, i) => (
                  <Component key={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Welcome Mock UI Panel */}
          {activeWelcomeTab !== null && !activeCategoryData && (
            <motion.div
              key={`welcome-panel-${activeWelcomeTab}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="h-full bg-[#131313] border-r border-[#393939] flex flex-col shadow-2xl overflow-hidden relative w-[254px] sm:w-[360px]"
            >
              <div className="px-2 py-2 sm:px-5 sm:pt-5 sm:pb-4 border-b border-[#2d2d2d] flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-[11px] sm:text-[13px] font-bold text-white tracking-widest flex items-center gap-1.5 sm:gap-2">
                    {activeWelcomeTab === 'icebreakers'
                      ? <><PillIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8FE3FF]" /><span className="truncate">Welcome Questions</span></>
                      : <><MenuIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C084FC]" /><span className="truncate">Top Right Menu</span></>}
                  </h2>
                  <p className="text-[9px] sm:text-[11px] text-white/70 mt-0.5 line-clamp-2">
                    {activeWelcomeTab === 'icebreakers' ? 'Suggested questions for new customers' : 'Always visible in top right side'}
                  </p>
                </div>

                {!isEditMode && (
                  <button
                    onClick={() => setWelcomeTab(null)}
                    className="p-1 sm:p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-0 py-1 sm:p-4 scrollbar-thin">
                <DMContentEditor defaultTab={activeWelcomeTab} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
