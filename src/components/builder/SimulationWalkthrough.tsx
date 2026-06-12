'use client';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Heart, 
  MessageCircle, 
  Send, 
  UserPlus, 
  ChevronRight, 
  Sparkles, 
  Gift, 
  ExternalLink,
  Bell,
  X,
  Bookmark,
  MoreHorizontal,
  ArrowLeft,
  Smile,
  Paperclip,
  ImageIcon
} from 'lucide-react';

// Define simulation steps
export type SimStep =
  | 'IDLE'
  | 'TRIGGER_SHOW'         // Show Feed post or Story media
  | 'TYPING_TRIGGER'       // Animate cursor to comments button, open comments tray, type query
  | 'TRIGGER_POSTED'       // Add comment to chronological comments tray list
  | 'FOLLOWER_GATE_CHECK'  // If follower gate: show Follow Modal, cursor clicks Follow
  | 'PUBLIC_REPLY'         // Brand account auto reply typing and post in tray
  | 'NOTIF_RECEIVE'        // Slide down iOS/Android push notification, Comments tray closes
  | 'DM_CHAT_WINDOW'       // Navigate to direct message chat view
  | 'DM_TYPING'            // Typing indicator in DM
  | 'DM_DELIVERED'         // Deliver structured DM template
  | 'COMPLETED';           // Walkthrough ends, loop back

interface SimulationWalkthroughProps {
  onRestartRequest?: () => void;
  onStepChange?: (step: SimStep) => void;
}

export default function SimulationWalkthrough({ onRestartRequest, onStepChange }: SimulationWalkthroughProps) {
  const flow = useSelector((state: RootState) => state.flow);
  
  // Extract active Instagram account details from Redux auth state
  const { user: appUser, instagramAccounts } = useSelector((state: RootState) => state.auth);
  const activeAccountId = appUser?.active_instagram_account_id;
  const activeAccount = React.useMemo(() => {
    if (!instagramAccounts || instagramAccounts.length === 0) return null;
    if (!activeAccountId) return instagramAccounts[0];
    return instagramAccounts.find((acc: any) => String(acc.id) === String(activeAccountId)) || instagramAccounts[0];
  }, [activeAccountId, instagramAccounts]);

  const sellerUsername = activeAccount?.username || "elenarossi";
  const sellerFullName = activeAccount?.name || appUser?.name || "Elena Rossi";
  const sellerAvatarUrl = activeAccount?.profile_picture_url || "https://picsum.photos/seed/elena/100/100";
  
  // Extract trigger details
  const triggerNode = flow.nodes.find(n => n.type === 'trigger');
  
  // Detect trigger channel
  let triggerChannel: 'reel_or_post' | 'story' | 'dm' = 'reel_or_post';
  if (triggerNode) {
    const isStory = triggerNode.ruleType?.toLowerCase().includes('story') || 
                    triggerNode.data?.media_type === 'story' || 
                    triggerNode.data?.target_media_type === 'story';
    const isDM = triggerNode.ruleType?.toLowerCase().includes('dm') || 
                 triggerNode.data?.media_type === 'dm' || 
                 triggerNode.data?.target_media_type === 'dm' || 
                 triggerNode.ruleType?.includes('User DM');
    if (isStory) triggerChannel = 'story';
    else if (isDM) triggerChannel = 'dm';
  }

  // Extract selected media details from trigger node
  const mediaDetails = triggerNode?.data?.media_ids_details || [];
  const selectedMedia = mediaDetails[0];

  const postMediaUrl = selectedMedia?.media_url || selectedMedia?.thumbnail_url || "https://picsum.photos/seed/vibrant/400/250";
  const postCaption = selectedMedia?.caption || triggerNode?.data?.caption || "Our new collection details are finally live! Comment below for early discount code ⚡🎁";

  // Extract condition
  const conditionNode = flow.nodes.find(n => n.type === 'condition');
  const keywords: string[] = conditionNode?.data?.keywords || [];
  const followerGateEnabled = conditionNode?.data?.follower_gate === true;
  const followerGateMessages = conditionNode?.data?.gate_msgs || ["Follow us first to unlock this exclusive! 🔐"];

  // Extract actions (only if configured and not placeholder)
  const replyCommentAction = flow.nodes.find(
    n => n.type === 'action' && n.data?.action_type === 'reply_comment' && n.data?.is_placeholder !== true
  );
  const commentReplyText = replyCommentAction?.data?.messages?.[0] || "Sent you a DM! 📩 Check your inbox";

  const sendDmAction = flow.nodes.find(
    n => n.type === 'action' && n.data?.action_type === 'send_dm' && n.data?.is_placeholder !== true
  );
  const dmFormat = sendDmAction?.data?.dm_format || 'text'; // text | quick_reply | button_template | generic_template | attachment
  
  // Dynamic DM message retrieval based on format
  const dmMessageText = React.useMemo(() => {
    if (dmFormat === 'text') {
      return sendDmAction?.data?.messages?.[0] || "Hey there! Thanks for your inquiry. Here is the link! 👇";
    }
    if (dmFormat === 'quick_reply') {
      return sendDmAction?.data?.quick_reply_text || "Pick your option below:";
    }
    if (dmFormat === 'button_template') {
      return sendDmAction?.data?.button_template_text || "What would you like to do?";
    }
    return sendDmAction?.data?.messages?.[0] || "Here are the details you requested! 👇";
  }, [dmFormat, sendDmAction]);

  // Extract quick replies
  const quickReplies = React.useMemo(() => {
    return Array.isArray(sendDmAction?.data?.quick_replies_titles) 
      ? sendDmAction.data.quick_replies_titles 
      : ["Claim discount 🎫", "More items 👕", "Help 💬"];
  }, [sendDmAction]);

  // Extract buttons
  const buttons = React.useMemo(() => {
    const raw = sendDmAction?.data?.button_template_buttons_json;
    if (!raw) return [{ type: 'web_url', title: '🛍️ Shop Now', url: 'https://shop.example.com' }];
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [{ type: 'web_url', title: '🛍️ Shop Now', url: 'https://shop.example.com' }];
      }
    }
    if (Array.isArray(raw)) return raw;
    return [{ type: 'web_url', title: '🛍️ Shop Now', url: 'https://shop.example.com' }];
  }, [sendDmAction]);

  // Extract carousel elements
  const carouselElements = React.useMemo(() => {
    const raw = sendDmAction?.data?.generic_template_elements_json;
    if (!raw) return [{
      title: 'Welcome Product',
      subtitle: 'Premium quality slider description.',
      image_url: 'https://picsum.photos/seed/product1/170/80',
      default_action: { type: 'web_url', url: 'https://shop.example.com' },
      buttons: [{ type: 'web_url', title: '🛒 Buy Now', url: 'https://shop.example.com' }]
    }];
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    if (Array.isArray(raw)) return raw;
    return [];
  }, [sendDmAction]);

  // Extract attachments
  const attachments = React.useMemo(() => {
    return sendDmAction?.data?.attachments || [];
  }, [sendDmAction]);

  // Extract giveaway config
  const giveawayNode = flow.nodes.find(n => n.type === 'giveaway_config');
  const isGiveaway = !!giveawayNode;
  const giveawayMethod = giveawayNode?.data?.selection_method || giveawayNode?.data?.method || 'random';

  // Dynamic Sim State Machine
  const [currentStep, setCurrentStep] = React.useState<SimStep>('TRIGGER_SHOW');
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [speed, setSpeed] = React.useState<1 | 2>(1);
  const [userIsFollowing, setUserIsFollowing] = React.useState(false);
  const [simulatedCommentText, setSimulatedCommentText] = React.useState('');

  // Reset simulation when nodes update
  React.useEffect(() => {
    const handleReset = () => {
      setCurrentStep('TRIGGER_SHOW');
      setUserIsFollowing(false);
      setSimulatedCommentText('');
    };
    const frame = requestAnimationFrame(handleReset);
    return () => cancelAnimationFrame(frame);
  }, [flow.id, flow.nodes.length, flow.edges.length]);

  // Notify parent on step change
  React.useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  // Determine typed comment query using keyword
  const finalTypedCommentInput = React.useMemo(() => {
    if (keywords.length > 0) {
      const kw = keywords[0].trim();
      const kwLower = kw.toLowerCase();
      if (kwLower.includes('price') || kwLower.includes('cost') || kwLower.includes('much')) {
        return "how much is this? link please! 🔥";
      }
      if (kwLower.includes('size') || kwLower.includes('stock')) {
        return "is size M in stock?";
      }
      if (kwLower.includes('code') || kwLower.includes('discount')) {
        return "code please! 😍";
      }
      if (kwLower.includes('win') || kwLower.includes('enter') || kwLower.includes('giveaway')) {
        return "I want to enter! 🎉";
      }
      if (kwLower.includes('catalog') || kwLower.includes('collection')) {
        return "send collection catalog! 🛍️";
      }
      return `${kw} please!`;
    }
    return "this is amazing! details? 🙌";
  }, [keywords]);

  // Handle Typing effect in character interval
  React.useEffect(() => {
    if (currentStep === 'TYPING_TRIGGER') {
      let interval: NodeJS.Timeout;
      const handleTypingInit = () => {
        setSimulatedCommentText('');
        const fullText = finalTypedCommentInput;
        let idx = 0;
        interval = setInterval(() => {
          if (idx < fullText.length) {
            setSimulatedCommentText((prev) => prev + fullText.charAt(idx));
            idx++;
          } else {
            clearInterval(interval);
          }
        }, 40 / speed);
      };

      const frame = requestAnimationFrame(handleTypingInit);
      return () => {
        cancelAnimationFrame(frame);
        if (interval) clearInterval(interval);
      };
    }
  }, [currentStep, finalTypedCommentInput, speed]);

  // Steps timeline flow runner
  React.useEffect(() => {
    if (!isPlaying) return;

    let timer: NodeJS.Timeout;
    const baseDurations: Record<SimStep, number> = {
      IDLE: 1000,
      TRIGGER_SHOW: 2400,
      TYPING_TRIGGER: 3600,
      TRIGGER_POSTED: 1800,
      FOLLOWER_GATE_CHECK: followerGateEnabled && !userIsFollowing ? 3200 : 100,
      PUBLIC_REPLY: replyCommentAction ? 2800 : 100,
      NOTIF_RECEIVE: sendDmAction ? 2400 : 100,
      DM_CHAT_WINDOW: 1500,
      DM_TYPING: 1800,
      DM_DELIVERED: 5000,
      COMPLETED: 1500
    };

    const nextStepMap: Record<SimStep, SimStep> = {
      IDLE: 'TRIGGER_SHOW',
      TRIGGER_SHOW: 'TYPING_TRIGGER',
      TYPING_TRIGGER: 'TRIGGER_POSTED',
      TRIGGER_POSTED: followerGateEnabled && !userIsFollowing ? 'FOLLOWER_GATE_CHECK' : (replyCommentAction ? 'PUBLIC_REPLY' : (sendDmAction ? 'NOTIF_RECEIVE' : 'COMPLETED')),
      FOLLOWER_GATE_CHECK: replyCommentAction ? 'PUBLIC_REPLY' : (sendDmAction ? 'NOTIF_RECEIVE' : 'COMPLETED'),
      PUBLIC_REPLY: sendDmAction ? 'NOTIF_RECEIVE' : 'COMPLETED',
      NOTIF_RECEIVE: 'DM_CHAT_WINDOW',
      DM_CHAT_WINDOW: 'DM_TYPING',
      DM_TYPING: 'DM_DELIVERED',
      DM_DELIVERED: 'COMPLETED',
      COMPLETED: 'TRIGGER_SHOW' // loop back
    };

    const runTimer = () => {
      const duration = baseDurations[currentStep] * (1 / speed);
      timer = setTimeout(() => {
        if (currentStep === 'FOLLOWER_GATE_CHECK') {
          setUserIsFollowing(true);
        }
        setCurrentStep(nextStepMap[currentStep]);
      }, duration);
    };

    runTimer();
    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, speed, followerGateEnabled, userIsFollowing, replyCommentAction, sendDmAction]);

  // Mouse cursor paths based on states to simulate user action
  const getCursorCoordinates = () => {
    switch (currentStep) {
      case 'TRIGGER_SHOW':
        // Moves pointing at comment button under post
        return { x: '16%', y: triggerChannel === 'story' ? '92%' : '63%', opacity: 1 };
      case 'TYPING_TRIGGER':
        // Moves to the comment tray input field
        return { x: '45%', y: '94%', opacity: 1 };
      case 'TRIGGER_POSTED':
        // Moves to Post button on comment tray
        return { x: '90%', y: '94%', opacity: 1 };
      case 'FOLLOWER_GATE_CHECK':
        // Moves to click follow creator button
        return { x: '50%', y: '56%', opacity: 1 };
      case 'PUBLIC_REPLY':
        return { x: '50%', y: '50%', opacity: 0 };
      case 'NOTIF_RECEIVE':
        // Moves to click push notification banner on top
        return { x: '50%', y: '14%', opacity: 1 };
      case 'DM_CHAT_WINDOW':
        return { x: '50%', y: '12%', opacity: 0 };
      case 'DM_DELIVERED':
        // Points to interactive button/carousel card element
        return { x: '60%', y: '82%', opacity: 1 };
      default:
        return { x: '50%', y: '50%', opacity: 0 };
    }
  };

  const cursorCoord = getCursorCoordinates();

  // Check if Comments Tray should be visible (slide-up bottom sheet)
  const isCommentsTrayVisible = 
    (triggerChannel === 'reel_or_post' || triggerChannel === 'dm') &&
    ['TYPING_TRIGGER', 'TRIGGER_POSTED', 'FOLLOWER_GATE_CHECK', 'PUBLIC_REPLY'].includes(currentStep);

  // Render text helper for URL wrapping
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-sky-300 underline font-medium hover:text-sky-200 break-all">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full w-full justify-between items-center select-none min-h-0">
      {/* Phone Mockup Chassis Container */}
      <div 
        style={{ width: '298px', height: '646px' }}
        className="flex flex-col relative bg-gradient-to-b from-[#252527] via-[#1c1c1e] to-[#0c0c0e] border border-white/15 rounded-[2.8rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] select-none p-1 shrink-0"
      >
        {/* Side Buttons mockup */}
        {/* Action Button */}
        <div className="absolute left-[-2px] top-20 w-[2.5px] h-5 bg-[#3f3f40] rounded-l" />
        {/* Volume Up */}
        <div className="absolute left-[-2px] top-30 w-[2.5px] h-9 bg-[#3f3f40] rounded-l" />
        {/* Volume Down */}
        <div className="absolute left-[-2px] top-42 w-[2.5px] h-9 bg-[#3f3f40] rounded-l" />
        {/* Power Button */}
        <div className="absolute right-[-2px] top-32 w-[2.5px] h-12 bg-[#3f3f40] rounded-r" />

        {/* Ultra-thin screen bezel shadow */}
        <div className="absolute inset-[3px] rounded-[2.6rem] border-[1.5px] border-black pointer-events-none z-50 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]" />

        {/* Simulation Screen Wrapper */}
        <div className="flex-1 w-full bg-black relative overflow-hidden flex flex-col h-full rounded-[2.5rem]">
        
        {/* Dynamic Island Block */}
        <motion.div 
          className="absolute top-2 left-1/2 -translate-x-1/2 bg-black rounded-full z-50 flex items-center justify-between px-2 border border-white/5 overflow-hidden"
          animate={{
            width: ['TYPING_TRIGGER', 'DM_TYPING'].includes(currentStep) ? 76 : 48,
            height: ['TYPING_TRIGGER', 'DM_TYPING'].includes(currentStep) ? 14 : 10,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Micro camera punch hole */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#1b1b22] border border-white/5 flex items-center justify-center shrink-0">
            <div className="w-0.5 h-0.5 rounded-full bg-[#0d0d12]" />
          </div>
          
          {/* Dynamic glow indicators */}
          <div className="flex items-center gap-0.5 shrink-0">
            <span className={`w-0.5 h-0.5 rounded-full ${['TYPING_TRIGGER', 'DM_TYPING'].includes(currentStep) ? 'bg-emerald-400 animate-pulse' : 'bg-transparent'}`} />
            <div className="w-1 h-1 rounded-full bg-[#0b0b10] border border-white/5 flex items-center justify-center shrink-0">
              <div className="w-0.5 h-0.5 rounded-full bg-amber-400/80" />
            </div>
          </div>
        </motion.div>

        {/* Dynamic Screens */}
        <div className="flex-1 flex flex-col min-h-0 relative w-full pt-7 bg-black">
          <AnimatePresence mode="wait">
            
            {/* SCREEN 1: Feed Post / Reel Mockup */}
            {(triggerChannel === 'reel_or_post' || triggerChannel === 'dm') && 
             ['TRIGGER_SHOW', 'TYPING_TRIGGER', 'TRIGGER_POSTED', 'FOLLOWER_GATE_CHECK', 'PUBLIC_REPLY'].includes(currentStep) && (
              <motion.div 
                key="feed_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col h-full relative"
              >
                {/* Header info */}
                <div className="px-3 py-2.5 flex items-center justify-between text-white bg-black">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                        <img src={sellerAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold font-sans">{sellerUsername}</span>
                      <span className="text-[9px] text-zinc-400 font-medium">Milan, Italy</span>
                    </div>
                  </div>
                  <button className="text-white hover:opacity-80">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Media area */}
                <div className="flex-1 overflow-y-auto pb-4 bg-black">
                  <div className="relative aspect-video w-full bg-[#181818] overflow-hidden flex items-center justify-center border-y border-white/5">
                    <img 
                      src={postMediaUrl} 
                      alt="post media" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-white flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      REEL
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex justify-between items-center px-3 py-2 text-white">
                    <div className="flex gap-4">
                      <Heart className="w-5 h-5 hover:scale-110 cursor-pointer text-white" />
                      <MessageCircle className="w-5 h-5 text-white" />
                      <Send className="w-5 h-5" />
                    </div>
                    <Bookmark className="w-5 h-5" />
                  </div>

                  {/* Liked row */}
                  <div className="px-3 text-[11px] font-bold text-white font-sans">
                    Liked by you and 1,248 others
                  </div>

                  {/* Caption */}
                  <div className="px-3 py-1.5 text-[11px] leading-relaxed">
                    <span className="font-bold text-white mr-1.5 font-sans">{sellerUsername}</span>
                    <span className="text-white/90">{postCaption}</span>
                  </div>
                  
                  <div className="px-3 text-[10px] text-zinc-500 font-semibold mt-1">
                    2 hours ago
                  </div>
                </div>

                {/* SLIDE-UP COMMENTS TRAY (BottomSheet) */}
                <AnimatePresence>
                  {isCommentsTrayVisible && (
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: 'spring', damping: 24, stiffness: 180 }}
                      className="absolute bottom-0 left-0 right-0 h-[68%] bg-[#121212] border-t border-white/10 rounded-t-2xl z-40 flex flex-col overflow-hidden shadow-2xl"
                    >
                      {/* Drag Indicator */}
                      <div className="w-9 h-1 bg-white/20 rounded-full mx-auto my-2.5 shrink-0" />
                      
                      <div className="text-center text-[10.5px] font-bold text-white pb-2.5 border-b border-white/5 uppercase tracking-wider shrink-0">
                        Comments
                      </div>

                      {/* Comments Feed Thread */}
                      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                        {/* Static baseline user comments to feel populated */}
                        <div className="flex items-start gap-2.5 text-xs">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 overflow-hidden text-[9px] flex items-center justify-center font-bold text-white shrink-0">
                            AM
                          </div>
                          <div>
                            <span className="font-bold text-white text-[10.5px]">alessia_m</span>
                            <span className="text-[9px] text-zinc-500 ml-2">1h</span>
                            <p className="text-[11px] text-zinc-300 mt-0.5">Stunning collection! Absolute must have 😍</p>
                          </div>
                        </div>

                        {/* Simulated input comment posted */}
                        {['TRIGGER_POSTED', 'FOLLOWER_GATE_CHECK', 'PUBLIC_REPLY'].includes(currentStep) && (
                          <div className="flex items-start gap-2.5 text-xs animate-fadeIn">
                            <div className="w-6 h-6 rounded-full bg-indigo-500 overflow-hidden text-[9px] flex items-center justify-center font-bold text-white uppercase shrink-0">
                              ME
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-white text-[10.5px]">your_customer</span>
                              <span className="text-[9px] text-zinc-500 ml-2">just now</span>
                              <p className="text-[11px] text-white font-medium mt-0.5">{finalTypedCommentInput}</p>
                              
                              {/* Indented auto reply comment */}
                              {['PUBLIC_REPLY'].includes(currentStep) && (
                                <motion.div 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="mt-3.5 pl-3 border-l border-white/10 flex items-start gap-2"
                                >
                                  <div className="w-5.5 h-5.5 rounded-full overflow-hidden shrink-0">
                                    <img src={sellerAvatarUrl} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-white text-[10px]">{sellerUsername}</span>
                                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-1 rounded-sm uppercase tracking-tight scale-90">
                                        Author
                                      </span>
                                    </div>
                                    <p className="text-[10.5px] text-zinc-300 mt-1 bg-white/5 p-2 rounded-lg border border-white/5">
                                      {commentReplyText}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comments tray bottom typing input bar */}
                      <div className="p-2 bg-[#0d0d0d] border-t border-white/5 flex items-center gap-2.5 shrink-0">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 overflow-hidden text-[9px] flex items-center justify-center font-bold text-white uppercase shrink-0">
                          ME
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-white flex items-center min-h-[30px]">
                          <span>{simulatedCommentText}</span>
                          {currentStep === 'TYPING_TRIGGER' && <span className="w-1.5 h-3 bg-white ml-0.5 animate-pulse shrink-0" />}
                        </div>
                        <button className={`text-blue-500 font-extrabold text-xs px-2 shrink-0 ${simulatedCommentText ? 'opacity-100 hover:text-blue-400' : 'opacity-40'}`}>
                          Post
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* SCREEN 2: Instagram Story Mockup */}
            {triggerChannel === 'story' && 
             ['TRIGGER_SHOW', 'TYPING_TRIGGER', 'TRIGGER_POSTED', 'FOLLOWER_GATE_CHECK', 'PUBLIC_REPLY'].includes(currentStep) && (
              <motion.div 
                key="story_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col h-full bg-[#181818] relative"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-65 pointer-events-none" style={{ backgroundImage: `url(${postMediaUrl})` }} />
                
                {/* Story Top bar ticks */}
                <div className="p-3 pb-1 flex gap-1 relative z-10">
                  <div className="h-0.5 flex-1 bg-white" />
                  <div className="h-0.5 flex-1 bg-white/45" />
                </div>

                {/* Sender Head */}
                <div className="px-3 py-1.5 flex items-center justify-between relative z-10 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border border-white/20 bg-black overflow-hidden shrink-0">
                      <img src={sellerAvatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold font-sans">{sellerUsername}</span>
                    <span className="text-[9px] text-white/50 ml-1">3h</span>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-white/85" />
                </div>

                {/* Centered Story Sticker Box */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl text-center max-w-[210px] shadow-2xl"
                  >
                    <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <span className="text-[9px] uppercase font-bold tracking-wider text-amber-400">Exclusive Drop</span>
                    <h4 className="text-xs font-extrabold text-white mt-1 leading-normal">
                      Swipe Up or reply &quot;{keywords[0] || "link"}&quot; for direct discount early access! 🎟️
                    </h4>
                  </motion.div>
                </div>

                {/* Bottom Story send message box */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/95 to-transparent z-20 flex gap-3.5 items-center">
                  <div className="flex-1 bg-black/40 border border-white/25 rounded-full py-2 px-4 backdrop-blur-md text-[11px] text-white flex justify-between items-center min-h-[34px]">
                    <span>{simulatedCommentText || `Send message...`}</span>
                    {currentStep === 'TYPING_TRIGGER' && <span className="w-1.5 h-3 bg-white ml-0.5 animate-pulse" />}
                  </div>
                  <Send className="w-5 h-5 text-white/80 shrink-0" />
                </div>
              </motion.div>
            )}

            {/* SCREEN OVERLAY: Follower Gate Block */}
            {currentStep === 'FOLLOWER_GATE_CHECK' && followerGateEnabled && (
              <motion.div 
                key="follower_gate"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6"
              >
                <div className="bg-[#181818] border border-white/10 rounded-2xl p-5 text-center flex flex-col items-center max-w-[240px] shadow-2xl relative">
                  <div className="absolute top-2.5 right-2.5 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full text-[8px] font-extrabold flex items-center gap-0.5">
                    <UserPlus className="w-2.5 h-2.5" />
                    GATE
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center p-[2px] mb-3">
                    <div className="w-full h-full bg-black rounded-full overflow-hidden">
                      <img src={sellerAvatarUrl} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-white">@{sellerUsername}</h4>
                  <p className="text-[10px] text-white/60 mt-1.5 line-clamp-2 leading-relaxed">
                    {followerGateMessages[0]}
                  </p>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2.5 rounded-lg bg-white text-black font-extrabold text-[11px] mt-4 flex items-center justify-center gap-1.5 hover:bg-zinc-100 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow Creator</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: Instagram DM Chat screen */}
            {['DM_CHAT_WINDOW', 'DM_TYPING', 'DM_DELIVERED', 'COMPLETED'].includes(currentStep) && (
              <motion.div 
                key="dm_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col h-full bg-black relative"
              >
                {/* DM Chat Header */}
                <div className="px-3 py-2 border-b border-white/5 flex items-center gap-3 text-white bg-[#0d0d0d] shrink-0">
                  <ArrowLeft className="w-4 h-4 text-white shrink-0 cursor-pointer" />
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/5">
                    <img src={sellerAvatarUrl} alt={sellerFullName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-xs font-bold leading-none">{sellerUsername}</span>
                    <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Active now
                    </span>
                  </div>
                </div>

                {/* DM Chat Thread */}
                <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 pb-16">
                  {/* TYPING STATE SENDER */}
                  {['DM_TYPING'].includes(currentStep) && (
                    <div className="flex items-end gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                        <img src={sellerAvatarUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-[#181818] px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}

                  {/* DELIVERED DM RESULT */}
                  {['DM_DELIVERED', 'COMPLETED'].includes(currentStep) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2"
                    >
                      {/* Brand head avatar with text message */}
                      <div className="flex items-end gap-2 max-w-[85%]">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                          <img src={sellerAvatarUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-[#262626] border border-white/5 shadow-inner text-white text-[11.5px] px-3.5 py-2.5 rounded-2xl rounded-tl-sm flex flex-col gap-1 leading-relaxed">
                          {renderTextWithLinks(dmMessageText)}
                        </div>
                      </div>

                      {/* RENDERING DYNAMIC ACTION FORMATS */}
                      <div className="pl-8 mt-1.5 w-full flex flex-col gap-2">
                        
                        {/* Text format - standard, no pills */}
                        {dmFormat === 'text' && (
                          <span className="text-[9px] text-[#8FE3FF]/50 italic pl-1 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            Direct Message sent successfully
                          </span>
                        )}

                        {/* Quick Reply format */}
                        {dmFormat === 'quick_reply' && (
                          <div className="flex flex-col gap-1 w-full">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 pl-1 mt-1">Suggested options:</span>
                            <div className="flex gap-1.5 overflow-x-auto pb-1 invisible-scrollbar">
                              {quickReplies.map((pill: string, idx: number) => (
                                <motion.div 
                                  key={idx} 
                                  whileTap={{ scale: 0.95 }}
                                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/5 text-[10.5px] text-white shrink-0 font-bold cursor-pointer transition-colors"
                                >
                                  {pill.trim()}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Button Template format */}
                        {dmFormat === 'button_template' && (
                          <div className="w-[185px] bg-[#121212] border border-white/10 rounded-xl overflow-hidden flex flex-col p-1.5 gap-1.5 shadow-xl">
                            {buttons.map((btn: any, idx: number) => (
                              <button 
                                key={idx}
                                className="w-full py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>{btn.title || btn.name || 'Buy'}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-white/40 shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Generic Card / Product Carousel template format */}
                        {dmFormat === 'generic_template' && (
                          <div className="flex gap-2.5 overflow-x-auto w-full max-w-[245px] pb-2 invisible-scrollbar">
                            {carouselElements.map((elem: any, idx: number) => (
                              <div key={idx} className="w-[175px] shrink-0 bg-[#121212] border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-xl">
                                <div className="h-20 bg-cover bg-center bg-[#1c1b1b] flex items-center justify-center overflow-hidden">
                                  {elem.image_url ? (
                                    <img src={elem.image_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-zinc-600" />
                                  )}
                                </div>
                                <div className="p-2.5 flex flex-col gap-0.5">
                                  <h5 className="text-[11px] font-extrabold text-white truncate">{elem.title}</h5>
                                  <p className="text-[9px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">{elem.subtitle}</p>
                                  {elem.buttons?.map((btn: any, btnIdx: number) => (
                                    <button key={btnIdx} className="w-full py-1.5 rounded bg-white hover:bg-zinc-100 text-black text-[9px] font-extrabold mt-2 flex items-center justify-center gap-0.5 cursor-pointer transition-colors border-none shadow-sm">
                                      <span>{btn.title}</span>
                                      <ChevronRight className="w-2.5 h-2.5" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Attachment format */}
                        {dmFormat === 'attachment' && (
                          <div className="flex flex-col gap-2 max-w-[80%]">
                            {attachments.map((url: string, idx: number) => {
                              const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)/i);
                              return (
                                <div key={idx} className="bg-[#121212] border border-white/10 p-2 rounded-xl flex items-center gap-2 shadow-md">
                                  <div className="w-9 h-9 bg-zinc-900 border border-white/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                    {isImage ? (
                                      <img src={url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Paperclip className="w-4 h-4 text-zinc-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[9.5px] font-bold text-white truncate block">
                                      {url.split('/').pop() || `File_${idx + 1}`}
                                    </span>
                                    <span className="text-[8px] text-zinc-500 block">Attachment file</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* If Giveaway is loaded, show Giveaway ticket indicator */}
                        {isGiveaway && (
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-[185px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-2.5 mt-1 flex items-center gap-2 shadow-md"
                          >
                            <Gift className="w-5.5 h-5.5 text-amber-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-amber-400 leading-none block">GIVEAWAY ENTERED</span>
                              <span className="text-[9.5px] font-bold text-white truncate block mt-0.5">
                                {giveawayMethod === 'random' ? 'Random Ticket #981' : 'Engagement Counted'}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input block placeholder bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-black border-t border-white/5 flex items-center gap-2.5 shrink-0">
                  <div className="w-6 h-6 rounded-full bg-[#121212] flex items-center justify-center border border-white/5 shrink-0">
                    <img src={sellerAvatarUrl} className="w-4 h-4 rounded-full object-cover" />
                  </div>
                  <div className="flex-1 bg-[#121212] py-1.5 px-3.5 rounded-full text-[10.5px] border border-white/5 text-white/50 flex items-center min-h-[30px]">
                    Message {sellerFullName}...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SYSTEM PUSH NOTIFICATION BANNER */}
        <AnimatePresence>
          {currentStep === 'NOTIF_RECEIVE' && sendDmAction && (
            <motion.div 
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              className="absolute top-9 left-3 right-3 bg-[#1c1c1e]/95 border border-white/15 rounded-2xl p-3 shadow-2xl z-50 backdrop-blur-md flex items-start gap-2.5 select-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-sm">
                <img src={sellerAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8FE3FF] uppercase tracking-wider">AnyDm • Instagram</span>
                  <span className="text-[8px] text-white/45">now</span>
                </div>
                <h4 className="text-[11px] font-bold text-white leading-none mt-0.5">{sellerUsername}</h4>
                <p className="text-[10.5px] text-white/95 truncate mt-1 leading-normal font-medium">
                  {dmMessageText}
                </p>
              </div>
              <Bell className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOUSE CURSOR SIMULATED OVERLAY */}
        <motion.div 
          animate={cursorCoord}
          transition={{ type: 'spring', damping: 20, stiffness: 90 }}
          className="absolute pointer-events-none z-50 w-5 h-5 flex items-center justify-center"
          style={{ originX: 0, originY: 0 }}
        >
          <div className="relative">
            <svg 
              className="w-4.5 h-4.5 text-white fill-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] filter" 
              viewBox="0 0 24 24"
            >
              <path d="M4.5 3v15.2l4.8-4.8H19L4.5 3z" stroke="black" strokeWidth="1.5" />
            </svg>
            
            {/* Visual click ripple */}
            {['TYPING_TRIGGER', 'FOLLOWER_GATE_CHECK', 'NOTIF_RECEIVE', 'DM_DELIVERED', 'TRIGGER_POSTED'].includes(currentStep) && (
              <span className="absolute left-0 top-0 w-8 h-8 -translate-x-2 -translate-y-2 bg-[#8FE3FF]/40 rounded-full animate-ping border border-[#8FE3FF]" />
            )}
          </div>
        </motion.div>

        {/* Top status bar details */}
        <div className="absolute top-1.5 left-6 right-6 flex justify-between items-center text-[9px] text-white/80 font-semibold z-40 select-none font-sans">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="tracking-tighter font-extrabold text-[8px]">5G</span>
            <div className="w-4 h-2 border border-white/50 rounded-[3px] p-[0.5px] flex items-center">
              <div className="w-[85%] h-full bg-white rounded-[1px]" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Playback Controls Overlay Bar (Outside the phone, positioned at the bottom of the card) */}
    <div className="bg-[#121212]/95 border border-white/10 rounded-full px-3.5 py-1.5 shadow-2xl flex items-center gap-3.5 backdrop-blur-md shrink-0 h-[34px] mt-2 select-none">
      <button 
        type="button"
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer bg-transparent border-none"
        title={isPlaying ? "Pause Simulation" : "Play Simulation"}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white/80" /> : <Play className="w-3.5 h-3.5 fill-white/80" />}
      </button>

      <button 
        type="button"
        onClick={() => setSpeed(speed === 1 ? 2 : 1)}
        className="text-[9.5px] font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors uppercase select-none px-1 cursor-pointer bg-transparent border-none"
        title="Toggle playback speed (1x / 2x)"
      >
        {speed}x speed
      </button>

      <button 
        type="button"
        onClick={() => {
          setCurrentStep('TRIGGER_SHOW');
          setUserIsFollowing(false);
          setSimulatedCommentText('');
          if (onRestartRequest) onRestartRequest();
        }}
        className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer bg-transparent border-none"
        title="Restart Loop"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-3.5 bg-white/10" />

      {/* Step Tracker Indicator dots */}
      <div className="flex gap-1.5 items-center font-bold">
        {['TRIGGER_SHOW', 'FOLLOWER_GATE_CHECK', 'PUBLIC_REPLY', 'DM_DELIVERED'].map((stpDot, idx) => {
          const activeDotMap: Record<number, boolean> = {
            0: ['TRIGGER_SHOW', 'TYPING_TRIGGER', 'TRIGGER_POSTED'].includes(currentStep),
            1: ['FOLLOWER_GATE_CHECK'].includes(currentStep),
            2: ['PUBLIC_REPLY', 'NOTIF_RECEIVE', 'DM_CHAT_WINDOW', 'DM_TYPING'].includes(currentStep),
            3: ['DM_DELIVERED', 'COMPLETED'].includes(currentStep)
          };
          const labelMap = ["Trigger", "Checks", "Replier", "Inboxes"];
          const isActive = activeDotMap[idx];
          
          return (
            <div 
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                isActive ? 'bg-[#8FE3FF] w-3' : 'bg-white/20'
              }`}
              title={labelMap[idx]}
            />
          );
        })}
      </div>
    </div>
  </div>
);
}
