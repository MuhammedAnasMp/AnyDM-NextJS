'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateNodeData } from '@/store/slices/flowSlice';
import { X, Plus, Trash2, Check, Info, Filter, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConditionContentEditorProps {
  nodeId: string;
  onClose: () => void;
}

export default function ConditionContentEditor({ nodeId, onClose }: ConditionContentEditorProps) {
  const dispatch = useDispatch();
  
  // Get node and auth details
  const node = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === nodeId));
  const { user: appUser, instagramAccounts } = useSelector((state: RootState) => state.auth);
  const activeAccountId = appUser?.active_instagram_account_id;
  const activeAccount = React.useMemo(() => {
    if (!activeAccountId || !instagramAccounts) return null;
    return instagramAccounts.find((acc: any) => String(acc.id) === String(activeAccountId));
  }, [activeAccountId, instagramAccounts]);

  const profilePic = activeAccount?.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop';
  const username = activeAccount?.username || appUser?.username || 'instagram_user';

  // --- Local Form States ---
  const [matchType, setMatchType] = React.useState<'contains' | 'equals' | 'any'>('contains');
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [keywordsEquals, setKeywordsEquals] = React.useState<string[]>([]);
  const [followerGate, setFollowerGate] = React.useState(false);
  const [followerGateMessages, setFollowerGateMessages] = React.useState<string[]>(['']);
  
  const [keywordInput, setKeywordInput] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

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

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = keywordInput.trim().toLowerCase();
      if (val && !activeKeywords.includes(val)) {
        setActiveKeywords([...activeKeywords, val]);
      }
      setKeywordInput('');
    }
  };

  const handleAddKeywordBtn = () => {
    const val = keywordInput.trim().toLowerCase();
    if (val && !activeKeywords.includes(val)) {
      setActiveKeywords([...activeKeywords, val]);
    }
    setKeywordInput('');
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
      // Exact match: return exact keywords without surrounding sentence words
      return activeKeywords.slice(0, 2);
    } else {
      // Contains match: wrap keywords in sentence context e.g. "I want to get milk today"
      const msg1 = `I would like to order ${activeKeywords[0]}`;
      const msg2 = activeKeywords[1] ? `Can I ${activeKeywords[1]} this item?` : null;
      return msg2 ? [msg1, msg2] : [msg1];
    }
  }, [matchType, activeKeywords]);
  const displayGateReply = followerGateMessages.find(m => m.trim()) || "Please follow our page to unlock this offer! ✨";

  if (!node || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden text-white font-inter">
      {/* Ethereal Background Glows */}
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#c4c0ff] top-[-20%] left-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#636565] bottom-[-20%] right-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />

      {/* Outer Card Wrapper matching DMContentEditor */}
      <div className="w-full max-w-6xl h-[88vh] max-h-[880px] bg-[#131313]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300 relative z-10">
        
        {/* Modal Header */}
        <div className="px-8 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-transparent">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-inter text-base md:text-lg font-bold text-white tracking-tight leading-tight">
                Filter Node Configuration
              </h2>
              <span className="text-xs text-zinc-400 font-medium tracking-wide block mt-1 leading-tight">
                Configure keywords matching criteria and gate access filters for automated trigger replies
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-300 font-semibold text-xs md:text-sm hover:bg-white/5 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs md:text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Save Configuration
            </button>
          </div>
        </div>

        {validationError && (
          <div className="px-8 py-3.5 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-red-400 text-xs md:text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
            <Info className="w-4.5 h-4.5 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Body Split Panel */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          
          {/* LEFT: Instagram Device Phone Preview */}
          <div className="lg:w-[420px] bg-black/25 p-6 flex flex-col items-center overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10 shrink-0 min-h-0 custom-scrollbar">
            
            {/* Phone device wrapper */}
            <div className="w-[285px] h-[570px] rounded-[44px] border-[8px] border-[#2a2a2a] bg-black shadow-2xl relative flex flex-col overflow-hidden select-none outline outline-2 outline-[#393939] shrink-0 my-auto">
              
              {/* Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-30 pointer-events-none" />
              
              {/* Screen */}
              <div 
                className="h-full w-full flex flex-col pt-0 relative z-10 bg-black rounded-[36px] overflow-hidden font-inter"
                style={{ clipPath: 'inset(0 round 36px)' }}
              >
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-6 px-5 flex items-center justify-between text-[9px] font-semibold text-white z-20 pointer-events-none bg-transparent">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M2 22h20V2z" /></svg>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5.5 13.5a9 9 0 0 1 13 0M2.5 10.5a13 13 0 0 1 19 0" />
                    </svg>
                  </div>
                </div>

                {/* IG Chat Header */}
                <div className="h-14 border-b border-white/10 flex items-center px-4 pt-5 gap-3 shrink-0 bg-[#0d0d0d]">
                  <div className="w-7 h-7 rounded-full border border-white/10 overflow-hidden bg-zinc-800">
                    <img src={profilePic} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold truncate max-w-[130px]">{username}</span>
                    <span className="text-[8px] text-[#4dd0e1] font-semibold flex items-center gap-1 leading-none mt-0.5">
                      <span className="w-1.5 h-1.5 bg-[#4dd0e1] rounded-full inline-block animate-pulse" /> Active now
                    </span>
                  </div>
                </div>

                {/* Thread Body */}
                <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-[11px] font-medium leading-relaxed custom-scrollbar flex flex-col justify-end">
                  
                  {/* User message(s) containing keyword or exact match */}
                  {userPreviewMessages.map((userMsg, i) => (
                    <div key={i} className="flex flex-col items-end gap-1 shrink-0 animate-fadeIn">
                      <div className="bg-[#3797F0] text-white p-2.5 px-3.5 rounded-[18px] rounded-br-[4px] max-w-[88%] break-words shadow-md text-right text-xs font-inter">
                        {userMsg}
                      </div>
                    </div>
                  ))}

                  {/* Follower Gate Reply or Action Trigger */}
                  {followerGate ? (
                    <div className="flex flex-col items-start gap-1 shrink-0 animate-fadeIn pt-1">
                      <div className="bg-[#1c1c1c] text-zinc-200 border border-white/10 p-2.5 px-3.5 rounded-[18px] rounded-bl-[4px] max-w-[88%] break-words shadow-md text-xs font-inter">
                        {displayGateReply}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-1 shrink-0 opacity-60 animate-fadeIn pt-1">
                      <div className="bg-white/5 border border-white/10 text-zinc-300 p-2.5 py-2 rounded-[14px] text-[10px] flex items-center gap-1.5 italic font-bold font-inter">
                        <span>Triggering action sequence...</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Simulated Input Bar */}
                <div className="h-12 border-t border-white/10 bg-[#0d0d0d] flex items-center px-4 gap-2.5 shrink-0 select-none pb-1">
                  <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-full h-8 px-3.5 flex items-center text-[10.5px] text-zinc-500">
                    Active automation thread...
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT: Configuration Fields */}
          <div className="lg:flex-1 p-8 overflow-y-auto min-h-0 custom-scrollbar flex flex-col gap-6 bg-[#0F1011] font-inter">
            
            {/* Header info card */}
            <div className="bg-[#1a1a1a]/40 border border-white/5 rounded-2xl p-4.5 flex gap-3.5 items-start">
              <Info className="w-5 h-5 text-[#CECBF6] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs md:text-sm font-bold text-white">How Keyword Matching Works</span>
                <span className="text-xs text-zinc-400 leading-relaxed font-medium">
                  When a message matches your filters, the chatbot triggers the child reply cards. If the Follower Gate is active, it verifies first if they follow your account before triggering.
                </span>
              </div>
            </div>

            {/* Match Mode Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Keyword Match Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'contains', label: 'Contains Any', desc: 'Finds words in sentence' },
                  { value: 'equals', label: 'Exact Match', desc: 'Must match word precisely' },
                  { value: 'any', label: 'Any Message', desc: 'Triggers on all replies' }
                ].map((opt) => {
                  const isSel = matchType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setMatchType(opt.value as any);
                        setValidationError(null);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden",
                        isSel 
                          ? "border-[#CECBF6] bg-[#CECBF6]/5 text-white shadow-[0_0_20px_rgba(206,203,246,0.1)]" 
                          : "border-white/5 bg-[#161718]/60 hover:border-white/10 text-zinc-400 hover:text-white"
                      )}
                    >
                      <span className="text-xs md:text-sm font-bold">{opt.label}</span>
                      <span className="text-[10px] md:text-xs text-zinc-400 mt-1 font-medium leading-snug">{opt.desc}</span>
                      {isSel && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-[#CECBF6] rounded-full shadow-[0_0_8px_#CECBF6]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Keyword Input & Badges */}
            {matchType !== 'any' && (
              <div className="flex flex-col gap-3.5 animate-fadeIn">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest block">
                  {matchType === 'equals' ? 'Keywords (Exact Match)' : 'Keywords (Contains)'}
                </label>
                
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    placeholder="Type keyword and press Enter..."
                    className="flex-1 bg-[#161718] border border-white/10 hover:border-white/15 focus:border-[#CECBF6]/40 rounded-xl px-4 py-3 text-xs md:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeywordBtn}
                    className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 bg-[#121212]/40 border border-white/5 rounded-2xl p-3.5 min-h-[56px] items-center">
                  {activeKeywords.map((kw) => (
                    <span 
                      key={kw} 
                      className="bg-[#CECBF6]/10 border border-[#CECBF6]/25 text-[#CECBF6] text-xs font-bold pl-3.5 pr-2 py-1.5 rounded-full flex items-center gap-2 hover:border-red-500/50 hover:bg-red-950/10 hover:text-red-400 group cursor-pointer transition-all shadow-sm"
                      onClick={() => handleRemoveKeyword(kw)}
                    >
                      <span>{kw}</span>
                      <X className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 transition-colors shrink-0" />
                    </span>
                  ))}
                  {activeKeywords.length === 0 && (
                    <span className="text-xs text-zinc-500 font-medium italic pl-1.5">No keywords added yet.</span>
                  )}
                </div>
              </div>
            )}

            {/* Follower Gate Settings Card */}
            <div className="bg-[#1a1a1a]/30 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col pr-4">
                  <span className="text-xs md:text-sm font-bold text-white">Enable Follower Gate</span>
                  <span className="text-xs text-zinc-400 mt-0.5 leading-relaxed font-medium">User must be following your page. If check fails, sends failure message instead.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFollowerGate(!followerGate)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    followerGate ? "bg-[#CECBF6]" : "bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out",
                      followerGate ? "translate-x-5 bg-white" : "translate-x-0 bg-zinc-400"
                    )}
                  />
                </button>
              </div>

              {/* Message inputs for Follower Gate */}
              {followerGate && (
                <div className="space-y-4 pt-4 border-t border-white/5 animate-fadeIn">
                  <div className="flex items-center justify-between select-none">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest block">Failure replies (Variations)</label>
                    <button
                      type="button"
                      onClick={handleAddMessageVariation}
                      className="text-xs font-bold text-[#CECBF6] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Variation
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {followerGateMessages.map((msg, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={msg}
                          onChange={(e) => handleUpdateMessageVariation(idx, e.target.value)}
                          placeholder="Please follow our page to unlock this offer! ✨"
                          className="flex-1 bg-[#161718] border border-white/10 focus:border-[#CECBF6]/40 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none transition-colors font-medium placeholder-zinc-600"
                        />
                        {followerGateMessages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMessageVariation(idx)}
                            className="w-11 h-11 rounded-xl bg-red-950/20 border border-red-500/10 hover:bg-red-900/30 flex items-center justify-center text-red-400 cursor-pointer transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
