'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateNodeData } from '@/store/slices/flowSlice';
import {
  X, Plus, Trash2, Check, Info, MessageSquare, Heart,
  ChevronLeft, ChevronRight, Sparkles, Send, Signal, Wifi, Battery,
  RotateCcw, Eye, HelpCircle, MessageCircle, Bookmark, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentReplyContentEditorProps {
  nodeId: string;
  onClose: () => void;
}

export default function CommentReplyContentEditor({ nodeId, onClose }: CommentReplyContentEditorProps) {
  const dispatch = useDispatch();

  const allNodes = useSelector((state: RootState) => state.flow.nodes);
  const node = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === nodeId));
  const triggerNode = useSelector((state: RootState) => state.flow.nodes.find(n => n.type === 'trigger'));
  const conditionNode = useSelector((state: RootState) => state.flow.nodes.find(n => n.type === 'condition'));

  const { user: appUser, instagramAccounts } = useSelector((state: RootState) => state.auth);
  const activeAccountId = appUser?.active_instagram_account_id;

  const activeAccount = React.useMemo(() => {
    if (!activeAccountId || !instagramAccounts) return null;
    return instagramAccounts.find((acc: any) => String(acc.id) === String(activeAccountId));
  }, [activeAccountId, instagramAccounts]);

  const profilePic = activeAccount?.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop';
  const username = activeAccount?.username || appUser?.username || 'mybusiness';

  // Local Form States
  const [messages, setMessages] = React.useState<string[]>(['Sent you a DM! 📩']);
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [mobileView, setMobileView] = React.useState<'edit' | 'preview'>('edit');

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (node) {
      const existing = node.data?.messages;
      if (Array.isArray(existing) && existing.length > 0) {
        setMessages(existing);
      } else if (typeof node.data?.reply_comment_text === 'string' && node.data.reply_comment_text) {
        setMessages([node.data.reply_comment_text]);
      }
    }
  }, [node]);

  // Sync to Redux
  const updateRedux = (newMsgs: string[]) => {
    dispatch(updateNodeData({ id: nodeId, key: 'messages', value: newMsgs }));
    dispatch(updateNodeData({ id: nodeId, key: 'reply_comment_text', value: newMsgs[0] || '' }));
    dispatch(updateNodeData({ id: nodeId, key: 'is_placeholder', value: false }));
    dispatch(updateNodeData({ id: nodeId, key: 'validationError', value: null }));

    // Clear validation error on all action nodes in the flow
    allNodes.filter(n => n.type === 'action').forEach(n => {
      if (n.data?.validationError) {
        dispatch(updateNodeData({ id: n.id, key: 'validationError', value: null }));
      }
    });
  };

  const handleMessageChange = (index: number, val: string) => {
    const next = [...messages];
    next[index] = val;
    setMessages(next);
    updateRedux(next);
  };

  const handleAddMessage = () => {
    const defaultTemplates = [
      'Check your inbox! ✨',
      'Sent over all the details in your DM! 📬',
      'Just messaged you! 📩 Check your request tab.',
      'Check your messages for full details! 👇'
    ];
    const nextMsg = defaultTemplates[messages.length % defaultTemplates.length];
    const next = [...messages, nextMsg];
    setMessages(next);
    setPreviewIndex(next.length - 1);
    updateRedux(next);
  };

  const handleRemoveMessage = (index: number) => {
    if (messages.length <= 1) {
      setValidationError('At least one public comment reply is required.');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }
    const next = messages.filter((_, i) => i !== index);
    setMessages(next);
    setPreviewIndex(Math.max(0, index - 1));
    updateRedux(next);
  };

  const handleSave = () => {
    const validMsgs = messages.map(m => m.trim()).filter(Boolean);
    if (validMsgs.length === 0) {
      setValidationError('Please enter at least one public comment reply message.');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }
    updateRedux(validMsgs);
    onClose();
  };

  // Compute preview customer message from condition / trigger
  const customerMessageText = React.useMemo(() => {
    const matchType = conditionNode?.data?.match_type || 'contains';
    if (matchType === 'any') {
      return 'How much is this? Can I get more info? 🙌';
    }

    const currentKw = conditionNode?.data?.keywords_equals?.[0] || conditionNode?.data?.keywords?.[0] || triggerNode?.data?.keywords?.[0] || 'price';

    if (matchType === 'equals') {
      return currentKw;
    }

    // Contains Any: sentence with user given keyword
    return `Hey! Can you send me the ${currentKw} details?`;
  }, [conditionNode, triggerNode]);

  // Compute post media image
  const postImageUrl = React.useMemo(() => {
    const mediaDetails = triggerNode?.data?.media_ids_details;
    if (Array.isArray(mediaDetails) && mediaDetails.length > 0) {
      return mediaDetails[0].thumbnail_url || mediaDetails[0].media_url;
    }
    return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&h=400';
  }, [triggerNode]);

  if (!mounted) return null;

  const currentPreviewMessage = messages[previewIndex] || messages[0] || 'Sent you a DM! 📩';

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden text-white font-inter">
      {/* Background Ambient Glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#c4c0ff]/10 -top-20 -left-20 blur-[120px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#636565]/10 -bottom-20 -right-20 blur-[120px] pointer-events-none" />

      {/* Main Modal Container */}
      <div className="w-full max-w-5xl h-[92vh] sm:h-[88vh] max-h-[850px] bg-[#131313]/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative z-10 font-inter">

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-transparent">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#b6b2ff]/10 border border-[#b6b2ff]/20 rounded-xl text-[#b6b2ff]">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2">
                Public Comment Reply Setup
              </h2>
              <p className="text-[10px] sm:text-xs text-zinc-400">
                Configure automated public replies posted under user comments on your post
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded border border-white/10 text-zinc-300 font-semibold text-xs hover:bg-white/5 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-white text-black font-bold text-xs hover:opacity-90 transition-all active:scale-95 flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Save Changes
            </button>
          </div>
        </div>

        {/* Validation Notification */}
        {validationError && (
          <div className="px-4 sm:px-6 py-2 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs font-medium animate-in fade-in slide-in-from-top-1 shrink-0">
            <Info className="w-4 h-4 shrink-0" />
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

        {/* Modal Body */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10 overflow-hidden">

          {/* LEFT: Authentic Instagram Device Shell */}
          <div className={cn(
            "lg:w-[410px] bg-[#09090b] p-4 sm:p-6 flex flex-col items-center justify-center shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-zinc-800",
            mobileView === 'preview' ? "flex" : "hidden lg:flex"
          )}>

            {/* Variation Preview Control Pill */}
            {messages.length > 1 && (
              <div className="mb-4 flex items-center gap-2 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-full text-xs text-zinc-300">
                <Eye className="w-3.5 h-3.5 text-[#b6b2ff]" />
                <span>Previewing #{previewIndex + 1} of {messages.length}</span>
                <div className="flex items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => (prev > 0 ? prev - 1 : messages.length - 1))}
                    className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => (prev < messages.length - 1 ? prev + 1 : 0))}
                    className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

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
                    <Signal className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                    <Wifi className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                    <Battery className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  </div>
                </div>

                {/* Comments Scrollable Stream */}
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
                            <span className="font-semibold text-[9px] sm:text-[11px] text-white">{username}</span>
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
                        src={postImageUrl}
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
                      <span className="font-bold text-white mr-1.5">{username}</span>
                      <span>Beautiful new collection launch! Drop your questions below 👇</span>
                    </div>

                    <div className="px-2 sm:px-3 pt-2 text-[7px] sm:text-[9px] text-zinc-500 font-medium uppercase tracking-wider">
                      Comments
                    </div>

                    {/* Comments Feed Section (Customer Comment + Business Reply) */}
                    <div className="px-2 sm:px-3 py-1.5 sm:py-2 space-y-2.5 sm:space-y-3">
                      <div className="flex gap-2 sm:gap-2.5 items-start">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                          alt="Customer"
                          className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full object-cover shrink-0 border border-zinc-800"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] sm:text-[11px] leading-snug text-zinc-200">
                            <span className="font-semibold text-white mr-1.5">alex_design</span>
                            <span>{customerMessageText}</span>
                          </p>
                          <div className="flex gap-2 sm:gap-3 mt-0.5 sm:mt-1 text-[8px] sm:text-[9px] text-zinc-500 font-medium">
                            <span>2m</span>
                            <span>34 likes</span>
                            <button className="hover:text-zinc-300">Reply</button>
                          </div>

                          {/* Nested Indented Author Reply */}
                          <div className="mt-2 space-y-2">
                            <div className="flex gap-1.5 sm:gap-2 items-start">
                              <img
                                src={profilePic}
                                alt={username}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0 border border-zinc-700"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] sm:text-[11px] leading-snug text-zinc-200">
                                  <span className="font-semibold text-white mr-1">{username}</span>
                                  <span className="text-[#b6b2ff] font-medium bg-[#b6b2ff]/10 px-1.5 py-0.5 rounded border border-[#b6b2ff]/25 text-[9px] sm:text-[10px]">
                                    {currentPreviewMessage}
                                  </span>
                                </p>
                                <div className="flex gap-3 mt-0.5 sm:mt-1 text-[8px] sm:text-[9px] text-zinc-500 font-medium">
                                  <span>Just now</span>
                                </div>
                              </div>
                            </div>
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
              </div>

            </div>
          </div>

          {/* RIGHT: Configuration & Form Panel */}
          <div className={cn(
            "flex-1 p-5 sm:p-6 md:p-8 overflow-y-auto flex flex-col justify-between bg-[#121212]",
            mobileView === 'edit' ? "block" : "hidden lg:block"
          )}>
            <div className="space-y-6 max-w-xl mx-auto w-full">

              {/* Anti-Spam Tip Header */}
              <div className="bg-[#b6b2ff]/10 border border-[#b6b2ff]/20 rounded-xl p-4 flex items-start gap-3 text-xs text-[#b6b2ff]">
                <div className="space-y-1">
                  <p className="text-zinc-300 leading-relaxed font-medium">
                    Instagram limits repetitive automated replies. Adding 2 or 3 reply variations rotates them randomly across user comments to keep your account safe.
                  </p>
                </div>
              </div>

              {/* Messages Controls List Header with Add Variant Button */}
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <div>
                    <h3 className="font-sora text-xs font-bold text-zinc-400 tracking-wider">
                      Comment Reply Variations ({messages.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMessage}
                    className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                {messages.map((msg, idx) => {
                  const isSelected = previewIndex === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setPreviewIndex(idx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group text-left ${isSelected
                        ? 'bg-zinc-900/90 border-[#b6b2ff]/50 shadow-md ring-1 ring-[#b6b2ff]/20'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#b6b2ff]' : 'text-zinc-400'}`}>
                            Variation #{idx + 1}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] bg-[#b6b2ff]/10 text-[#b6b2ff] border border-[#b6b2ff]/20 px-2 py-0.5 rounded-full font-medium">
                              Active Preview
                            </span>
                          )}
                        </div>

                        {messages.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMessage(idx);
                            }}
                            className="text-zinc-500 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition-colors"
                            title="Delete variation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={2}
                        value={msg}
                        onChange={(e) => handleMessageChange(idx, e.target.value)}
                        placeholder="e.g. Sent you a DM! Check your inbox 📩"
                        className="w-full bg-[#18181b] border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#b6b2ff]/50 transition-colors resize-none leading-relaxed"
                      />
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}