'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateNodeData } from '@/store/slices/flowSlice';
import { X, Plus, Trash2, Check, Info, Filter, UserCheck, ChevronLeft, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConditionContentEditorProps {
  nodeId: string;
  onClose: () => void;
}

export default function ConditionContentEditor({ nodeId, onClose }: ConditionContentEditorProps) {
  const dispatch = useDispatch();

  // Get node and auth details
  const node = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === nodeId));
  const triggerNode = useSelector((state: RootState) => state.flow.nodes.find(n => n.type === 'trigger'));
  const { user: appUser, instagramAccounts } = useSelector((state: RootState) => state.auth);
  const activeAccountId = appUser?.active_instagram_account_id;
  const activeAccount = React.useMemo(() => {
    if (!activeAccountId || !instagramAccounts) return null;
    return instagramAccounts.find((acc: any) => String(acc.id) === String(activeAccountId));
  }, [activeAccountId, instagramAccounts]);

  const profilePic = activeAccount?.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop';
  const username = activeAccount?.username || appUser?.username || 'instagram_user';

  const isStoryReply = React.useMemo(() => {
    const rt = node?.ruleType || triggerNode?.ruleType || '';
    const tid = node?.templateId || triggerNode?.templateId || '';
    return rt.includes('story') || tid === '23' || node?.data?.name?.toLowerCase().includes('story') || triggerNode?.data?.is_story_reply || triggerNode?.data?.target_mode === 'story';
  }, [node, triggerNode]);

  const isCommentTrigger = React.useMemo(() => {
    const rt = node?.ruleType || triggerNode?.ruleType || '';
    return rt.includes('comment') || triggerNode?.data?.target_mode === 'comment' || (!rt.includes('dm') && !rt.includes('story') && !rt.includes('share'));
  }, [node, triggerNode]);

  const storyImageUrl = React.useMemo(() => {
    const mediaDetails = triggerNode?.data?.media_ids_details;
    if (Array.isArray(mediaDetails) && mediaDetails.length > 0) {
      return mediaDetails[0].thumbnail_url || mediaDetails[0].media_url;
    }
    return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=300&h=450';
  }, [triggerNode]);

  // --- Local Form States ---
  const [matchType, setMatchType] = React.useState<'contains' | 'equals' | 'any'>('contains');
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [keywordsEquals, setKeywordsEquals] = React.useState<string[]>([]);
  const [followerGate, setFollowerGate] = React.useState(false);
  const [followerGateMessages, setFollowerGateMessages] = React.useState<string[]>(['']);

  const [keywordInput, setKeywordInput] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [mobileView, setMobileView] = React.useState<'edit' | 'preview'>('edit');

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (node) {
      setMatchType(node.data?.match_type || 'contains');
      setKeywords(node.data?.keywords || []);
      setKeywordsEquals(node.data?.keywords_equals || []);
      setFollowerGate(!!node.data?.follower_gate);
      setFollowerGateMessages(node.data?.follower_gate_messages || ['']);
    }
  }, [node]);

  // --- Keyword Array Handlers ---
  const activeKeywords = matchType === 'equals' ? keywordsEquals : keywords;
  const setActiveKeywords = matchType === 'equals' ? setKeywordsEquals : setKeywords;

  const customerMessageText = React.useMemo(() => {
    if (matchType === 'any') {
      return 'How much is this? Can I get more info? 🙌';
    }

    const currentKw = activeKeywords.length > 0 ? activeKeywords[0] : (node?.data?.keywords?.[0] || triggerNode?.data?.keywords?.[0] || 'price');

    if (matchType === 'equals') {
      return currentKw;
    }

    // Contains Any: sentence with user given keyword
    return `Hey! Can you send me the ${currentKw} details?`;
  }, [matchType, activeKeywords, node, triggerNode]);

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = keywordInput.trim().toLowerCase();
      if (val && !activeKeywords.includes(val)) {
        setActiveKeywords([...activeKeywords, val]);
      }
      setKeywordInput('');
      setValidationError(null);
    }
  };

  const handleAddKeywordBtn = () => {
    const val = keywordInput.trim().toLowerCase();
    if (val && !activeKeywords.includes(val)) {
      setActiveKeywords([...activeKeywords, val]);
    }
    setKeywordInput('');
    setValidationError(null);
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setActiveKeywords(activeKeywords.filter(kw => kw !== kwToRemove));
  };

  // --- Follower Gate Messages Handlers ---
  const handleAddMessageVariation = () => {
    setFollowerGateMessages([...followerGateMessages, '']);
  };

  const handleUpdateMessageVariation = (idx: number, val: string) => {
    const updated = [...followerGateMessages];
    updated[idx] = val;
    setFollowerGateMessages(updated);
  };

  const handleRemoveMessageVariation = (idx: number) => {
    if (followerGateMessages.length > 1) {
      setFollowerGateMessages(followerGateMessages.filter((_, i) => i !== idx));
    }
  };

  const handleSave = () => {
    if (matchType !== 'any' && activeKeywords.length === 0) {
      setValidationError("Please enter at least one keyword for matching.");
      return;
    }
    if (followerGate && followerGateMessages.some(m => !m.trim())) {
      setValidationError("Please fill out all follower gate response messages or remove empty variations.");
      return;
    }

    dispatch(updateNodeData({ id: nodeId, key: 'match_type', value: matchType }));
    dispatch(updateNodeData({ id: nodeId, key: 'keywords', value: keywords }));
    dispatch(updateNodeData({ id: nodeId, key: 'keywords_equals', value: keywordsEquals }));
    dispatch(updateNodeData({ id: nodeId, key: 'follower_gate', value: followerGate }));
    dispatch(updateNodeData({ id: nodeId, key: 'follower_gate_messages', value: followerGateMessages.filter(m => m.trim() !== '') }));
    dispatch(updateNodeData({ id: nodeId, key: 'validationError', value: null }));
    onClose();
  };

  // Format user messages for phone preview based on matchType & activeKeywords
  const userPreviewMessages = React.useMemo(() => {
    if (matchType === 'any') {
      return ["Hello! Is this item available?"];
    }

    if (activeKeywords.length === 0) {
      return ["(No keywords added yet)"];
    }

    if (matchType === 'equals') {
      return activeKeywords.slice(0, 2);
    } else {
      const msg1 = `I would like to order ${activeKeywords[0]}`;
      const msg2 = activeKeywords[1] ? `Can I ${activeKeywords[1]} this item?` : null;
      return msg2 ? [msg1, msg2] : [msg1];
    }
  }, [matchType, activeKeywords]);

  const displayGateReply = followerGateMessages.find(m => m.trim()) || "Please follow our page to unlock this offer! ✨";

  if (!node || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden text-white font-inter">
      {/* Background Glows */}
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#c4c0ff] top-[-20%] left-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#636565] bottom-[-20%] right-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />

      {/* Main Outer Modal Container */}
      <div className="w-full max-w-5xl h-[92vh] sm:h-[88vh] max-h-[880px] bg-[#131313]/90 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300 text-white relative z-10 font-inter">

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-transparent">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="p-1.5 sm:p-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="font-inter text-xs sm:text-sm md:text-lg font-bold text-white tracking-tight leading-tight">
                Filter Configuration
              </h2>
              <span className="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wide block mt-0.5 sm:mt-1 leading-tight">
                Configure keyword matching rules and follower gate filters
              </span>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded border border-white/10 text-zinc-300 font-semibold text-xs hover:bg-white/5 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-white text-black font-bold text-xs hover:opacity-90 transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-white/5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Save
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="px-4 sm:px-6 py-2 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs font-semibold animate-in fade-in slide-in-from-top-1 shrink-0">
            <Info className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Toggle Bar for Mobile View */}
        <div className="flex lg:hidden border-b border-white/10 bg-white/5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileView('edit')}
            className={cn(
              "flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all",
              mobileView === 'edit'
                ? "text-white border-white bg-white/5"
                : "text-zinc-400 border-transparent hover:text-zinc-200"
            )}
          >
            Edit Configuration
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={cn(
              "flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all",
              mobileView === 'preview'
                ? "text-white border-white bg-white/5"
                : "text-zinc-400 border-transparent hover:text-zinc-200"
            )}
          >
            Live Preview
          </button>
        </div>

        {/* Modal Body: Split View */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10 overflow-hidden">
          {/* LEFT: Instagram Live Phone Device Frame Mockup Preview */}
          <div className={cn(
            "lg:w-[410px] bg-[#09090b] p-4 sm:p-6 flex flex-col items-center justify-center shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-zinc-800",
            mobileView === 'preview' ? "flex" : "hidden lg:flex"
          )}>

            {/* Mobile Phone Mockup Body - Scaled down for mobile screens */}
            <div className="w-[240px] h-[460px] sm:w-[300px] sm:h-[580px] rounded-[30px] sm:rounded-[42px] border-[8px] sm:border-[10px] border-[#222] bg-black shadow-2xl relative flex flex-col overflow-hidden select-none outline outline-1 outline-zinc-800 shrink-0">

              {/* Speaker / Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-3 sm:h-4 bg-black rounded-full z-40 pointer-events-none" />

              {/* Phone Screen Container */}
              <div className="h-full w-full flex flex-col bg-black text-white relative">

                {/* iOS Top Status Bar */}
                <div className="h-8 sm:h-10 px-5 sm:px-6 pt-1 sm:pt-2 flex items-center justify-between text-[9px] sm:text-[11px] font-semibold text-white z-30 pointer-events-none bg-black">
                  <span>9:41</span>
                  <div className="flex items-center gap-1 sm:gap-1.5 opacity-90">
                    <span className="text-[8px] sm:text-[10px]">📶</span>
                    <span className="text-[8px] sm:text-[10px]">⚡</span>
                  </div>
                </div>

                {isCommentTrigger ? (
                  /* INSTAGRAM COMMENTS MOCKUP FOR COMMENT AUTOMATION */
                  <div className="flex-1 flex flex-col justify-between bg-black text-[10px] sm:text-xs font-sans overflow-hidden">

                    {/* Scrollable Feed Container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black text-left">

                      {/* Post Header */}
                      <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border-b border-zinc-800 shrink-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <img
                            src={profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                            className="w-5 h-5 sm:w-7 sm:h-7 rounded-full object-cover border border-zinc-700"
                            alt={username}
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-[9px] sm:text-[11px] text-white">{username || 'mybusiness'}</span>
                              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-sky-500 text-black flex items-center justify-center text-[5px] sm:text-[6px] font-bold">✓</span>
                            </div>
                            <p className="text-[7px] sm:text-[8px] text-zinc-400">Original post</p>
                          </div>
                        </div>
                        <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
                      </div>

                      {/* Post Image */}
                      <div className="w-full h-24 sm:h-32 bg-black relative overflow-hidden shrink-0 border-b border-zinc-900">
                        <img
                          src={storyImageUrl}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Action Icons */}
                      <div className="flex justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-zinc-200">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white hover:text-rose-500 cursor-pointer" />
                          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white cursor-pointer" />
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white cursor-pointer" />
                        </div>
                        <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white cursor-pointer" />
                      </div>

                      {/* Likes Count */}
                      <div className="px-2 sm:px-3 text-[8px] sm:text-[10px] font-medium text-zinc-300">
                        Liked by <span className="font-bold text-white">alex_design</span> and <span className="font-bold text-white">2,384 others</span>
                      </div>

                      {/* Post Caption */}
                      <div className="px-2 sm:px-3 pt-1 text-[8px] sm:text-[10px] text-zinc-300 leading-tight">
                        <span className="font-bold text-white mr-1.5">{username || 'mybusiness'}</span>
                        <span>Beautiful new collection launch! Drop your questions below 👇</span>
                      </div>

                      <div className="px-2 sm:px-3 pt-2 text-[7px] sm:text-[9px] text-zinc-500 font-medium tracking-wider">
                        Comments
                      </div>

                      {/* Comments Feed Section */}
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 space-y-2.5 sm:space-y-3">
                        <div className="flex gap-2 sm:gap-2.5 items-start">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                            alt="Customer"
                            className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full object-cover shrink-0 border border-zinc-800"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-[9px] sm:text-[11px] leading-snug text-zinc-200">
                              <span className="font-semibold text-white mr-1.5">alex_design</span>
                              <span>{customerMessageText}</span>
                            </p>
                            <div className="flex gap-2 sm:gap-3 mt-0.5 sm:mt-1 text-[8px] sm:text-[9px] text-zinc-500 font-medium">
                              <span>2m</span>
                              <span>34 likes</span>
                              <button className="hover:text-zinc-300">Reply</button>
                              {followerGate && <span className="text-rose-400 font-semibold ml-auto">Follower Gate Active</span>}
                            </div>
                          </div>
                          <Heart className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-zinc-500 hover:text-rose-500 cursor-pointer shrink-0 mt-0.5" />
                        </div>
                      </div>

                    </div>

                    {/* Add Comment Input Bar */}
                    <div className="border-t border-zinc-800 px-2 sm:px-3 py-1.5 sm:py-2 bg-black shrink-0">
                      <div className="flex items-center gap-1.5 sm:gap-2.5">
                        <img
                          src={profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                          alt={username}
                          className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                        />
                        <span className="flex-1 text-[10px] sm:text-xs text-zinc-500 truncate text-left">
                          Add a comment...
                        </span>
                        <button className="text-blue-500 font-semibold text-[10px] sm:text-xs hover:text-blue-400 cursor-pointer">
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="w-16 sm:w-20 h-1 bg-zinc-700 rounded-full mx-auto my-1 shrink-0" />
                  </div>
                ) : (
                  /* EXISTING DM CHAT MOCKUP FOR DIRECT DM */
                  <>
                    {/* Instagram Header */}
                    <div className="pt-6 sm:pt-8 pb-2 sm:pb-3 border-b border-zinc-800/60 px-3 sm:px-4 flex items-center rounded-full gap-2.5 sm:gap-3 bg-zinc-950/80 backdrop-blur-md shrink-0">
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                      <div className="w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full bg-zinc-800 border border-zinc-700/50 overflow-hidden shrink-0">
                        <img
                          src={profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80"}
                          className="w-full h-full object-cover"
                          alt="Avatar"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] sm:text-[11px] font-bold text-white truncate leading-tight">
                            {username || 'customer_chat'}
                          </span>
                          <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-[7px] sm:text-[8px] text-zinc-400 font-medium leading-none block mt-0.5 sm:mt-1">Active now</span>
                      </div>
                    </div>

                    {/* Chat Thread Body */}
                    <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 flex flex-col space-y-2.5 sm:space-y-3.5 scrollbar-hide bg-black">
                      <div className="flex-1" />

                      {/* Story Reply Thumbnail Preview */}
                      {isStoryReply && (
                        <div className="self-start flex flex-col gap-1 sm:gap-1.5 max-w-[70%] shrink-0 ml-5 sm:ml-7 mb-1 animate-fadeIn text-left">
                          <div className="text-[8px] sm:text-[9px] font-semibold text-zinc-400 flex items-center gap-1">
                            <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600" />
                            <span>Replied to story</span>
                          </div>
                          <div className="w-20 h-30 sm:w-24 sm:h-36 rounded-xl overflow-hidden border border-white/10 shadow-lg relative bg-zinc-900 group">
                            <img
                              src={storyImageUrl}
                              alt="Story Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                            <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 flex items-center gap-1">
                              <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1px]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[5px] sm:text-[6px] font-bold text-white ">
                                  S
                                </div>
                              </div>
                              <span className="text-[7px] sm:text-[8px] font-medium text-white/90 truncate max-w-[50px] sm:max-w-[60px]">
                                {username || 'Your Story'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Customer Left Bubble */}
                      {userPreviewMessages.length > 0 ? (
                        userPreviewMessages.slice(0, 1).map((userMsg, i) => (
                          <div key={i} className="self-start flex items-end gap-1.5 sm:gap-2 max-w-[85%] shrink-0">
                            <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-zinc-800 shrink-0 overflow-hidden mb-0.5 border border-zinc-700/40">
                              <img
                                src={profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50"}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            </div>
                            <div className="bg-[#26262a] border border-zinc-800/60 rounded-2xl rounded-bl-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-[11px] text-zinc-200 text-left">
                              {userMsg}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="self-start flex items-end gap-1.5 sm:gap-2 max-w-[85%] shrink-0 opacity-60">
                          <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-zinc-800 shrink-0 border border-zinc-700/40" />
                          <div className="bg-[#26262a] border border-zinc-800/60 rounded-2xl rounded-bl-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-[11px] text-zinc-400 italic text-left">
                            {matchType === 'any' ? "Hi there!" : activeKeywords[0] || "Type keyword..."}
                          </div>
                        </div>
                      )}

                      {/* Bot Reply Preview or Gate Response (Right) */}
                      {followerGate ? (
                        <div className="self-end items-end max-w-[85%] flex flex-col shrink-0 gap-1">
                          <div className="bg-[#18181b] border border-zinc-800 text-zinc-200 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl rounded-br-xs text-[10px] sm:text-[11px] leading-relaxed shadow-md text-left">
                            {displayGateReply}
                          </div>
                          <span className="text-[7px] sm:text-[8px] text-rose-400 font-semibold pr-1">Follower Gate Active</span>
                        </div>
                      ) : (
                        <div className="self-end items-end max-w-[85%] flex flex-col shrink-0 gap-1">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/20 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl rounded-br-xs text-[9px] sm:text-[10px] leading-snug font-medium shadow-md">
                            <span>Triggers flow sequence</span>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Footer Input Bar */}
                    <div className="p-2 sm:p-3 border-t border-zinc-800/60 bg-zinc-950/90 shrink-0">
                      <div className="bg-zinc-900 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between border border-zinc-800">
                        <span className="text-[9px] sm:text-[10px] text-zinc-500 font-medium">Filter node thread...</span>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>

          {/* RIGHT: Editor Fields Panel */}
          <div className={cn(
            "flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 sm:space-y-6 custom-scrollbar bg-[#131313]",
            mobileView === 'edit' ? "block" : "hidden lg:block"
          )}>

            {node?.ruleType?.includes('share') && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-start gap-3">
                <span className="text-base shrink-0">ℹ️</span>
                <div>
                  <span className="font-bold text-white block mb-0.5">Post Share Automation Notice</span>
                  <span>For <strong>User Shares Post to DM</strong> automations, keyword matching is not required. The reply will trigger automatically whenever a user shares your selected post or reel to your DM!</span>
                </div>
              </div>
            )}

            {/* Keyword Match Mode Selection Cards */}
            <div className="space-y-3 text-left">
              <label className="text-xs font-bold text-zinc-400  tracking-wider block font-inter">
                Keyword Match Mode
              </label>

              <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-full">
                {[
                  { value: 'contains', label: 'Contains Any' },
                  { value: 'equals', label: 'Exact Match' },
                  { value: 'any', label: 'Any Message' }
                ].map((opt) => {
                  const isSelected = matchType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setMatchType(opt.value as any);
                        if (setValidationError) setValidationError(null);
                      }}
                      className={cn(
                        "flex-1 py-2 sm:py-2.5 text-center rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "bg-white text-black shadow-md"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Follower Gate Settings Card */}
            <div className="bg-white/5 border border-white/10 rounded p-5 space-y-4 text-left font-inter shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-white shrink-0" />
                    <span className="text-xs font-bold text-white tracking-wider">Enable Follower Gate</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                    Require customer to follow account before trigger execution.
                  </p>
                </div>

                {/* Custom Switch Toggle */}
                <button
                  type="button"
                  onClick={() => setFollowerGate(!followerGate)}
                  className={cn(
                    "w-11 h-6 rounded-full relative transition-all duration-200 shrink-0 cursor-pointer border border-white/10",
                    followerGate ? "bg-[#b6b2ff]" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-[2px] w-4.5 h-4.5 rounded-full shadow transition-all duration-200",
                    followerGate ? "left-[22px] bg-[#131313]" : "left-[2px] bg-white"
                  )} />
                </button>
              </div>

              {/* Message Variations for Follower Gate */}
              {followerGate && (
                <div className="space-y-3 pt-3 border-t border-white/10 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs text-zinc-400 tracking-wider font-inter">
                        Set messages for non-followers ({followerGateMessages.length})
                      </h4>

                    </div>
                    <button
                      type="button"
                      onClick={handleAddMessageVariation}
                      className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer hover:opacity-90 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Variation
                    </button>
                  </div>

                  <div className="space-y-2">
                    {followerGateMessages.map((msg, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-zinc-500 w-5 text-center">{idx + 1}</span>
                        <input
                          type="text"
                          value={msg}
                          onChange={(e) => handleUpdateMessageVariation(idx, e.target.value)}
                          placeholder="Please follow our page to unlock this offer! ✨"
                          className="flex-1 bg-[#18181b] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/30 font-medium placeholder-zinc-600"
                        />
                        {followerGateMessages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMessageVariation(idx)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Keywords Input Section */}
            {matchType !== 'any' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-zinc-400 tracking-wider block font-inter">
                  {matchType === 'equals' ? 'Keywords (Exact Match)' : 'Keywords (Contains Any)'}
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    placeholder="Type keyword and press Enter..."
                    className="flex-1 bg-[#18181b] border border-white/10 rounded px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeywordBtn}
                    className="px-3.5 py-2 bg-white text-black font-bold text-xs rounded hover:opacity-90 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {/* Active Keyword Chips List */}
                <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded p-3.5 min-h-[52px] items-center">
                  {activeKeywords.length > 0 ? (
                    activeKeywords.map((kw) => (
                      <span
                        key={kw}
                        onClick={() => handleRemoveKeyword(kw)}
                        className="bg-white/10 hover:bg-rose-500/20 hover:border-rose-500/40 text-white hover:text-rose-300 border border-white/15 text-xs font-bold pl-3 pr-2 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
                      >
                        <span>{kw}</span>
                        <X className="w-3 h-3 text-zinc-400 group-hover:text-rose-300 transition-colors shrink-0" />
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 font-medium italic pl-1">
                      No keywords added yet. Type a keyword above.
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
