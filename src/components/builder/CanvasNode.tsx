'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateNodePosition, selectNode, updateNodeData } from '@/store/slices/flowSlice';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MessageSquare, Filter, Send, AtSign, Plus } from 'lucide-react';
import Xarrow, { useXarrow } from 'react-xarrows';
import { useCanvas } from './CanvasContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

const NODE_THEMES: Record<string, any> = {
  trigger: {
    pill: 'TRIGGER',
    icon: AtSign,
    title: 'Comments on Post/Reel',
    pillColor: 'bg-white text-black leading-none font-bold',
  },
  condition: {
    pill: 'FILTER',
    icon: Filter,
    title: 'Keyword Match',
    pillColor: 'bg-[#555] text-white leading-none font-bold',
  },
  action: {
    pill: 'ACTION 1',
    icon: MessageSquare,
    title: 'Reply to Comment',
    pillColor: 'bg-[#555] text-white leading-none font-bold',
  }
};

export function CanvasNode({ id }: { id: string }) {
  const dispatch = useDispatch();
  const node = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === id));
  const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNodeId);
  const updateXarrow = useXarrow();
  const { pan, scale } = useCanvas();
  const isDragging = React.useRef(false);

  React.useEffect(() => {
    // Notify Xarrow to connect correctly when the node mounts
    window.dispatchEvent(new CustomEvent('update-xarrow'));
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

  if (node.id === 'n_action2') {
    customPill = 'PRIMARY ACTION';
    customPillColor = 'bg-white text-black font-bold';
    CustomIcon = Send;
    customTitle = 'Send Direct Message';
  }

  if (node.type === 'action' && node.data?.is_placeholder) {
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
        className="absolute w-8 h-8 flex items-center justify-center z-20 pointer-events-auto"
      >
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div
                className="w-8 h-8 rounded-full bg-[#1c1b1b] border-2 border-[#393939] hover:border-white hover:bg-white/10 cursor-pointer pointer-events-auto flex items-center justify-center transition-all shadow-xl backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDragging.current) return;
                  dispatch(updateNodeData({ id: node.id, key: 'is_placeholder', value: false }));
                  updateXarrow();
                }}
              >
                <Plus className="w-4 h-4 text-[#e5e2e1]" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p className="font-semibold text-xs">Add {node.data.action_type === 'send_dm' ? 'Send DM' : 'Reply to Comment'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
        {node.type === 'trigger' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#c4c7c8] uppercase tracking-widest">Target & Media Mode</span>
              <span className="text-sm font-semibold text-white capitalize">
                 {node.data?.target?.mode || node.data?.mode || 'Every'} • {node.data?.target?.media_type || node.data?.media_type || 'Reel or Post'}
              </span>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-[#c4c7c8]">Trigger Method</span>
              <span className="text-xs font-bold text-white bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Automated</span>
            </div>
          </div>
        )}

        {node.type === 'condition' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#c4c7c8] tracking-widest">Match Type</span>
                <span className="text-[10px] px-2 py-0.5 rounded-[4px] font-bold bg-[#E6F1FB] text-[#185FA5] uppercase">
                  {node.data?.match_type || 'Contains'}
                </span>
              </div>
              <p className="text-sm text-[#e5e2e1] leading-relaxed">
                Keywords: {node.data?.keywords?.length > 0 ? (
                  <span className="font-mono text-xs bg-[#333] px-1.5 py-0.5 rounded-sm line-clamp-2">
                    [{node.data.keywords.join(', ')}]
                  </span>
                ) : (
                  <span className="italic text-xs text-[#c4c7c8]">— no filter —</span>
                )}
              </p>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-[#c4c7c8]">Follower Gate</span>
              <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", node.data?.follower_gate ? "bg-[#FCEBEB] text-[#A32D2D]" : "bg-[#F1EFE8] text-[#5F5E5A]")}>
                {node.data?.follower_gate ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>
        )}

        {node.type === 'action' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
               <div className="flex items-center gap-2">
                 <span className="bg-[#F1EFE8] text-[#444441] text-[10px] font-bold px-2 py-0.5 rounded-md">
                   {node.data?.action_type === 'send_dm' ? 'Send DM' : 'Reply Comment'}
                 </span>
                 {node.data?.dm_format && (
                   <span className="bg-[#EEEDFE] text-[#534AB7] text-[10px] font-bold px-2 py-0.5 rounded-md capitalize">
                     {node.data.dm_format.replace('_', ' ')}
                   </span>
                 )}
               </div>
               {node.data?.extra && (
                 <span className="text-[11px] font-semibold text-[#c4c7c8]">{node.data.extra}</span>
               )}
            </div>
            
            {node.data?.rate_limit && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#c4c7c8]">Rate Limit</span>
                <span className="text-xs font-bold text-white uppercase">{node.data.rate_limit.limit} / {node.data.rate_limit.window_seconds}s</span>
              </div>
            )}
            
            {node.data?.messages && (
              <div className="flex flex-col gap-1 px-1 bg-[#262626]/50 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-widest">Messages ({node.data.message_mode || 'random'})</span>
                <span className="text-[11px] text-[#c4c7c8] italic mt-1 line-clamp-2">
                  &quot;{node.data.messages[0]}&quot;
                </span>
              </div>
            )}
          </div>
        )}
        
        {node.type === 'giveaway_config' && (
          <div className="flex flex-col gap-4">
             <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#FAEEDA]" />
                <span className="bg-[#FAEEDA] text-[#854F0B] text-[10px] font-bold px-2 py-0.5 rounded-md self-start uppercase">
                  {node.data?.method?.replace(/_/g, ' ') || 'Random'}
                </span>
                <span className="text-xs text-white font-semibold mt-1">
                  Winners: {node.data?.winners || 1}
                </span>
             </div>
             {node.data?.gamification && (
               <div className="flex items-center justify-between px-1">
                 <span className="text-xs text-[#c4c7c8]">Gamification</span>
                 <span className="text-xs font-bold text-white capitalize">{node.data.gamification.replace('_', ' ')}</span>
               </div>
             )}
             {node.data?.anti_fraud && (
               <div className="flex items-center justify-between px-1">
                 <span className="text-xs text-[#c4c7c8]">Anti-Fraud</span>
                 <span className="text-[10px] font-bold bg-[#EAF3DE] text-[#3B6D11] px-1.5 py-0.5 rounded">Enabled</span>
               </div>
             )}
          </div>
        )}
        
        {node.type === 'reward' && (
          <div className="flex flex-col gap-4">
             <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col text-center">
                <span className="text-2xl mb-1">{node.data?.type === 'physical' ? '🎁' : node.data?.type === 'discount' ? '🏷️' : '✨'}</span>
                <span className="text-sm font-semibold text-white">{node.data?.val || 'Reward'}</span>
                <span className="text-xs text-[#8e9192] mt-1">Qty: {node.data?.qty || 1} ({node.data?.type})</span>
             </div>
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
      {selectedNodeId && (
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
