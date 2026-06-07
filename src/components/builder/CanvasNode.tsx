'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateNodePosition, selectNode, updateNodeData } from '@/store/slices/flowSlice';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MessageSquare, Filter, Send, AtSign, Plus, Trophy, Gift, Sparkles, Clock, ChevronDown, Paperclip } from 'lucide-react';
import Xarrow, { useXarrow } from 'react-xarrows';
import { useCanvas } from './CanvasContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

const NODE_THEMES: Record<string, any> = {
  trigger: {
    pill: 'TRIGGER',
    icon: AtSign,
    title: 'Instagram Trigger',
    pillColor: 'bg-white text-black leading-none font-bold',
  },
  condition: {
    pill: 'FILTER',
    icon: Filter,
    title: 'Keyword Match',
    pillColor: 'bg-[#CECBF6] text-[#3c3489] leading-none font-bold',
  },
  action: {
    pill: 'ACTION',
    icon: MessageSquare,
    title: 'Send Automation Reply',
    pillColor: 'bg-[#B5D4F4] text-[#0c447c] leading-none font-bold',
  },
  giveaway_config: {
    pill: 'GIVEAWAY',
    icon: Trophy,
    title: 'Giveaway Setup',
    pillColor: 'bg-[#FAC775] text-[#633806] leading-none font-bold',
  },
  reward: {
    pill: 'REWARD',
    icon: Gift,
    title: 'Prize / Reward',
    pillColor: 'bg-[#9FE1CB] text-[#085041] leading-none font-bold',
  }
};

export function CanvasNode({ id }: { id: string }) {
  const dispatch = useDispatch();
  const node = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === id));
  const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNodeId);
  const updateXarrow = useXarrow();
  const { pan, scale } = useCanvas();
  const isDragging = React.useRef(false);
  const [formatMenuOpen, setFormatMenuOpen] = React.useState(false);
  const formatMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Notify Xarrow to connect correctly when the node mounts
    window.dispatchEvent(new CustomEvent('update-xarrow'));
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formatMenuRef.current && !formatMenuRef.current.contains(event.target as Node)) {
        setFormatMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!node) return null;
  const isSelected = selectedNodeId === id;
  const theme = NODE_THEMES[node.type] || NODE_THEMES.trigger;
  const Icon = theme.icon;

  // Custom overrides for action nodes as seen in the mockup
  let customPill = theme.pill;
  let customPillColor = theme.pillColor;
  let CustomIcon = Icon;
  let customTitle = theme.title;

  if (node.type === 'action') {
    if (node.data?.action_type === 'send_dm') {
      const format = node.data.dm_format || 'text';
      const hasMessages = node.data.messages && node.data.messages.length > 0;
      if (format === 'text') {
        customPill = hasMessages ? 'TEXT DM' : 'SEND DM';
      } else {
        customPill = `${format.toUpperCase().replace('_', ' ')} DM`;
      }
      CustomIcon = Send;
      customTitle = 'Send Direct Message';
    } else if (node.data?.action_type === 'reply_story') {
      customPill = 'REPLY STORY';
      CustomIcon = MessageSquare;
      customTitle = 'Reply to Story';
    } else {
      customPill = 'REPLY COMMENT';
      CustomIcon = MessageSquare;
      customTitle = 'Reply to Comment';
    }
  } else if (node.type === 'trigger') {
    const isDM = node.ruleType?.includes('dm');
    const isStory = node.ruleType?.includes('story');
    customTitle = isDM ? 'DM Incoming Trigger' : (isStory ? 'Story Reply Trigger' : 'Comments on Post/Reel');
  }

  if (node.type === 'action' && node.data?.is_placeholder) {
    const isSendDM = node.data.action_type === 'send_dm';
    return (
      <motion.div
        id={node.id}
        drag
        dragMomentum={false}
        onUpdate={() => updateXarrow()}
        onDrag={() => updateXarrow()}
        onDragStart={() => {
          isDragging.current = true;
          dispatch(selectNode(null));
        }}
        onDragEnd={(e, info) => {
          dispatch(updateNodePosition({
            id: node.id,
            position: { 
              x: node.position.x + info.offset.x / scale, 
              y: node.position.y + info.offset.y / scale 
            }
          }));
          updateXarrow();
          setTimeout(() => { isDragging.current = false; }, 50);
        }}
        initial={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
        animate={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
        transition={{ duration: 0 }}
        style={{ transformOrigin: '0 0', zIndex: isSelected ? 20 : 1 }}
        className="absolute w-8 h-8 flex flex-col items-center justify-center z-20 pointer-events-auto"
        ref={isSendDM ? formatMenuRef : undefined}
      >
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div
                className="w-8 h-8 rounded-full bg-[#1c1b1b] border-2 border-[#393939] hover:border-white hover:bg-white/10 cursor-pointer pointer-events-auto flex items-center justify-center transition-all shadow-xl backdrop-blur-md shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDragging.current) return;
                  if (isSendDM) {
                    setFormatMenuOpen(!formatMenuOpen);
                  } else {
                    dispatch(updateNodeData({ id: node.id, key: 'is_placeholder', value: false }));
                    updateXarrow();
                  }
                }}
              >
                <Plus className="w-4 h-4 text-[#e5e2e1]" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p className="font-semibold text-xs">
                {isSendDM ? 'Choose DM Format' : `Add Reply to Comment`}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isSendDM && formatMenuOpen && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#161622]/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[200] flex flex-col w-[150px] animate-fadeIn">
            <div className="px-3 py-2 bg-white/5 border-b border-white/10 text-center select-none shrink-0">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Message Type
              </span>
            </div>
            <div className="flex flex-col divide-y divide-[#2d2d2d]">
              {[
                { value: 'text', label: 'Plain Text' },
                { value: 'quick_reply', label: 'Quick Actions' },
                { value: 'button_template', label: 'Action Buttons' },
                { value: 'generic_template', label: 'Image Slider' },
                { value: 'attachment', label: 'Attachments' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(updateNodeData({ id: node.id, key: 'dm_format', value: opt.value }));
                    dispatch(updateNodeData({ id: node.id, key: 'is_placeholder', value: false }));
                    setFormatMenuOpen(false);
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('update-xarrow'));
                    }, 50);

                    if (opt.value !== 'text') {
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                          detail: { nodeId: node.id }
                        }));
                      }, 50);
                    }
                  }}
                  className="w-full px-3 py-2.5 text-center text-xs hover:bg-white/5 transition-colors cursor-pointer text-zinc-200 font-semibold"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      id={node.id}
      drag
      dragMomentum={false}
      onUpdate={() => updateXarrow()}
      onDrag={() => updateXarrow()}
      onDragStart={() => {
        isDragging.current = true;
        dispatch(selectNode(null));
      }}
      onDragEnd={(e, info) => {
        dispatch(updateNodePosition({
          id: node.id,
          position: { 
            x: node.position.x + info.offset.x / scale, 
            y: node.position.y + info.offset.y / scale 
          }
        }));
        updateXarrow();
        setTimeout(() => { isDragging.current = false; }, 50);
      }}
      initial={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
      animate={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
      transition={{ duration: 0 }}
      style={{ transformOrigin: '0 0', zIndex: isSelected ? 10 : 1 }}
      onClick={(e) => {
         e.stopPropagation();
         if (isDragging.current) return;
         const rect = e.currentTarget.getBoundingClientRect();
         dispatch(selectNode({ 
           id: node.id, 
           rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
         }));
      }}
      className={cn(
        "absolute flex flex-col w-[320px] rounded-[1.25rem] border-[1px] cursor-pointer shadow-2xl pointer-events-auto transition-colors",
        "backdrop-blur-[20px] bg-[#1c1b1b]/60 border-white/10",
        isSelected ? "ring-2 ring-white/20 border-white/30" : "hover:border-white/20 hover:bg-[#1c1b1b]/70"
      )}
    >
      {/* Overlapping Pill */}
      <div className="absolute -top-3 left-4 flex">
        <span className={cn("px-3 py-1.5 rounded-full text-[10px] tracking-widest leading-none outline outline-[#131313] outline-[4px]", customPillColor)}>
          {customPill}
        </span>
      </div>

      <div className="p-5 pt-8">
        <div className="flex items-center gap-3 mb-5">
           <div className="w-8 h-8 rounded-[0.4rem] bg-[#2a2a2a] flex items-center justify-center border border-white/5">
             <CustomIcon className="w-4 h-4 text-white" />
           </div>
           <h4 className="text-[17px] font-bold text-white tracking-tight">{customTitle}</h4>
        </div>

        {/* Node Content Variations based on type and dynamic data */}
        {node.type === 'trigger' && (() => {
          let displayTarget = 'Every Post / Reel';
          if (node.ruleType?.includes('story')) {
            displayTarget = (node.data?.target_mode === 'selected') ? 'Selected Stories Only' : 'Every Story';
          } else if (node.ruleType?.includes('dm')) {
            displayTarget = 'Every DM';
          } else {
            displayTarget = (node.data?.target_mode === 'selected') ? 'Selected Media Only' : 'Every Post / Reel';
          }
          return (
            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#c4c7c8] uppercase tracking-widest">Target & Media</span>
                <span className="text-sm font-semibold text-white">
                   {displayTarget}
                </span>
                {node.data?.media_ids_details && node.data.media_ids_details.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {node.data.media_ids_details.slice(0, 4).map((m: any) => (
                      <div key={m.id} className="w-8 h-8 rounded-md overflow-hidden border border-white/10 shrink-0">
                        <img src={m.thumbnail_url || m.media_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {node.data.media_ids_details.length > 4 && (
                      <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                        +{node.data.media_ids_details.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {node.data?.detailed && (
                <div className="bg-white/5 border border-white/15 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                  <span className="text-[10px] font-bold text-[#c4c7c8] uppercase tracking-widest block border-b border-white/5 pb-1">Trigger Config</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[10px] text-[#c4c7c8]">
                    <div className="flex flex-col col-span-2">
                      <span className="opacity-60">Source channel:</span>
                      <span className="text-white font-semibold">Instagram {(node.ruleType || '').replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {node.type === 'condition' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#c4c7c8] tracking-widest">Match Type</span>
                <span className="text-[10px] px-2 py-0.5 rounded-[4px] font-bold bg-[#E6F1FB] text-[#185FA5] uppercase">
                  {node.data?.match_type || 'Contains'}
                </span>
              </div>
              <p className="text-xs text-[#e5e2e1] leading-relaxed">
                Keywords: {(() => {
                  const kws = node.data?.match_type === 'equals' ? node.data?.keywords_equals : node.data?.keywords;
                  return kws?.length > 0 ? (
                    <span className="font-mono text-[10px] bg-[#222] px-1.5 py-0.5 rounded-sm line-clamp-2 mt-1 block">
                      [{kws.join(', ')}]
                    </span>
                  ) : (
                    <span className="italic text-xs text-[#c4c7c8]">— any comment —</span>
                  );
                })()}
              </p>
            </div>
            
            <div className="bg-[#2a2a2a]/30 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#c4c7c8] text-[10px]">Follower Gate</span>
                <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold", node.data?.follower_gate ? "bg-[#FCEBEB] text-[#A32D2D]" : "bg-white/5 text-white/40")}>
                  {node.data?.follower_gate ? "Active" : "Disabled"}
                </div>
              </div>
              {!node.data?.detailed && node.data?.follower_gate && node.data?.follower_gate_messages?.length > 0 && (
                <p className="text-[10px] text-red-300 italic line-clamp-1">
                  &quot;{node.data.follower_gate_messages[0]}&quot;
                </p>
              )}
            </div>

            {node.data?.detailed && (
              <div className="bg-white/5 border border-white/15 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                <span className="text-[10px] font-bold text-[#c4c7c8] uppercase tracking-widest block border-b border-white/5 pb-1">Detailed Config</span>
                <div className="flex flex-col gap-2 text-[10px] text-[#c4c7c8]">
                  <div className="flex justify-between">
                    <span className="opacity-60">Match Type:</span>
                    <span className="text-white font-semibold capitalize">{node.data?.match_type || 'contains'}</span>
                  </div>
                  {node.data?.follower_gate && node.data?.follower_gate_messages && node.data.follower_gate_messages.length > 0 && (
                    <div className="flex flex-col border-t border-white/5 pt-1.5 mt-0.5">
                      <span className="opacity-60 mb-1">Gate Messages:</span>
                      <div className="space-y-1">
                        {node.data.follower_gate_messages.map((m: string, i: number) => (
                          <div key={i} className="text-white bg-white/5 p-1 px-1.5 rounded text-[9px] italic break-words">
                            &quot;{m}&quot;
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {node.type === 'action' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="bg-[#F1EFE8] text-[#444441] text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                  {node.data?.action_type?.replace('_', ' ') || 'Reply Comment'}
                </span>
                {node.data?.dm_format && (
                  <span className="bg-[#EEEDFE] text-[#534AB7] text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                    {node.data.dm_format.replace('_', ' ')}
                  </span>
                )}
              </div>

              {node.data?.messages?.length > 0 && (node.data?.action_type !== 'send_dm' || node.data?.dm_format === 'text') && (
                <div className="bg-[#262626]/50 p-2 rounded-lg border border-white/5">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-0.5">
                    Messages
                  </span>
                  {!node.data?.detailed ? (
                    <p className="text-[10px] text-[#c4c7c8] italic line-clamp-2">
                      &quot;{node.data.messages[0]}&quot;
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                      {node.data.messages.map((msg: string, idx: number) => (
                        <div key={idx} className="text-[10px] text-[#c4c7c8] bg-white/5 p-1 rounded italic break-words">
                          {idx + 1}. &quot;{msg}&quot;
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {node.data?.dm_format === 'quick_reply' && node.data?.quick_reply_text && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                    detail: { nodeId: node.id }
                  }));
                }} 
                className="bg-black/35 hover:bg-[#8FE3FF]/5 border border-white/5 hover:border-[#8FE3FF]/45 rounded-xl p-3 flex flex-col gap-2.5 transition-all text-[11px]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Message Prompt:</span>
                  <span className="text-zinc-200 font-semibold">{node.data.quick_reply_text}</span>
                </div>
                {node.data.quick_replies_titles && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/5">
                    {node.data.quick_replies_titles.map((t: string) => (
                      <span key={t} className="bg-white/5 text-[#8FE3FF] px-2 py-0.5 rounded-full text-[8.5px] border border-white/10 font-bold">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {node.data?.dm_format === 'button_template' && (() => {
              let buttons = [];
              const btnsJson = node.data?.button_template_buttons_json;
              if (typeof btnsJson === 'string' && btnsJson.trim()) {
                try { buttons = JSON.parse(btnsJson); } catch (e) {}
              } else if (Array.isArray(btnsJson)) {
                buttons = btnsJson;
              }
              return (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                      detail: { nodeId: node.id }
                    }));
                  }} 
                  className="bg-black/35 hover:bg-[#8FE3FF]/5 border border-white/5 hover:border-[#8FE3FF]/45 rounded-xl overflow-hidden flex flex-col transition-all"
                >
                  <div className="p-3 text-[11px] text-zinc-200 font-semibold border-b border-white/5 text-left bg-zinc-900/10">
                    {node.data?.button_template_text || 'What would you like to do?'}
                  </div>
                  <div className="flex flex-col divide-y divide-white/5 bg-zinc-950/20">
                    {buttons.map((btn: any, idx: number) => (
                      <span key={idx} className="py-2 text-[10px] text-[#3797F0] font-bold text-center">
                        {btn.title || 'Button'}
                      </span>
                    ))}
                    {buttons.length === 0 && (
                      <span className="py-2.5 text-[10px] text-zinc-500 font-bold text-center italic">No buttons configured</span>
                    )}
                  </div>
                </div>
              );
            })()}
            
            {node.data?.dm_format === 'generic_template' && (() => {
              let elements = [];
              const elemsJson = node.data?.generic_template_elements_json;
              if (typeof elemsJson === 'string' && elemsJson.trim()) {
                try { elements = JSON.parse(elemsJson); } catch (e) {}
              } else if (Array.isArray(elemsJson)) {
                elements = elemsJson;
              }
              const firstElem = elements[0] || {};
              return (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                      detail: { nodeId: node.id }
                    }));
                  }} 
                  className="bg-black/35 hover:bg-[#8FE3FF]/5 border border-white/5 hover:border-[#8FE3FF]/45 rounded-xl overflow-hidden flex flex-col transition-all"
                >
                  {firstElem.image_url ? (
                    <div className="h-24 w-full bg-zinc-950 overflow-hidden relative border-b border-white/5 shrink-0">
                      <img src={firstElem.image_url} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 right-2 bg-black/85 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                        1 of {elements.length} Cards
                      </span>
                    </div>
                  ) : (
                    <div className="h-14 w-full bg-white/5 flex flex-col items-center justify-center text-[10px] font-bold text-zinc-500 border-b border-white/5">
                      <span>Carousel Slider</span>
                      <span className="text-[8px] opacity-60">({elements.length} card templates)</span>
                    </div>
                  )}
                  <div className="p-2.5 flex flex-col bg-[#121212] justify-center min-h-[48px] border-b border-white/5">
                    <span className="text-[11px] font-bold text-white truncate text-left">{firstElem.title || 'Slide Title'}</span>
                    <span className="text-[9px] text-zinc-400 mt-0.5 truncate text-left">{firstElem.subtitle || 'Slide Description'}</span>
                  </div>
                  {firstElem.buttons?.[0] && (
                    <div className="py-2 text-[10px] text-[#3797F0] font-bold text-center bg-zinc-950/20">
                      {firstElem.buttons[0].title}
                    </div>
                  )}
                </div>
              );
            })()}

            {node.data?.dm_format === 'attachment' && (() => {
              const attachList = node.data?.attachments || [];
              return (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                      detail: { nodeId: node.id }
                    }));
                  }} 
                  className="bg-black/35 hover:bg-[#8FE3FF]/5 border border-white/5 hover:border-[#8FE3FF]/45 rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Attachments</span>
                    <span className="bg-[#8FE3FF]/15 text-[#8FE3FF] text-[8px] font-bold px-1.5 py-0.5 rounded">
                      {attachList.length} files
                    </span>
                  </div>
                  
                  {attachList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {attachList.slice(0, 4).map((url: string, index: number) => {
                        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)/i);
                        return (
                          <div key={index} className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            {isImage ? (
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Paperclip className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                        );
                      })}
                      {attachList.length > 4 && (
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          +{attachList.length - 4}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-zinc-500 italic py-1 text-left">No files uploaded. Click to configure.</div>
                  )}
                </div>
              );
            })()}

            {node.data?.detailed && (node.data?.rate_limit_limit !== undefined || node.data?.rate_limit_window_seconds !== undefined) && (
              <div className="bg-white/5 border border-white/15 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                <span className="text-[10px] font-bold text-[#c4c7c8] uppercase tracking-widest block border-b border-white/5 pb-1">Action Config</span>
                <div className="flex flex-col gap-1.5 text-[10px] text-[#c4c7c8]">
                  <div className="flex justify-between">
                    <span className="opacity-60">Rate Limit:</span>
                    <span className="text-white font-semibold">
                      {node.data.rate_limit_limit ?? 1} / {node.data.rate_limit_window_seconds ?? 86400}s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {node.type === 'giveaway_config' && (
          <div className="flex flex-col gap-3 text-xs">
             <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#FAC775]" />
                <span className="bg-[#FAEEDA] text-[#854F0B] text-[10px] font-bold px-2 py-0.5 rounded-md self-start uppercase">
                  {(node.data?.selection_method || node.data?.method || 'Random').replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-white font-semibold mt-1">
                  Winners: {node.data?.winner_count ?? node.data?.winners ?? 1}
                </span>
             </div>

             <div className="flex flex-col gap-1 text-[10px] text-[#c4c7c8] bg-white/5 p-2 rounded-lg border border-white/5">
               <div className="flex items-center justify-between">
                 <span>Anti-Fraud Filters:</span>
                 <span className={cn("font-bold text-[9px]", (node.data?.anti_fraud_enabled ?? node.data?.anti_fraud) ? "text-emerald-400" : "text-white/40")}>
                   {(node.data?.anti_fraud_enabled ?? node.data?.anti_fraud) ? 'Active' : 'Disabled'}
                 </span>
               </div>
               {!node.data?.detailed && (node.data?.anti_fraud_enabled ?? node.data?.anti_fraud) && (
                 <div className="text-[9px] text-[#8e9192] flex justify-between mt-0.5">
                   <span>Age: {node.data?.min_account_age_days ?? 30}d</span>
                   <span>Min Foll: {node.data?.min_followers ?? 0}</span>
                 </div>
               )}
             </div>

             {!node.data?.detailed && (
               <div className="flex flex-col gap-1 text-[10px] text-[#c4c7c8]">
                 <div className="flex justify-between">
                   <span>Gamification:</span>
                   <span className="text-white">
                     {node.data?.gamification_enabled ? 'Enabled' : 'None'}
                   </span>
                 </div>
                 {node.data?.finalize_at && (
                   <div className="flex justify-between">
                     <span>Draw Date:</span>
                     <span className="text-white">{new Date(node.data.finalize_at).toLocaleDateString()}</span>
                   </div>
                 )}
               </div>
             )}

             {node.data?.detailed && (
               <div className="bg-white/5 border border-white/15 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                 <span className="text-[10px] font-bold text-[#c4c7c8] uppercase tracking-widest block border-b border-white/5 pb-1">Giveaway Config</span>
                 <div className="flex flex-col gap-2 text-[10px] text-[#c4c7c8]">
                   {node.data?.finalize_at && (
                     <div className="flex justify-between">
                       <span className="opacity-60">Draw Date:</span>
                       <span className="text-white font-semibold">{new Date(node.data.finalize_at).toLocaleString()}</span>
                     </div>
                   )}
                   <div className="flex justify-between">
                     <span className="opacity-60">Evaluation Window:</span>
                     <span className="text-white font-semibold">{node.data?.evaluation_window_seconds ?? 604800}s</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="opacity-60">Re-evaluation:</span>
                     <span className="text-white font-semibold">
                       {node.data?.re_evaluation_allowed ? `Allowed (Max: ${node.data?.re_evaluation_max ?? 1})` : 'Disabled'}
                     </span>
                   </div>
                   {node.data?.winner_messages?.length > 0 && (
                     <div className="border-t border-white/5 pt-1.5 mt-0.5 space-y-1">
                       <span className="opacity-60 block font-semibold">Winner DM Templates:</span>
                       <div className="space-y-1">
                         {node.data.winner_messages.map((m: string, i: number) => (
                           <div key={i} className="text-white bg-white/5 p-1 rounded text-[9px] italic break-words">
                             &quot;{m}&quot;
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             )}
          </div>
        )}
        
        {node.type === 'reward' && (
          <div className="flex flex-col gap-3 text-xs">
             <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col text-center">
                <span className="text-2xl mb-1">
                  {node.data?.reward_type === 'discount' || node.data?.type === 'discount' ? '🏷️' : '🎁'}
                </span>
                <span className="text-sm font-semibold text-white">{node.data?.value || node.data?.val || 'Reward'}</span>
                <span className="text-xs text-[#8e9192] mt-1">
                  Qty: {node.data?.quantity ?? node.data?.qty ?? 1} ({node.data?.reward_type || node.data?.type || 'physical'})
                </span>
             </div>

             {node.data?.detailed && (
               <div className="bg-white/5 border border-white/15 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                 <span className="text-[10px] font-bold text-[#c4c7c8] uppercase tracking-widest block border-b border-white/5 pb-1">Detailed Config</span>
                 <div className="flex flex-col gap-1.5 text-[10px] text-[#c4c7c8]">
                   <div className="flex justify-between">
                     <span className="opacity-60">Reward Type:</span>
                     <span className="text-white font-semibold capitalize">{node.data?.reward_type || 'physical'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="opacity-60">Reward Value:</span>
                     <span className="text-white font-semibold">{node.data?.value || '—'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="opacity-60">Initial Quantity:</span>
                     <span className="text-white font-semibold">{node.data?.quantity ?? 1}</span>
                   </div>
                 </div>
               </div>
             )}
          </div>
        )}
      </div>

    </motion.div>
  );
}

// Ensure smooth curving
export function CanvasEdges() {
  const edges = useSelector((state: RootState) => state.flow.edges);
  const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNodeId);
  const { scale } = useCanvas();

  return (
    <>
      {edges.map(edge => (
        <Xarrow
          key={edge.id}
          start={edge.source}
          end={edge.target}
          color="#666"
          strokeWidth={2 * scale}
          path="smooth"
          showHead={true}
          headSize={4}
          headColor="#8e9192"
          headShape="arrow1"
          curveness={0.5}
          startAnchor="right"
          endAnchor="left"
        />
      ))}
      {selectedNodeId && selectedNodeId !== 'global' && (
        <Xarrow
          key={`settings-edge-${selectedNodeId}`}
          start={selectedNodeId}
          end="settings-sidebar"
          color="#8FE3FF"
          strokeWidth={1.5 * scale}
          path="straight"
          dashness={{ strokeLen: 4, nonStrokeLen: 4 }}
          showHead={false}
          startAnchor="right"
          endAnchor="left"
        />
      )}
    </>
  );
}
