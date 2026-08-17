'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addNode, selectNode, setFlow } from '@/store/slices/flowSlice';
import { CanvasNode, CanvasEdges } from './CanvasNode';
import { NodeType, FlowState } from '@/lib/types';
import { Xwrapper, useXarrow } from 'react-xarrows';
import { CanvasContext } from './CanvasContext';
import { Minus, Plus, Sparkles, Menu as MenuIcon, Loader2, Focus, Smartphone, Shrink, Expand } from 'lucide-react';
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

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("Canvas layout update warning:", error);
  }
  render() {
    if (this.state.hasError) {
      setTimeout(() => this.setState({ hasError: false }), 200);
      return this.props.children;
    }
    return this.props.children;
  }
}

export function Canvas() {
  const dispatch = useDispatch();
  const router = useRouter();
  const flow = useSelector((state: RootState) => state.flow);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setScale(0.65);
    }
  }, []);

  const [isPanning, setIsPanning] = React.useState(false);
  const panStartRef = React.useRef({ x: 0, y: 0 });

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
        router.push(`/dashboard/automations?welcome=icebreakers`);
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
        router.push(`/dashboard/automations?welcome=persistent_menu`);
      }
    } catch (e: any) {
      console.error("Failed to initialize welcome experience:", e);
      alert("Failed to initialize: " + (e.response?.data?.error || e.message));
    } finally {
      setIsInitializing(false);
    }
  };

  const panRef = React.useRef(pan);
  const scaleRef = React.useRef(scale);

  React.useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  React.useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rAFId: number | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const currentScale = scaleRef.current;
      const currentPan = panRef.current;

      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      let newScale = currentScale + delta;
      newScale = Math.min(Math.max(0.2, newScale), 2);

      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const ratio = 1 - newScale / currentScale;

      const newX = currentPan.x + (cursorX - currentPan.x) * ratio;
      const newY = currentPan.y + (cursorY - currentPan.y) * ratio;

      if (!rAFId) {
        rAFId = requestAnimationFrame(() => {
          setPan({ x: newX, y: newY });
          setScale(newScale);
          rAFId = null;
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const zoomToScale = (newScale: number) => {
    const targetScale = Math.min(Math.max(0.2, newScale), 2);
    const container = containerRef.current;
    const currentScale = scaleRef.current;
    const currentPan = panRef.current;

    if (!container) {
      setScale(targetScale);
      return;
    }

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const ratio = 1 - targetScale / currentScale;

    const newX = currentPan.x + (centerX - currentPan.x) * ratio;
    const newY = currentPan.y + (centerY - currentPan.y) * ratio;

    setPan({ x: newX, y: newY });
    setScale(targetScale);

    if (flow.selectedNodeId) {
      dispatch(selectNode(null));
    }
  };

  const handleFocusFlow = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const defaultScale = isMobile ? 0.65 : 1;
    if (!flow.nodes || flow.nodes.length === 0) {
      setScale(defaultScale);
      setPan({ x: 0, y: 0 });
      return;
    }

    const minX = Math.min(...flow.nodes.map(n => n.position.x));
    const maxX = Math.max(...flow.nodes.map(n => n.position.x + 280));
    const minY = Math.min(...flow.nodes.map(n => n.position.y));
    const maxY = Math.max(...flow.nodes.map(n => n.position.y + 180));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const clientWidth = containerRef.current?.clientWidth || 1200;
    const clientHeight = containerRef.current?.clientHeight || 800;

    const containerCenterX = clientWidth / 2;
    const containerCenterY = clientHeight / 2;

    const targetScale = defaultScale;
    setScale(targetScale);
    setPan({
      x: containerCenterX - centerX * targetScale,
      y: containerCenterY - centerY * targetScale
    });
  };

  const [isPanelCollapsed, setIsPanelCollapsed] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);

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

  // Broadcast zoom level to sidebar
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('zoom-level', { detail: scale }));
  }, [scale]);

  // Listen to zoom control events from sidebar
  React.useEffect(() => {
    const handleZoomIn = () => zoomToScale(scaleRef.current + 0.1);
    const handleZoomOut = () => zoomToScale(scaleRef.current - 0.1);
    const handleZoomReset = () => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      setScale(isMobile ? 0.65 : 1);
      setPan({ x: 0, y: 0 });
    };
    const handleZoomSet = (e: Event) => zoomToScale((e as CustomEvent).detail);
    const handleFocus = () => handleFocusFlow();
    window.addEventListener('canvas-zoom-in', handleZoomIn);
    window.addEventListener('canvas-zoom-out', handleZoomOut);
    window.addEventListener('canvas-zoom-reset', handleZoomReset);
    window.addEventListener('canvas-zoom-set', handleZoomSet);
    window.addEventListener('canvas-focus-flow', handleFocus);
    return () => {
      window.removeEventListener('canvas-zoom-in', handleZoomIn);
      window.removeEventListener('canvas-zoom-out', handleZoomOut);
      window.removeEventListener('canvas-zoom-reset', handleZoomReset);
      window.removeEventListener('canvas-zoom-set', handleZoomSet);
      window.removeEventListener('canvas-focus-flow', handleFocus);
    };
  }, []);

  const isPanningRef = React.useRef(false);

  const touchRef = React.useRef<{
    initialDistance: number;
    initialScale: number;
    initialPan: { x: number; y: number };
    initialMidpoint: { x: number; y: number };
    isPinching: boolean;
  }>({
    initialDistance: 0,
    initialScale: 1,
    initialPan: { x: 0, y: 0 },
    initialMidpoint: { x: 0, y: 0 },
    isPinching: false,
  });

  // Native non-passive touch listeners for smooth 1-finger pan, 2-finger pinch zoom and gesture prevention
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rAFId: number | null = null;
    let pendingPan: { x: number; y: number } | null = null;
    let pendingScale: number | null = null;
    let singleTouchStart: { x: number; y: number } | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = !!(
        target.closest('.pointer-events-auto') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[id^="n_"]') ||
        target.closest('[id^="node-"]')
      );

      if (e.touches.length >= 2) {
        e.preventDefault();
        singleTouchStart = null;
        isPanningRef.current = false;
        setIsPanning(false);
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const mid = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };

        touchRef.current = {
          initialDistance: dist,
          initialScale: scaleRef.current,
          initialPan: { ...panRef.current },
          initialMidpoint: mid,
          isPinching: true,
        };
      } else if (e.touches.length === 1 && !isInteractive) {
        touchRef.current.isPinching = false;
        const t = e.touches[0];
        singleTouchStart = {
          x: t.clientX - panRef.current.x,
          y: t.clientY - panRef.current.y,
        };
        isPanningRef.current = true;
        setIsPanning(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2 && touchRef.current.isPinching) {
        e.preventDefault();
        singleTouchStart = null;
        isPanningRef.current = false;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const mid = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };

        const { initialDistance, initialScale, initialPan, initialMidpoint } = touchRef.current;
        if (initialDistance <= 0) return;

        const zoomRatio = dist / initialDistance;
        let newScale = initialScale * zoomRatio;
        newScale = Math.min(Math.max(0.2, newScale), 2);

        const rect = container.getBoundingClientRect();
        const midX = initialMidpoint.x - rect.left;
        const midY = initialMidpoint.y - rect.top;
        const scaleRatio = 1 - newScale / initialScale;

        const panDeltaX = mid.x - initialMidpoint.x;
        const panDeltaY = mid.y - initialMidpoint.y;

        const newX = initialPan.x + (midX - initialPan.x) * scaleRatio + panDeltaX;
        const newY = initialPan.y + (midY - initialPan.y) * scaleRatio + panDeltaY;

        pendingPan = { x: newX, y: newY };
        pendingScale = newScale;

        if (!rAFId) {
          rAFId = requestAnimationFrame(() => {
            if (pendingScale !== null) setScale(pendingScale);
            if (pendingPan !== null) setPan(pendingPan);
            rAFId = null;
          });
        }
      } else if (e.touches.length === 1 && singleTouchStart && !touchRef.current.isPinching) {
        e.preventDefault();
        const t = e.touches[0];
        const newX = t.clientX - singleTouchStart.x;
        const newY = t.clientY - singleTouchStart.y;

        pendingPan = { x: newX, y: newY };
        if (!rAFId) {
          rAFId = requestAnimationFrame(() => {
            if (pendingPan !== null) setPan(pendingPan);
            rAFId = null;
          });
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        touchRef.current.isPinching = false;
        singleTouchStart = null;
        isPanningRef.current = false;
        setIsPanning(false);
      } else if (e.touches.length === 1) {
        touchRef.current.isPinching = false;
        const t = e.touches[0];
        singleTouchStart = {
          x: t.clientX - panRef.current.x,
          y: t.clientY - panRef.current.y,
        };
      }
    };

    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    container.addEventListener('gesturestart', preventGesture, { passive: false });
    container.addEventListener('gesturechange', preventGesture, { passive: false });
    container.addEventListener('gestureend', preventGesture, { passive: false });

    return () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      container.removeEventListener('gesturestart', preventGesture);
      container.removeEventListener('gesturechange', preventGesture);
      container.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  // Prevent browser window gesture scale on iOS Safari globally
  React.useEffect(() => {
    const preventWindowGesture = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('gesturestart', preventWindowGesture, { passive: false });
    window.addEventListener('gesturechange', preventWindowGesture, { passive: false });
    return () => {
      window.removeEventListener('gesturestart', preventWindowGesture);
      window.removeEventListener('gesturechange', preventWindowGesture);
    };
  }, []);

  React.useEffect(() => {
    const handleMouseUpGlobal = () => {
      isPanningRef.current = false;
      setIsPanning(false);
      touchRef.current.isPinching = false;
    };
    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('blur', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('blur', handleMouseUpGlobal);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || touchRef.current.isPinching) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('.pointer-events-auto') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('[id^="n_"]') ||
      target.closest('[id^="node-"]')
    ) {
      return;
    }
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || touchRef.current.isPinching || !isPanningRef.current) return;
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    isPanningRef.current = false;
    setIsPanning(false);
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
        onPointerCancel={handlePointerUp}
        onDragStart={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.pointer-events-auto')) {
            e.preventDefault();
          }
        }}
        style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px)',
            backgroundSize: `${24 * scale}px ${24 * scale}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />
        <CanvasErrorBoundary>
          <Xwrapper>
            <XarrowUpdater trigger={`${pan.x}-${pan.y}-${scale}`} />
            {flow.nodes.map(node => (
              <CanvasNode key={node.id} id={node.id} />
            ))}
            <CanvasEdges />
          </Xwrapper>
        </CanvasErrorBoundary>

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

        {/* Top Left Smartphone Panel Toggle Button */}
        <div className={`absolute top-3 left-3 z-30 ${isScheduleOpen ? 'hidden sm:block' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('toggle-welcome-panel'));
              if (window.innerWidth < 640) {
                window.dispatchEvent(new CustomEvent('toggle-topbar'));
              }
            }}
            className="flex items-center .bg-[#161622]/90 backdrop-blur-md  rounded-xl p-2 shadow-2xl text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer select-none"
            title={isPanelCollapsed ? "Show Left Panel" : "Hide Left Panel"}
          >
            {isPanelCollapsed ? (
              <Shrink className="w-4 h-4 text-zinc-400" />
            ) : (
              <Expand className="w-4 h-4 text-[#8FE3FF]" />
            )}
          </button>
        </div>

        {/* Zoom Controls Overlay - hidden on mobile when sidebar rail or schedule popover is open */}
        <div
          className={`absolute bottom-6 left-3 sm:left-6 z-30 flex-col sm:flex-row items-center gap-1.5 sm:gap-3 sm:px-4 sm:py-2.5 shadow-2xl select-none ${isScheduleOpen ? 'hidden sm:flex' : (isPanelCollapsed ? 'flex' : 'hidden sm:flex')}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Zoom In — top on mobile vertical layout */}


          <button
            type="button"
            onClick={() => zoomToScale(scale - 0.1)}
            disabled={scale <= 0.2}
            className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all shrink-0"
            title="Zoom Out"
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          {/* Zoom Slider - vertical on mobile, horizontal on desktop */}
          <div className="flex items-center sm:hidden">
            <input
              type="range"
              min="0.2"
              max="2"
              step="0.05"
              value={scale}
              onChange={(e) => zoomToScale(parseFloat(e.target.value))}
              className="appearance-none cursor-pointer accent-white"
              style={{
                writingMode: 'vertical-lr' as any,
                direction: 'rtl' as any,
                height: '72px',
                width: '4px',
                background: `linear-gradient(to top, #ffffff 0%, #ffffff ${((scale - 0.2) / 1.8) * 100}%, #27272a ${((scale - 0.2) / 1.8) * 100}%, #27272a 100%)`
              }}
            />
          </div>
          <div className="hidden sm:flex items-center">
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

          {/* Zoom Out — bottom on mobile vertical layout */}
          <button
            type="button"
            onClick={() => zoomToScale(scale + 0.1)}
            disabled={scale >= 2}
            className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all shrink-0"
            title="Zoom In"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {/* Focus Flow Button */}
          <button
            type="button"
            onClick={handleFocusFlow}
            className="px-1.5 sm:px-2.5 py-1 rounded-lg text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 active:bg-white/10 cursor-pointer transition-all shrink-0 flex items-center gap-1.5"
            title="Focus & Center Flow on UI"
          >
            <Focus className="w-3 h-3 sm:w-4 sm:h-4 text-[#8FE3FF]" />
          </button>

          {/* Reset / Zoom Level Button */}
          <button
            type="button"
            onClick={() => {
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
              setScale(isMobile ? 0.65 : 1);
              setPan({ x: 0, y: 0 });
              if (flow.selectedNodeId) {
                dispatch(selectNode(null));
              }
            }}
            className="px-1.5 sm:px-2 py-1 rounded-lg text-[7px] sm:text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 active:bg-white/10 cursor-pointer transition-all shrink-0 font-mono"
            title="Reset Zoom & Pan"
          >
            {Math.round(scale * 100)}
          </button>
        </div>
      </div>
    </CanvasContext.Provider>
  );
}
