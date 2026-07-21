'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addNode, selectNode, setFlow } from '@/store/slices/flowSlice';
import { CanvasNode, CanvasEdges } from './CanvasNode';
import { NodeType, FlowState } from '@/lib/types';
import { Xwrapper, useXarrow } from 'react-xarrows';
import { CanvasContext } from './CanvasContext';
import { Minus, Plus, Sparkles, Menu as MenuIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/services/api.service';

// Initial dummy data matching the screenshot
const screenshotFlow: FlowState = {
  id: 'f1',
  name: 'Price Inquiry',
  selectedNodeId: null,
  nodes: [
    {
      id: 'n_trigger',
      type: 'trigger',
      position: { x: 100, y: 150 },
      data: {}
    },
    {
      id: 'n_filter',
      type: 'condition',
      position: { x: 450, y: 150 },
      data: {}
    },
    {
      id: 'n_action1',
      type: 'action',
      position: { x: 900, y: 80 },
      data: { isPrimary: false, action_label: "ACTION 1", is_placeholder: true, action_type: 'reply_comment' }
    },
    {
      id: 'n_action2',
      type: 'action',
      position: { x: 900, y: 280 },
      data: { isPrimary: true, action_label: "PRIMARY ACTION", is_placeholder: true, action_type: 'send_dm' }
    }
  ],
  edges: [
    { id: 'e1', source: 'n_trigger', target: 'n_filter' },
    { id: 'e2', source: 'n_filter', target: 'n_action1' },
    { id: 'e3', source: 'n_filter', target: 'n_action2' }
  ]
};

function XarrowUpdater({ trigger }: { trigger: any }) {
  const updateXarrow = useXarrow();
  React.useEffect(() => {
    updateXarrow();
    
    const handleCustomUpdate = () => updateXarrow();
    window.addEventListener('update-xarrow', handleCustomUpdate);
    return () => window.removeEventListener('update-xarrow', handleCustomUpdate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
}

export function Canvas() {
  const dispatch = useDispatch();
  const router = useRouter();
  const flow = useSelector((state: RootState) => state.flow);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [scale, setScale] = React.useState(1);
  const [isPanning, setIsPanning] = React.useState(false);

  const searchParams = useSearchParams();
  const openTab = searchParams.get('canvas_init');
  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccountId = appUser?.active_instagram_account_id;
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [cardPosition, setCardPosition] = React.useState({ x: 300, y: 150 });
  const isDraggingCard = React.useRef(false);

  // Clear flow in Redux if openTab changes to initialize overlay
  React.useEffect(() => {
    if (openTab) {
      dispatch(setFlow({
        id: '',
        name: openTab === 'icebreakers' ? 'Welcome Message Flow' : 'Persistent Menu Flow',
        nodes: [],
        edges: [],
        selectedNodeId: null,
        mediaPicker: null
      }));
    }
  }, [openTab, dispatch]);
  
  const welcomeParam = searchParams.get('welcome');
  const isWelcomeFlow = flow.name === 'Welcome Message Flow' || flow.name === 'Persistent Menu Flow' || !!welcomeParam;

  // Initialize with sample items if empty and not in Welcome tab config
  React.useEffect(() => {
    if (flow.nodes.length === 0 && !openTab && !isWelcomeFlow) {
      dispatch(setFlow(screenshotFlow));
    }
  }, [dispatch, flow.nodes.length, openTab, isWelcomeFlow]);

  const handleInitializeWelcomeExperience = async () => {
    if (!activeAccountId || !openTab) return;
    setIsInitializing(true);
    try {
      if (openTab === 'icebreakers') {
        const sampleIB = [
          { question: "How can I contact support?", payload: "SUPPORT" }
        ];
        // 1. Cache locally
        const storageKey = `anydm_welcome_settings_${activeAccountId}`;
        localStorage.setItem(storageKey, JSON.stringify({
          welcomePrompt: "Tap to send a question suggested by us",
          iceBreakers: sampleIB,
          composerInputDisabled: false,
          persistentMenuItems: [],
          isSaved: { icebreakers: false, persistent_menu: false }
        }));
        
        // 2. Build initial template nodes client-side
        const triggerId = `node-t-${Date.now()}`;
        const triggerData = {
          is_icebreaker_trigger: true,
          welcome_prompt: "Tap to send a question suggested by us",
          icebreakers: sampleIB
        };
        const triggerNode = {
          id: triggerId,
          type: 'trigger' as const,
          position: { x: 100, y: 200 },
          data: triggerData
        };

        const actionId = `node-a-${Date.now()}-0`;
        const actionNode = {
          id: actionId,
          type: 'action' as const,
          position: { x: 600, y: 150 },
          ruleType: 'dm_automation',
          data: {
            action_type: 'send_dm',
            dm_format: 'text',
            message_mode: 'fixed',
            messages: [`Hello! Customize this reply for: "${sampleIB[0].question}"`],
            parent_event: sampleIB[0].payload,
            parent_label: sampleIB[0].question,
            is_placeholder: true
          }
        };

        const edge = {
          id: `edge-${Date.now()}-0`,
          source: triggerId,
          target: actionId,
          label: sampleIB[0].question
        };

        // 3. Dispatch directly to UI/Redux flow store (keep in UI)
        dispatch(setFlow({
          id: '', // Empty ID: not in DB yet
          name: 'Welcome Message Flow',
          nodes: [triggerNode, actionNode],
          edges: [edge],
          selectedNodeId: null,
          mediaPicker: null
        }));

        // Client-side redirect to open sidebar panel
        router.push(`/dashboard/automations?welcome=icebreakers&from=wellcome`);
      } else {
        const sampleMenu = [
          { type: 'postback', title: 'Talk to Sales', payload: 'TALK_TO_SALES' }
        ];
        // 1. Cache locally
        const storageKey = `anydm_welcome_settings_${activeAccountId}`;
        localStorage.setItem(storageKey, JSON.stringify({
          welcomePrompt: "Tap to send a question suggested by us",
          iceBreakers: [],
          composerInputDisabled: false,
          persistentMenuItems: sampleMenu,
          isSaved: { icebreakers: false, persistent_menu: false }
        }));
        
        // 2. Build initial template nodes client-side
        const triggerId = `node-t-${Date.now()}`;
        const triggerData = {
          is_menu_trigger: true,
          composer_input_disabled: false,
          persistent_menu_items: sampleMenu
        };
        const triggerNode = {
          id: triggerId,
          type: 'trigger' as const,
          position: { x: 100, y: 200 },
          data: triggerData
        };

        const actionId = `node-a-${Date.now()}-0`;
        const actionNode = {
          id: actionId,
          type: 'action' as const,
          position: { x: 600, y: 150 },
          ruleType: 'dm_automation',
          data: {
            action_type: 'send_dm',
            dm_format: 'text',
            message_mode: 'fixed',
            messages: [`Hello! Customize this reply for: "${sampleMenu[0].title}"`],
            parent_event: sampleMenu[0].payload,
            parent_label: sampleMenu[0].title,
            is_placeholder: true
          }
        };

        const edge = {
          id: `edge-${Date.now()}-0`,
          source: triggerId,
          target: actionId,
          label: sampleMenu[0].title
        };

        // 3. Dispatch directly to UI/Redux flow store (keep in UI)
        dispatch(setFlow({
          id: '', // Empty ID: not in DB yet
          name: 'Persistent Menu Flow',
          nodes: [triggerNode, actionNode],
          edges: [edge],
          selectedNodeId: null,
          mediaPicker: null
        }));

        // Client-side redirect to open sidebar panel
        router.push(`/dashboard/automations?welcome=persistent_menu&from=wellcome`);
      }
    } catch (e: any) {
      console.error("Failed to initialize welcome experience:", e);
      alert("Failed to initialize: " + (e.response?.data?.error || e.message));
    } finally {
      setIsInitializing(false);
    }
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      let newScale = scale + delta;
      newScale = Math.min(Math.max(0.2, newScale), 2);
      
      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      
      const ratio = 1 - newScale / scale;
      
      const newX = pan.x + (cursorX - pan.x) * ratio;
      const newY = pan.y + (cursorY - pan.y) * ratio;
      
      setPan({ x: newX, y: newY });
      setScale(newScale);
      
      if (flow.selectedNodeId) {
        dispatch(selectNode(null));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [pan, scale, dispatch, flow.selectedNodeId]);

  const zoomToScale = (newScale: number) => {
    const targetScale = Math.min(Math.max(0.2, newScale), 2);
    const container = containerRef.current;
    if (!container) {
      setScale(targetScale);
      return;
    }

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const ratio = 1 - targetScale / scale;

    const newX = pan.x + (centerX - pan.x) * ratio;
    const newY = pan.y + (centerY - pan.y) * ratio;

    setPan({ x: newX, y: newY });
    setScale(targetScale);

    if (flow.selectedNodeId) {
      dispatch(selectNode(null));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.target as HTMLElement).classList.contains('canvas-container'))) {
      setIsPanning(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as NodeType;
    if (!type) return;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale - 128;
      const y = (e.clientY - rect.top - pan.y) / scale - 40;
      
      dispatch(addNode({ type, position: { x, y } }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <CanvasContext.Provider value={{ pan, scale }}>
      <div 
        className="canvas-container flex-1 relative overflow-hidden bg-[#131313] select-none"
        ref={containerRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => dispatch(selectNode(null))}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px)',
            backgroundSize: `${24 * scale}px ${24 * scale}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />
        <Xwrapper>
          <XarrowUpdater trigger={`${pan.x}-${pan.y}-${scale}`} />
          {flow.nodes.map(node => (
            <CanvasNode key={node.id} id={node.id} />
          ))}
          <CanvasEdges />
        </Xwrapper>

        {/* Welcome Flow Initializer Overlay - Draggable & Zoomable */}
        {openTab && flow.nodes.length === 0 && (
          <motion.div
            drag
            dragMomentum={false}
            onDragStart={() => {
              isDraggingCard.current = true;
            }}
            onDragEnd={(e, info) => {
              setCardPosition(prev => ({
                x: prev.x + info.offset.x / scale,
                y: prev.y + info.offset.y / scale
              }));
              setTimeout(() => { isDraggingCard.current = false; }, 50);
            }}
            initial={{ x: cardPosition.x * scale + pan.x, y: cardPosition.y * scale + pan.y, scale }}
            animate={{ x: cardPosition.x * scale + pan.x, y: cardPosition.y * scale + pan.y, scale }}
            transition={{ duration: 0 }}
            style={{ transformOrigin: '0 0', zIndex: 10 }}
            className="absolute max-w-sm w-[320px] p-6 rounded-[1.25rem] bg-[#1c1b1b]/90 border border-white/10 shadow-2xl text-center space-y-5 backdrop-blur-md pointer-events-auto cursor-grab active:cursor-grabbing select-none"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
              {openTab === 'icebreakers' ? (
                <Sparkles className="w-6 h-6 text-[#8FE3FF]" />
              ) : (
                <MenuIcon className="w-6 h-6 text-[#C084FC]" />
              )}
            </div>
            <div className="space-y-1.5 pointer-events-none">
              <h3 className="text-sm font-bold text-white leading-snug">
                {openTab === 'icebreakers' ? 'Welcome Questions' : 'Persistent Menu'}
              </h3>
              <p className="text-[11px] text-zinc-400 leading-normal">
                {openTab === 'icebreakers'
                  ? 'No welcome questions automation flow has been created. Click below to initialize the sample questions flow.'
                  : 'No persistent menu automation flow has been created. Click below to initialize the sample options flow.'}
              </p>
            </div>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (isDraggingCard.current) return;
                handleInitializeWelcomeExperience();
              }}
              disabled={isInitializing}
              className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/20"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Initialize Flow Template</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Zoom Controls Overlay */}
        <div 
          className="absolute bottom-6 left-6 z-30 flex items-center gap-3 bg-[#161622]/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={() => zoomToScale(scale - 0.1)}
            disabled={scale <= 0.2}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all shrink-0"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Zoom Slider */}
          <div className="flex items-center">
            <input
              type="range"
              min="0.2"
              max="2"
              step="0.05"
              value={scale}
              onChange={(e) => zoomToScale(parseFloat(e.target.value))}
              className="w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-200 transition-all"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${((scale - 0.2) / 1.8) * 100}%, #27272a ${((scale - 0.2) / 1.8) * 100}%, #27272a 100%)`
              }}
            />
          </div>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={() => zoomToScale(scale + 0.1)}
            disabled={scale >= 2}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all shrink-0"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-white/10 mx-1 shrink-0" />

          {/* Reset / Zoom Level Button */}
          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
              if (flow.selectedNodeId) {
                dispatch(selectNode(null));
              }
            }}
            className="px-2 py-1 rounded-lg text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 active:bg-white/10 cursor-pointer transition-all shrink-0 font-mono"
            title="Reset Zoom & Pan"
          >
            {Math.round(scale * 100)}%
          </button>
        </div>
      </div>
    </CanvasContext.Provider>
  );
}
