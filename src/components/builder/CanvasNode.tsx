'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateNodePosition, selectNode, updateNodeData, removeNode, resetToPlaceholder, setLoopBackTarget, EXECUTION_COLUMNS, getNodeExecutionStep, resolveNodePosition, getNodeDimensions } from '@/store/slices/flowSlice';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MessageSquare, Filter, Send, AtSign, Plus, Trophy, Gift, Sparkles, Clock, ChevronDown, Paperclip, X, Film, Headphones, Share2, Heart, Image as ImageIcon, ArrowRightFromLineIcon, FilterIcon, AlertCircle, User, UserCheck, ExternalLink, ShieldCheck, RotateCcw, Ban, SplitIcon } from 'lucide-react';
import Xarrow, { useXarrow } from 'react-xarrows';
import { useCanvas } from './CanvasContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { InstagramProfileCard } from './InstagramProfileCard';

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

let lastAutoPanTime = 0;
export const autoPanOnDragEdge = (e: any) => {
    if (!e || typeof window === 'undefined') return;
    const now = performance.now();
    if (now - lastAutoPanTime < 35) return;
    lastAutoPanTime = now;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? e.point?.x;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? e.point?.y;
    if (clientX === undefined || clientY === undefined) return;

    const containerEl = document.querySelector('.canvas-container');
    const rect = containerEl ? containerEl.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const edgeThresholdX = rect.width * 0.075; // 85% Focus Area (7.5% margin)
    const edgeThresholdY = rect.height * 0.075;
    const panSpeed = 12;

    let panDx = 0;
    let panDy = 0;

    if (relX < edgeThresholdX) panDx = panSpeed;
    else if (relX > rect.width - edgeThresholdX) panDx = -panSpeed;

    if (relY < edgeThresholdY) panDy = panSpeed;
    else if (relY > rect.height - edgeThresholdY) panDy = -panSpeed;

    if (panDx !== 0 || panDy !== 0) {
        window.dispatchEvent(new CustomEvent('pan-canvas', { detail: { dx: panDx, dy: panDy } }));
    }
};

export function CanvasNode({ id }: { id: string }) {
    const dispatch = useDispatch();
    const node = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === id));
    const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNodeId);
    const edges = useSelector((state: RootState) => state.flow.edges);
    const nodes = useSelector((state: RootState) => state.flow.nodes);
    const updateXarrow = useXarrow();
    const { pan, scale } = useCanvas();
    const isDragging = React.useRef(false);
    const lastDragEndTimestamp = React.useRef(0);
    const dragTotalDistance = React.useRef(0);

    const xarrowRafRef = React.useRef<number | null>(null);
    const throttledUpdateXarrow = React.useCallback(() => {
        if (xarrowRafRef.current === null) {
            xarrowRafRef.current = requestAnimationFrame(() => {
                updateXarrow();
                xarrowRafRef.current = null;
            });
        }
    }, [updateXarrow]);

    const wasRecentlyDragged = () => {
        if (isDragging.current) return true;
        if (Date.now() - lastDragEndTimestamp.current < 250) return true;
        if (dragTotalDistance.current > 5) return true;
        return false;
    };
    const [formatMenuOpen, setFormatMenuOpen] = React.useState(false);
    const [activeLoopDragSourceId, setActiveLoopDragSourceId] = React.useState<string | null>(null);
    const formatMenuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleStart = (e: any) => setActiveLoopDragSourceId(e.detail?.sourceId || null);
        const handleEnd = () => setActiveLoopDragSourceId(null);
        window.addEventListener('loop-drag-start', handleStart);
        window.addEventListener('loop-drag-end', handleEnd);
        return () => {
            window.removeEventListener('loop-drag-start', handleStart);
            window.removeEventListener('loop-drag-end', handleEnd);
        };
    }, []);

    React.useEffect(() => {
        if (!activeLoopDragSourceId) return;
        const handleWindowPointerUp = () => {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('loop-drag-end'));
            }, 120);
        };
        window.addEventListener('pointerup', handleWindowPointerUp);
        return () => window.removeEventListener('pointerup', handleWindowPointerUp);
    }, [activeLoopDragSourceId]);

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

    // Sibling/action count calculation
    const incomingEdge = edges.find(e => e.target === node.id);
    const parentNode = incomingEdge ? nodes.find(n => n.id === incomingEdge.source) : null;
    const isParentCondition = parentNode?.type === 'condition';

    let actionCount = 0;
    if (isParentCondition && parentNode) {
        const siblingEdges = edges.filter(e => e.source === parentNode.id);
        const siblingNodeIds = siblingEdges.map(e => e.target);
        const siblingActionNodes = nodes.filter(n => siblingNodeIds.includes(n.id) && n.type === 'action');
        actionCount = siblingActionNodes.length;
    }

    // Execution order positioning constraints: cannot move backward past previous card (1 -> 2 -> 3 -> 4 -> 5)
    const nodeStep = getNodeExecutionStep(node);
    const colConfig = EXECUTION_COLUMNS[nodeStep as keyof typeof EXECUTION_COLUMNS] || EXECUTION_COLUMNS[3];

    const incomingExecEdges = edges.filter(e => e.target === node.id && !e.id.includes('loop') && !e.label?.includes('Loop'));
    const parentExecNodes = nodes.filter(n => incomingExecEdges.some(e => e.source === n.id));
    const parentThreshold = parentExecNodes.length > 0 ? Math.max(...parentExecNodes.map(p => {
        const pWidth = p.data?.is_cf_fork ? 40 : ((p.data?.is_placeholder && !p.data?.messages?.length) ? 155 : 320);
        return p.position.x + pWidth;
    })) + 40 : 0;
    const minAllowedX = Math.max(colConfig.minX, parentThreshold);

    const outgoingExecEdges = edges.filter(e => e.source === node.id && !e.id.includes('loop') && !e.label?.includes('Loop'));
    const childExecNodes = nodes.filter(n => outgoingExecEdges.some(e => e.target === n.id));
    const nodeWidth = (node.data?.is_placeholder && !node.data?.messages?.length) ? 155 : (node.data?.is_cf_fork ? 40 : 320);
    const childThreshold = childExecNodes.length > 0 ? Math.min(...childExecNodes.map(c => c.position.x)) - nodeWidth - 40 : Infinity;
    const maxAllowedX = Math.min(colConfig.maxX, childThreshold);

    const clampNodePosition = (targetX: number, targetY: number) => {
        return resolveNodePosition(node, targetX, targetY, nodes, edges);
    };

    const activeLoopEdge = edges.find(e => e.source === node.id && (e.id.includes('loop') || e.label?.includes('Loop')));
    const loopTargetNode = activeLoopEdge ? nodes.find(n => n.id === activeLoopEdge.target) : null;

    // Determine if this card is a valid loop connection target (strictly previous cards, excluding same execution order step, triggers, filters, profile, comment reply, and sibling branches)
    const isValidLoopTargetCard = React.useMemo(() => {
        if (!activeLoopDragSourceId || activeLoopDragSourceId === node.id) return false;
        const sourceNode = nodes.find(n => n.id === activeLoopDragSourceId);
        if (!sourceNode) return false;

        // 1. Must be a previous card (horizontally before the source node)
        if (node.position.x >= sourceNode.position.x - 50) return false;

        // 3. Branch restriction: If Following cannot connect to If Not Following & vice versa
        const isSourceBranch = sourceNode.data?.is_cf_following || sourceNode.data?.is_cf_not_following;
        const isTargetBranch = node.data?.is_cf_following || node.data?.is_cf_not_following;
        if (isSourceBranch && isTargetBranch) return false;

        // 4. Can't connect to starting trigger
        if (node.type === 'trigger' || node.data?.is_icebreaker_trigger || node.data?.is_menu_trigger) return false;

        // 5. Can't connect to keyword match (filter / condition)
        if (node.type === 'condition') return false;

        // 6. Can't connect to reply comment
        if (node.data?.action_type === 'reply_comment') return false;

        // 7. Can't connect to profile card
        if (node.data?.dm_format === 'show_profile' || node.data?.is_profile_card) return false;

        // 8. Can't connect to another loop back card
        if (node.data?.dm_format === 'loop_back') return false;

        // 9. Valid on action cards (including previous button template, carousel, text, quick reply, etc.)
        if (node.type === 'action') return true;
        return false;
    }, [activeLoopDragSourceId, node, nodes]);

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

            // Special theming for Trigger Event Reply nodes
            if (node.data?.parent_event) {
                if (node.data.dm_format === 'loop_back') {
                    customPill = 'LOOP BACK';
                    customPillColor = 'bg-[#CECBF6] text-[#26215b] font-black leading-none';
                    customTitle = '🔄 Loop to Previous DM';
                    CustomIcon = RotateCcw;
                } else if (node.data.is_cf_following) {
                    customPill = 'FOLLOWING';
                    customPillColor = 'bg-emerald-400 text-black font-extrabold leading-none';
                    customTitle = '✅ If User Is Following';
                } else if (node.data.is_cf_not_following) {
                    customPill = 'NOT FOLLOWING';
                    customPillColor = 'bg-rose-400 text-black font-extrabold leading-none';
                    customTitle = '❌ If User Not Following';
                } else if (node.data.is_cf_gate || node.data.dm_format === 'check_follow') {
                    customPill = 'CHECK FOLLOW';
                    customPillColor = 'bg-[#CECBF6] text-[#26215b] font-black leading-none';
                    customTitle = `Check Follow: ${node.data?.button_name || node.data?.parent_label || '👉 Follow Us'}`;
                } else if (node.data.is_profile_card || node.data.dm_format === 'show_profile') {
                    customPill = 'INSTAGRAM';
                    customPillColor = 'bg-cyan-400 text-black font-extrabold leading-none';
                    customTitle = '👤 Show Profile View';
                } else if (node.data.parent_event === 'TRACK_ORDER') {
                    if (node.data.is_track_prompt) {
                        customPill = 'TRACK PROMPT';
                        customPillColor = 'bg-indigo-600 text-white font-bold leading-none tracking-widest hidden';
                        customTitle = '💬 Ask for Order ID';
                    } else if (node.data.is_track_input) {
                        customPill = 'CUSTOMER REPLY';
                        customPillColor = 'bg-indigo-500/90 text-white font-bold leading-none tracking-widest hidden';
                        customTitle = '📥 User Sends Order ID';
                    } else if (node.data.is_track_response) {
                        customPill = 'DYNAMIC REPLY';
                        customPillColor = 'bg-emerald-600 text-white font-bold leading-none tracking-widest hidden';
                        customTitle = '📊 Returns Details / Error';
                    } else {
                        customPill = 'TRACK ORDER';
                        customPillColor = 'bg-indigo-600 text-white font-bold leading-none tracking-widest hidden';
                        customTitle = '🔍 Order Tracking';
                    }
                } else {
                    customPill = 'EVENT REPLY';
                    customPillColor = 'bg-[#c4c0ff] text-[#0a3240] leading-none font-bold';
                    customTitle = `Reply: ${node.data.parent_label || 'Event'}`;
                }
            }
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
        if (node.data?.is_icebreaker_trigger) {
            customTitle = 'Suggested Questions';
        } else if (node.data?.is_menu_trigger) {
            customTitle = 'Persistent Menu Navigation';
        } else {
            const isShare = node.ruleType?.includes('share');
            const isDM = node.ruleType?.includes('dm');
            const isStory = node.ruleType?.includes('story');
            customTitle = isShare ? 'User Shares Post/Reel' : (isDM ? 'DM Incoming Trigger' : (isStory ? 'Story Reply Trigger' : 'Comments on Post/Reel'));
        }
    }

    const d = node.data || {};
    const isBranchNode = Boolean(node.data?.is_cf_following || node.data?.is_cf_not_following);
    const hasConfiguredData =
        !node.data?.is_placeholder &&
        ((d.messages && d.messages.length > 0) ||
        (d.dm_format && d.dm_format !== 'text') ||
        (d.quick_replies_titles && d.quick_replies_titles.length > 0) ||
        (d.button_template_buttons_json && String(d.button_template_buttons_json).trim() !== '') ||
        (d.generic_template_elements_json && String(d.generic_template_elements_json).trim() !== '') ||
        (d.action_type && d.action_type !== 'send_dm' && d.action_type !== 'reply_comment'));

    if (node.type === 'action' && (node.data?.is_placeholder || (isBranchNode && node.data?.is_placeholder !== false)) && !hasConfiguredData && node.data?.parent_event !== 'TRACK_ORDER') {
        const isSendDM = node.data.action_type === 'send_dm' || !node.data.action_type;

        // Render direct format dropdown menu for single Send DM or Follower Gate branches
        if (isSendDM && (actionCount <= 1 || isBranchNode)) {
            // If it is Send DM / Follower Gate branch, render the dropdown list directly as the node.
            return (
                <motion.div
                    id={node.id}
                    drag={!activeLoopDragSourceId}
                    dragMomentum={false}
                    onDrag={(e, info) => {
                        dragTotalDistance.current += Math.hypot(info.delta.x, info.delta.y);
                        autoPanOnDragEdge(e);
                        throttledUpdateXarrow();
                    }}
                    onDragStart={() => {
                        isDragging.current = true;
                        dragTotalDistance.current = 0;
                        dispatch(selectNode(null));
                    }}
                    onDragEnd={(e, info) => {
                        const rawX = node.position.x + info.offset.x / scale;
                        const rawY = node.position.y + info.offset.y / scale;
                        const clamped = clampNodePosition(rawX, rawY);
                        dispatch(updateNodePosition({
                            id: node.id,
                            position: clamped
                        }));
                        throttledUpdateXarrow();
                        lastDragEndTimestamp.current = Date.now();
                        setTimeout(() => {
                            isDragging.current = false;
                            dragTotalDistance.current = 0;
                        }, 250);
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Container click does not open popup; only single clicking an item from the 5-list opens its popup
                    }}
                    initial={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
                    animate={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
                    transition={{ duration: 0 }}
                    style={{ transformOrigin: '0 0', zIndex: isSelected ? 20 : 1 }}
                    className="absolute z-20 pointer-events-auto flex flex-col cursor-grab active:cursor-grabbing"
                >
                    <div className={cn(
                        "bg-[#161622]/95 border rounded-xl shadow-2xl overflow-hidden z-[200] flex flex-col w-[155px] animate-fadeIn transition-all select-none",
                        node.data?.validationError
                            ? "border-rose-500 ring-2 ring-rose-500/60 shadow-rose-500/20 animate-shake"
                            : node.data?.is_cf_following
                                ? "border-emerald-500/40 ring-1 ring-emerald-500/30"
                                : node.data?.is_cf_not_following
                                    ? "border-rose-500/40 ring-1 ring-rose-500/30"
                                    : "border-white/10"
                    )}>
                        <div className={cn(
                            "px-3 py-2 border-b text-center select-none shrink-0 flex flex-col gap-0.5",
                            node.data?.is_cf_following
                                ? "bg-emerald-950/40 border-emerald-500/30"
                                : node.data?.is_cf_not_following
                                    ? "bg-rose-950/40 border-rose-500/30"
                                    : "bg-white/5 border-white/10"
                        )}>
                            {node.data?.is_cf_following && (
                                <span className="text-[10px] font-extrabold text-emerald-400 tracking-wide flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> If Following
                                </span>
                            )}
                            {node.data?.is_cf_not_following && (
                                <span className="text-[10px] font-extrabold text-rose-400 tracking-wide flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" /> If Not Following
                                </span>
                            )}
                            <span className={cn("text-[9px] font-bold tracking-wider uppercase", node.data?.validationError ? "text-rose-400" : "text-zinc-400")}>
                                Message Type
                            </span>
                            {node.data?.validationError && (
                                <span className="text-[8.5px] font-semibold text-rose-300">
                                    Selection Required
                                </span>
                            )}
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
                                        if (wasRecentlyDragged()) return;
                                        dispatch(selectNode({ id: node.id, rect: null }));
                                        dispatch(updateNodeData({ id: node.id, key: 'dm_format', value: opt.value }));
                                        dispatch(updateNodeData({ id: node.id, key: 'is_placeholder', value: false }));
                                        dispatch(updateNodeData({ id: node.id, key: 'validationError', value: null }));
                                        setTimeout(() => {
                                            window.dispatchEvent(new CustomEvent('update-xarrow'));
                                        }, 50);

                                        setTimeout(() => {
                                            window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                                detail: { nodeId: node.id }
                                            }));
                                        }, 50);
                                    }}
                                    className="w-full px-3 py-2 text-center text-xs hover:bg-white/10 transition-colors cursor-pointer text-zinc-200 font-semibold active:bg-white/20"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Downward Loop-Back Connector Handle (~1cm stem + arrow) */}
                    <div className="flex flex-col items-center mt-2 select-none pointer-events-auto">
                        <div className="w-[1.5px] h-4 bg-gradient-to-b from-[#c4c0ff]/60 to-[#c4c0ff]" />
                        <div className="relative">
                            <button
                                type="button"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    if (loopTargetNode) {
                                        window.dispatchEvent(new CustomEvent('focus-loop-nodes', { detail: { sourceId: node.id, targetId: loopTargetNode.id } }));
                                    } else {
                                        e.preventDefault();
                                        window.dispatchEvent(new CustomEvent('loop-drag-start', { detail: { sourceId: node.id, mousePos: { x: e.clientX, y: e.clientY } } }));
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (loopTargetNode) {
                                        window.dispatchEvent(new CustomEvent('focus-loop-nodes', { detail: { sourceId: node.id, targetId: loopTargetNode.id } }));
                                    } else if (activeLoopDragSourceId === node.id) {
                                        window.dispatchEvent(new CustomEvent('loop-drag-end'));
                                    } else {
                                        window.dispatchEvent(new CustomEvent('loop-drag-start', { detail: { sourceId: node.id, mousePos: { x: e.clientX, y: e.clientY } } }));
                                    }
                                }}
                                title={loopTargetNode ? `Loop active: connected to ${loopTargetNode.data?.parent_label || loopTargetNode.id}` : "Click and drag to stretch wire to previous card"}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9.5px] font-bold border backdrop-blur-md shadow-2xl transition-all cursor-crosshair active:scale-95",
                                    activeLoopDragSourceId === node.id
                                        ? "bg-purple-600 border-white text-white ring-2 ring-[#c4c0ff] scale-105"
                                        : loopTargetNode
                                            ? "bg-[#1e1b4b] border-[#c4c0ff] text-[#c4c0ff] hover:bg-[#2e2b6b]"
                                            : "bg-[#161622] border-white/20 text-zinc-300 hover:border-[#c4c0ff] hover:text-[#c4c0ff]"
                                )}
                            >
                                <RotateCcw className={cn("w-3 h-3 shrink-0", activeLoopDragSourceId === node.id ? "animate-spin" : "")} />
                                <span className="whitespace-nowrap">
                                    {activeLoopDragSourceId === node.id
                                        ? "Stretching Wire... Drop on Input"
                                        : loopTargetNode
                                            ? `Loop: ${loopTargetNode.data?.parent_label || loopTargetNode.data?.action_label || 'Connected Card'}`
                                            : 'Back Loop'}
                                </span>
                                {loopTargetNode && activeLoopDragSourceId !== node.id && (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(setLoopBackTarget({ sourceId: node.id, targetId: '' }));
                                            setTimeout(() => window.dispatchEvent(new CustomEvent('update-xarrow')), 50);
                                        }}
                                        className="ml-1 hover:text-rose-400 p-0.5 cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            );
        }
        // For reply_comment or multiple wireframes: render placeholder pill + plus button
        return (
            <motion.div
                id={node.id}
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                    dragTotalDistance.current += Math.hypot(info.delta.x, info.delta.y);
                    autoPanOnDragEdge(e);
                    throttledUpdateXarrow();
                }}
                onDragStart={() => {
                    isDragging.current = true;
                    dragTotalDistance.current = 0;
                    dispatch(selectNode(null));
                }}
                onDragEnd={(e, info) => {
                    const rawX = node.position.x + info.offset.x / scale;
                    const rawY = node.position.y + info.offset.y / scale;
                    const clamped = clampNodePosition(rawX, rawY);
                    dispatch(updateNodePosition({
                        id: node.id,
                        position: clamped
                    }));
                    throttledUpdateXarrow();
                    lastDragEndTimestamp.current = Date.now();
                    setTimeout(() => {
                        isDragging.current = false;
                        dragTotalDistance.current = 0;
                    }, 250);
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                initial={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
                animate={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
                transition={{ duration: 0 }}
                style={{ transformOrigin: '0 0', zIndex: isSelected ? 20 : 1 }}
                className="absolute flex items-center gap-2 z-20 pointer-events-auto animate-fadeIn"
                ref={isSendDM ? formatMenuRef : undefined}
            >
                {/* Wireframe type label before the plus icon */}
                <span className={cn(
                    "text-[9px] font-extrabold px-2.5 py-1 rounded-md tracking-wider border backdrop-blur-md shadow-lg select-none shrink-0",
                    isSendDM
                        ? "bg-[#B5D4F4]/15 border-[#B5D4F4]/30 text-[#89bdf0]"
                        : "bg-[#CECBF6]/15 border-[#CECBF6]/30 text-[#9b94e3]"
                )}>
                    {isSendDM ? "Reply DM" : "Reply Comment"}
                </span>

                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full bg-[#1c1b1b] border-2 cursor-pointer flex items-center justify-center transition-all shadow-xl backdrop-blur-md shrink-0",
                                    node.data?.validationError
                                        ? "border-rose-500 ring-2 ring-rose-500/50 shadow-rose-500/20 animate-shake bg-rose-500/10"
                                        : "border-[#393939] hover:border-white hover:bg-white/10"
                                    )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (wasRecentlyDragged()) return;
                                    if (isSendDM) {
                                        setFormatMenuOpen(!formatMenuOpen);
                                    } else {
                                        dispatch(selectNode({ id: node.id, rect: null }));
                                        dispatch(updateNodeData({ id: node.id, key: 'is_placeholder', value: false }));
                                        updateXarrow();
                                        setTimeout(() => {
                                            window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                                detail: { nodeId: node.id }
                                            }));
                                        }, 50);
                                    }
                                }}
                            >
                                <Plus className={cn("w-4 h-4", node.data?.validationError ? "text-rose-400" : "text-[#e5e2e1]")} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="ml-2 bg-rose-950 border border-rose-500/50 text-rose-200">
                            <p className="font-semibold text-xs">
                                {node.data?.validationError ? (node.data.validationError as string) : (isSendDM ? 'Choose DM Format' : `Add Reply to Comment`)}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>



                {isSendDM && formatMenuOpen && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#161622]/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[200] flex flex-col w-[150px] animate-fadeIn">
                        <div className="px-3 py-2 bg-white/5 border-b border-white/10 text-center select-none shrink-0">
                            <span className="text-[10px] font-bold text-zinc-400 tracking-wider">
                                Reply Type
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
                                        if (wasRecentlyDragged()) return;
                                        dispatch(selectNode({ id: node.id, rect: null }));
                                        dispatch(updateNodeData({ id: node.id, key: 'dm_format', value: opt.value }));
                                        dispatch(updateNodeData({ id: node.id, key: 'is_placeholder', value: false }));
                                        setFormatMenuOpen(false);
                                        setTimeout(() => {
                                            window.dispatchEvent(new CustomEvent('update-xarrow'));
                                        }, 50);

                                        setTimeout(() => {
                                            window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                                detail: { nodeId: node.id }
                                            }));
                                        }, 50);
                                    }}
                                    className="w-full px-3 py-2.5 text-center text-xs hover:bg-white/5 transition-colors cursor-pointer text-zinc-200 font-semibold active:bg-white/20"
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

    if (node.data?.is_cf_fork) {
        return (
            <motion.div
                id={node.id}
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                    dragTotalDistance.current += Math.hypot(info.delta.x, info.delta.y);
                    autoPanOnDragEdge(e);
                    throttledUpdateXarrow();
                }}
                onDragStart={() => {
                    isDragging.current = true;
                    dragTotalDistance.current = 0;
                }}
                onDragEnd={(e, info) => {
                    const rawX = node.position.x + info.offset.x / scale;
                    const rawY = node.position.y + info.offset.y / scale;
                    const clamped = clampNodePosition(rawX, rawY);
                    dispatch(updateNodePosition({
                        id: node.id,
                        position: clamped
                    }));
                    throttledUpdateXarrow();
                    lastDragEndTimestamp.current = Date.now();
                    setTimeout(() => {
                        isDragging.current = false;
                        dragTotalDistance.current = 0;
                    }, 250);
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                initial={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale: 1 }}
                animate={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale: 1 }}
                transition={{ duration: 0 }}
                style={{ transformOrigin: '0 0', zIndex: 5 }}
                className="absolute flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#c4c0ff]/30 bg-[#161622] text-[#c4c0ff] text-[10px] font-bold whitespace-nowrap backdrop-blur-sm shadow-2xl cursor-grab active:cursor-grabbing pointer-events-auto hover:border-[#c4c0ff] transition-colors"
            >
                <SplitIcon className="w-3.5 h-3.5 text-[#c4c0ff] shrink-0" />
                {/* <span className="leading-tight">{node.data?.button_name || '👉 Follow Us'}</span> */}
            </motion.div>
        );
    }

    const isProfileCardNode = Boolean(
        !node.data?.is_cf_following &&
        !node.data?.is_cf_not_following &&
        !node.data?.is_cf_fork &&
        (
            node.data?.is_profile_card ||
            node.data?.dm_format === 'show_profile' ||
            node.data?.dm_format === 'check_follow' ||
            node.data?.is_cf_gate
        )
    );

    if (isProfileCardNode) {
        return (
            <motion.div
                id={node.id}
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                    dragTotalDistance.current += Math.hypot(info.delta.x, info.delta.y);
                    autoPanOnDragEdge(e);
                    throttledUpdateXarrow();
                }}
                onDragStart={() => {
                    isDragging.current = true;
                    dragTotalDistance.current = 0;
                    dispatch(selectNode(null));
                }}
                onDragEnd={(e, info) => {
                    const rawX = node.position.x + info.offset.x / scale;
                    const rawY = node.position.y + info.offset.y / scale;
                    const clamped = clampNodePosition(rawX, rawY);
                    dispatch(updateNodePosition({
                        id: node.id,
                        position: clamped
                    }));
                    throttledUpdateXarrow();
                    lastDragEndTimestamp.current = Date.now();
                    setTimeout(() => {
                        isDragging.current = false;
                        dragTotalDistance.current = 0;
                    }, 250);
                }}
                initial={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
                animate={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
                transition={{ duration: 0 }}
                style={{ transformOrigin: '0 0', zIndex: isSelected ? 10 : 1 }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (wasRecentlyDragged()) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    dispatch(selectNode({
                        id: node.id,
                        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                    }));
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                            detail: { nodeId: node.id }
                        }));
                    }, 50);
                }}
                className="absolute w-[320px] cursor-pointer pointer-events-auto select-none"
            >
                <InstagramProfileCard
                    size="canvas"
                    className={cn(
                        node.data?.validationError ? "ring-2 ring-rose-500 shadow-rose-500/30 animate-shake" : "",
                        isSelected && !node.data?.validationError ? "ring-2 ring-[#c4c0ff]/60 border-[#c4c0ff]/60" : ""
                    )}
                />
            </motion.div>
        );
    }

    const isEventReply = node.type === 'action' && !!node.data?.parent_event;

    return (
        <motion.div
            id={node.id}
            drag
            dragMomentum={false}
            onDrag={(e, info) => {
                dragTotalDistance.current += Math.hypot(info.delta.x, info.delta.y);
                autoPanOnDragEdge(e);
                throttledUpdateXarrow();
            }}
            onDragStart={() => {
                isDragging.current = true;
                dragTotalDistance.current = 0;
                dispatch(selectNode(null));
            }}
            onDragEnd={(e, info) => {
                const rawX = node.position.x + info.offset.x / scale;
                const rawY = node.position.y + info.offset.y / scale;
                const clamped = clampNodePosition(rawX, rawY);
                dispatch(updateNodePosition({
                    id: node.id,
                    position: clamped
                }));
                throttledUpdateXarrow();
                lastDragEndTimestamp.current = Date.now();
                setTimeout(() => {
                    isDragging.current = false;
                    dragTotalDistance.current = 0;
                }, 250);
            }}
            initial={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
            animate={{ x: node.position.x * scale + pan.x, y: node.position.y * scale + pan.y, scale }}
            transition={{ duration: 0 }}
            style={{ transformOrigin: '0 0', zIndex: isSelected ? 10 : 1 }}
            onClick={(e) => {
                e.stopPropagation();
                if (wasRecentlyDragged()) return;
                const rect = e.currentTarget.getBoundingClientRect();
                dispatch(selectNode({
                    id: node.id,
                    rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                }));
                if ((node.type === 'action' || node.type === 'condition' || node.type === 'trigger') && node.data?.parent_event !== 'TRACK_ORDER') {
                    setTimeout(() => {
                        if (node.type === 'trigger' && (node.data?.is_icebreaker_trigger || node.data?.is_menu_trigger)) {
                            return;
                        }
                        const eventName = node.type === 'trigger' ? 'open-trigger-editor' : 'open-dm-format-editor';
                        window.dispatchEvent(new CustomEvent(eventName, {
                            detail: { nodeId: node.id }
                        }));
                    }, 50);
                }
            }}
            className={cn(
                "absolute flex flex-col w-[320px] rounded-[1.25rem] border-[1px] cursor-pointer shadow-2xl pointer-events-auto transition-colors",
                "backdrop-blur-[20px] bg-[#1c1b1b]/60",
                node.data?.validationError
                    ? "border-rose-500 ring-2 ring-rose-500/60 shadow-rose-500/20"
                    : isEventReply
                        ? "border-[#c4c0ff]/20 hover:border-[#c4c0ff]/40"
                        : "border-white/10 hover:border-white/20",
                isSelected && !node.data?.validationError
                    ? (isEventReply ? "ring-2 ring-[#c4c0ff]/20 border-[#c4c0ff]/40" : "ring-2 ring-white/20 border-white/30")
                    : "hover:bg-[#1c1b1b]/70"
            )}
        >
            <div className={cn("w-full flex flex-col h-full", node.data?.validationError ? "animate-shake" : "")}>
                {node.type === 'action' &&
                    node.data?.parent_event !== 'TRACK_ORDER' &&
                    !node.data?.is_profile_card &&
                    !node.data?.is_cf_gate &&
                    !node.data?.is_cf_fork &&
                    node.data?.dm_format !== 'check_follow' &&
                    node.data?.dm_format !== 'show_profile' && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch(resetToPlaceholder(node.id));
                                setTimeout(() => {
                                    window.dispatchEvent(new CustomEvent('update-xarrow'));
                                }, 50);
                            }}
                            className="absolute top-3 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-all z-30"
                            title="Remove Wireframe"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                {/* Overlapping Pill */}
                <div className="absolute -top-3 left-4 flex gap-2">
                    <span className={cn("px-3 py-1.5 rounded-full text-[10px] justify-center items-center flex tracking-widest leading-none outline outline-[#131313] outline-[4px]", customPillColor)}>
                        {customPill}
                    </span>
                    {node.data?.parent_event && (
                        <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-black  border border-[#c4c0ff]/30 text-white outline outline-[#131313] outline-[4px]  tracking-wider">
                            {node.data?.parent_label || 'Trigger'}
                        </span>
                    )}
                </div>

                <div className="p-5 pt-8">
                    {node.data?.validationError && (
                        <div className="mb-4 px-3 py-2 bg-rose-500/15 border border-rose-500/40 rounded-lg text-rose-300 text-[11px] font-medium flex items-start gap-2 shadow-lg animate-fadeIn">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{node.data.validationError}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-[0.4rem] bg-[#2a2a2a] flex items-center justify-center border border-white/5">
                            <ArrowRightFromLineIcon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-[17px] font-bold text-white tracking-tight">{customTitle}</h4>
                    </div>

                    {/* Node Content Variations based on type and dynamic data */}
                    {node.type === 'trigger' && (() => {
                        if (node.data?.is_icebreaker_trigger) {
                            return (
                                <div className="flex flex-col gap-3 text-xs w-full">
                                    <div className="bg-black/35 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                                        {/* <span className="text-[10px] font-bold text-[#8FE3FF] tracking-widest block mb-1">💬 Suggested Questions (Icebreakers)</span> */}
                                        {node.data?.welcome_prompt && (
                                            <div className="text-[10px] text-zinc-400 italic mb-1.5 font-medium border-b border-white/5 pb-1 text-center">
                                                {node.data.welcome_prompt}
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-1.5">
                                            {(node.data?.icebreakers || []).map((ib: any, idx: number) => (
                                                <div key={idx} className="bg-white/5 border border-[#444748] rounded-lg p-2.5 text-left text-xs font-semibold text-white flex items-center justify-between gap-3">
                                                    <span>{ib.question || `Question ${idx + 1}`}</span>
                                                    {/* <span className="text-[8px] bg-[#8FE3FF]/10 text-[#8FE3FF] border border-[#8FE3FF]/20 px-1 py-0.2 rounded font-mono shrink-0 ">{ib.payload}</span> */}
                                                </div>
                                            ))}
                                            {(!node.data?.icebreakers || node.data.icebreakers.length === 0) && (
                                                <span className="text-zinc-550 italic text-[11px]">No questions configured.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (node.data?.is_menu_trigger) {
                            return (
                                <div className="flex flex-col gap-3 text-xs w-full">
                                    <div className="bg-black/35 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                                        <span className="text-[10px] font-bold text-[#C084FC] tracking-widest block mb-1">🍔 Persistent Menu Actions</span>
                                        {node.data?.composer_input_disabled && (
                                            <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 self-start font-bold tracking-wider mb-1">
                                                Composer Input Disabled
                                            </span>
                                        )}
                                        <div className="flex flex-col gap-1.5">
                                            {(node.data?.persistent_menu_items || []).map((item: any, idx: number) => (
                                                <div key={idx} className="bg-white/5 border border-[#444748] rounded-lg p-2.5 text-left text-xs font-semibold text-white flex items-center justify-between gap-3">
                                                    <span className="truncate">{item.title || `Button ${idx + 1}`}</span>
                                                    {/* <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1 py-0.2 rounded font-mono shrink-0 ">
                                                    {item.type === 'web_url' ? 'URL' : item.payload || 'POSTBACK'}
                                                </span> */}
                                                </div>
                                            ))}
                                            {(!node.data?.persistent_menu_items || node.data.persistent_menu_items.length === 0) && (
                                                <span className="text-zinc-550 italic text-[11px]">No menu buttons configured.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        const isStoryRule = node.ruleType?.includes('story');
                        const isShareRule = node.ruleType?.includes('share');
                        const isStandardDMRule = node.ruleType?.includes('dm') && !isShareRule;

                        if (isStandardDMRule) {
                            return (
                                <div className="flex flex-col gap-3 text-xs">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5">
                                        <span className="text-[10px] font-bold text-[#c4c7c8] tracking-widest">Trigger Event</span>
                                        <span className="text-sm font-semibold text-white">
                                            User Sends a Direct Message
                                        </span>
                                        <span className="text-[11px] text-zinc-400 leading-snug">
                                            Triggers when a customer sends a message to your Instagram DM inbox.
                                        </span>
                                    </div>
                                </div>
                            );
                        }

                        let displayTarget = 'Every Post / Reel';
                        const isSelectedMode = (node.data?.target_mode || node.data?.mode) === 'selected';
                        if (isStoryRule) {
                            displayTarget = isSelectedMode ? 'Selected Stories Only' : 'Every Story';
                        } else if (isShareRule) {
                            displayTarget = isSelectedMode ? 'Selected Media Only' : 'Every Post / Reel';
                        } else {
                            displayTarget = isSelectedMode ? 'Selected Media Only' : 'Every Post / Reel';
                        }
                        return (
                            <div className="flex flex-col gap-3 text-xs">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                                    <span className="text-[10px] font-bold text-[#c4c7c8] tracking-widest">Target & Media</span>
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
                                        <span className="text-[10px] font-bold text-[#c4c7c8] tracking-widest block border-b border-white/5 pb-1">Trigger Config</span>
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
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (wasRecentlyDragged()) return;
                                    window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                        detail: { nodeId: node.id }
                                    }));
                                }}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 hover:bg-[#CECBF6]/5 hover:border-[#CECBF6]/40 cursor-pointer transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-[#c4c7c8] tracking-widest">Match Type</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-[4px] font-bold bg-[#E6F1FB] text-[#185FA5] ">
                                        {node.ruleType?.includes('share') ? 'Auto Share Match' : (node.data?.match_type || 'Contains')}
                                    </span>
                                </div>
                                <p className="text-xs text-[#e5e2e1] leading-relaxed">
                                    {node.ruleType?.includes('share') ? (
                                        <span className="italic text-xs text-[#c4c7c8]">— Triggers on Post/Reel Share (No keyword required) —</span>
                                    ) : node.data?.match_type === 'any' ? (
                                        <span className="italic text-xs text-[#c4c7c8]">— any message —</span>
                                    ) : (
                                        <>
                                            Keywords: {(() => {
                                                const kws = node.data?.match_type === 'equals' ? node.data?.keywords_equals : node.data?.keywords;
                                                return kws?.length > 0 ? (
                                                    <span className="font-mono text-[10px] bg-[#222] px-1.5 py-0.5 rounded-sm line-clamp-2 mt-1 block">
                                                        [{kws.join(', ')}]
                                                    </span>
                                                ) : (
                                                    <span className="italic text-xs text-[#c4c7c8]">— any message —</span>
                                                );
                                            })()}
                                        </>
                                    )}
                                </p>
                            </div>

                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (wasRecentlyDragged()) return;
                                    window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                        detail: { nodeId: node.id }
                                    }));
                                }}
                                className="bg-[#2a2a2a]/30 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1.5 hover:bg-[#CECBF6]/5 hover:border-[#CECBF6]/40 cursor-pointer transition-all"
                            >
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
                                    <span className="text-[10px] font-bold text-[#c4c7c8] tracking-widest block border-b border-white/5 pb-1">Detailed Config</span>
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

                    {node.type === 'action' && node.data?.parent_event === 'TRACK_ORDER' && (
                        <div className="flex flex-col gap-2.5 text-xs font-semibold">
                            {node.data.is_track_prompt && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5 animate-fadeIn">
                                    {/* <span className="text-[9px] text-zinc-500 tracking-widest font-extrabold">System DM Prompt</span> */}
                                    <p className="text-zinc-200 font-mono text-[10.5px] bg-black/35 p-2.5 rounded border border-white/5 whitespace-pre-line leading-relaxed">
                                        &quot;Please reply with your Order ID to track your order. 📦&quot;
                                    </p>
                                </div>
                            )}

                            {node.data.is_track_input && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2.5 animate-fadeIn">
                                    {/* <span className="text-[9px] text-zinc-500 tracking-widest font-extrabold">Expected Action</span> */}
                                    <div className="text-zinc-305 font-medium text-[10.5px] flex flex-col gap-1.5 bg-black/25 p-2.5 rounded border border-white/5">
                                        <div>• Customer replies with Order ID</div>
                                        <div>• Session captures input dynamically</div>
                                    </div>
                                </div>
                            )}

                            {node.data.is_track_response && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2.5 animate-fadeIn">
                                    {/* <span className="text-[9px] text-zinc-500 tracking-widest font-extrabold font-extrabold block mb-0.5">Database Check Responses</span> */}
                                    <div className="grid grid-cols-1 gap-2 text-[9px] font-semibold leading-relaxed">
                                        <div className="text-green-200 font-medium text-[10.5px] flex flex-col gap-1.5 bg-black/25 p-2.5 rounded border border-white/5">
                                            Returns live order status
                                        </div>
                                        <div className='w-full flex justify-center text-[12.5px]'>
                                            or
                                        </div>
                                        <div className="text-red-200 font-medium text-[10.5px] flex flex-col gap-1.5 bg-black/25 p-2.5 rounded border border-white/5">
                                            Prompts customer to check ID and retry
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {node.type === 'action' && node.data?.parent_event !== 'TRACK_ORDER' && (
                        <div className="flex flex-col gap-3 text-xs">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="bg-[#F1EFE8] text-[#444441] text-[9px] font-bold px-2 py-0.5 rounded-md ">
                                        {node.data?.action_type?.replace('_', ' ') || 'Reply Comment'}
                                    </span>
                                    {node.data?.dm_format && (
                                        <span className="bg-[#EEEDFE] text-[#534AB7] text-[9px] font-bold px-2 py-0.5 rounded-md ">
                                            {node.data.dm_format.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>

                                {node.data?.messages?.length > 0 && (node.data?.action_type !== 'send_dm' || node.data?.dm_format === 'text') && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (wasRecentlyDragged()) return;
                                            window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                                detail: { nodeId: node.id }
                                            }));
                                        }}
                                        className="bg-[#262626]/50 p-2 rounded-lg border border-white/5 hover:border-[#c4c0ff]/45 hover:bg-[#c4c0ff]/5 cursor-pointer transition-all"
                                    >
                                        <span className="text-[9px] font-bold text-on-surface-variant tracking-widest block mb-0.5">
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
                                        if (wasRecentlyDragged()) return;
                                        window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                            detail: { nodeId: node.id }
                                        }));
                                    }}
                                    className="bg-black/35 hover:bg-[#c4c0ff]/5 border border-white/5 hover:border-[#c4c0ff]/45 rounded-xl p-3 flex flex-col gap-2.5 transition-all text-[11px]"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        {/* <span className="text-[9px] font-bold text-zinc-500 tracking-wider block">Message Prompt:</span> */}
                                        <span className="text-zinc-200 font-semibold">{node.data.quick_reply_text}</span>
                                    </div>
                                    {node.data.quick_replies_titles && (
                                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/5">
                                            {node.data.quick_replies_titles.map((t: string) => (
                                                <span key={t} className="bg-white/5 text-[#c4c0ff] px-2 py-0.5 rounded-full text-[8.5px] border border-white/10 font-bold">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {node.data?.dm_format === 'button_template' && (() => {
                                let buttons = [];
                                const btnsJson = node.data?.button_template_buttons_json;
                                if (typeof btnsJson === 'string' && btnsJson.trim()) {
                                    try { buttons = JSON.parse(btnsJson); } catch (e) { }
                                } else if (Array.isArray(btnsJson)) {
                                    buttons = btnsJson;
                                }
                                return (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (wasRecentlyDragged()) return;
                                            window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                                detail: { nodeId: node.id }
                                            }));
                                        }}
                                        className="bg-black/35 hover:bg-[#c4c0ff]/5 border border-white/5 hover:border-[#c4c0ff]/45 rounded-xl overflow-hidden flex flex-col transition-all"
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
                                    try { elements = JSON.parse(elemsJson); } catch (e) { }
                                } else if (Array.isArray(elemsJson)) {
                                    elements = elemsJson;
                                }
                                const firstElem = elements[0] || {};
                                return (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (wasRecentlyDragged()) return;
                                            window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                                detail: { nodeId: node.id }
                                            }));
                                        }}
                                        className="bg-black/35 hover:bg-[#c4c0ff]/5 border border-white/5 hover:border-[#c4c0ff]/45 rounded-xl overflow-hidden flex flex-col transition-all"
                                    >
                                        {firstElem.image_url ? (
                                            <div className="h-24 w-full bg-zinc-950 overflow-hidden relative border-b border-white/5 shrink-0">
                                                <img src={firstElem.image_url} alt="" className="w-full h-full object-cover" />
                                                <span className="absolute bottom-1.5 right-2 bg-black/85 px-1.5 py-0.5 rounded text-[8px] font-bold text-white tracking-wider">
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
                                        {firstElem.buttons && firstElem.buttons.length > 0 && (
                                            <div className="flex flex-col divide-y divide-white/5 bg-zinc-950/20">
                                                {firstElem.buttons.map((btn: any, bi: number) => (
                                                    <span key={bi} className="py-2 text-[10px] text-[#3797F0] font-bold text-center">
                                                        {btn.title || 'Button'}
                                                    </span>
                                                ))}
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
                                            if (wasRecentlyDragged()) return;
                                            window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                                detail: { nodeId: node.id }
                                            }));
                                        }}
                                        className="bg-black/35 hover:bg-[#c4c0ff]/5 border border-white/5 hover:border-[#c4c0ff]/45 rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-zinc-500 tracking-wider block">Attachments</span>
                                            <span className="bg-[#c4c0ff]/15 text-[#c4c0ff] text-[8px] font-bold px-1.5 py-0.5 rounded">
                                                {attachList.length} files
                                            </span>
                                        </div>

                                        {attachList.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {attachList.slice(0, 4).map((item: any, index: number) => {
                                                    let type = 'image';
                                                    let url = '';
                                                    let isSticker = false;
                                                    let isMediaShare = false;

                                                    if (typeof item === 'string') {
                                                        url = item;
                                                        if (item.match(/\.(mp4|mov|avi|webm)/i)) {
                                                            type = 'video';
                                                        } else if (item.match(/\.(mp3|m4a|wav|ogg|aac)/i)) {
                                                            type = 'audio';
                                                        }
                                                    } else if (item && typeof item === 'object') {
                                                        type = item.type || 'image';
                                                        url = item.url || '';
                                                        isSticker = type === 'sticker';
                                                        isMediaShare = type === 'MEDIA_SHARE';
                                                    }

                                                    const isImage = type === 'image' && url;

                                                    return (
                                                        <div key={index} className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                                            {isImage ? (
                                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                            ) : type === 'video' ? (
                                                                <Film className="w-4 h-4 text-[#c4c0ff]" />
                                                            ) : type === 'audio' ? (
                                                                <Headphones className="w-4 h-4 text-[#CECBF6]" />
                                                            ) : isSticker ? (
                                                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                                            ) : isMediaShare ? (
                                                                <Share2 className="w-4 h-4 text-emerald-400" />
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

                            {!node.data?.is_cf_following &&
                                !node.data?.is_cf_not_following &&
                                !node.data?.is_cf_fork &&
                                (node.data?.dm_format === 'check_follow' ||
                                    node.data?.dm_format === 'show_profile' ||
                                    node.data?.is_profile_card ||
                                    node.data?.is_cf_gate) && (
                                    <div className="space-y-2">
                                        <InstagramProfileCard
                                            size="canvas"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (wasRecentlyDragged()) return;
                                                window.dispatchEvent(new CustomEvent('open-dm-format-editor', { detail: { nodeId: node.id } }));
                                            }}
                                        />
                                        <p className="text-[9px] text-zinc-400 text-center italic">
                                            Dynamically linked to your active Instagram profile
                                        </p>
                                    </div>
                                )}

                            {node.data?.detailed && (node.data?.rate_limit_limit !== undefined || node.data?.rate_limit_window_seconds !== undefined) && (
                                <div className="bg-white/5 border border-white/15 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                                    <span className="text-[10px] font-bold text-[#c4c7c8] tracking-widest block border-b border-white/5 pb-1">Action Config</span>
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
                                <span className="bg-[#FAEEDA] text-[#854F0B] text-[10px] font-bold px-2 py-0.5 rounded-md self-start ">
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
                                    <span className="text-[10px] font-bold text-[#c4c7c8] tracking-widest block border-b border-white/5 pb-1">Giveaway Config</span>
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
                                    <span className="text-[10px] font-bold text-[#c4c7c8] tracking-widest block border-b border-white/5 pb-1">Detailed Config</span>
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

                {/* Bottom Loop Target Drop Zone on Valid Action Cards */}
                {isValidLoopTargetCard && (
                    <div
                        onPointerUp={(e) => {
                            e.stopPropagation();
                            if (activeLoopDragSourceId && activeLoopDragSourceId !== node.id) {
                                dispatch(setLoopBackTarget({ sourceId: activeLoopDragSourceId, targetId: node.id }));
                                window.dispatchEvent(new CustomEvent('loop-drag-end'));
                                setTimeout(() => window.dispatchEvent(new CustomEvent('update-xarrow')), 50);
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (activeLoopDragSourceId && activeLoopDragSourceId !== node.id) {
                                dispatch(setLoopBackTarget({ sourceId: activeLoopDragSourceId, targetId: node.id }));
                                window.dispatchEvent(new CustomEvent('loop-drag-end'));
                                setTimeout(() => window.dispatchEvent(new CustomEvent('update-xarrow')), 50);
                            }
                        }}
                        className="w-full py-2.5 px-3 border-t-2 border-dashed border-[#c4c0ff] bg-purple-950/80 hover:bg-purple-800 rounded-b-[1.25rem] flex items-center justify-center gap-2 text-[10px] font-extrabold text-[#c4c0ff] hover:text-white transition-all cursor-pointer select-none animate-pulse shadow-xl shadow-purple-500/20"
                    >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>Connect Loop Input (Bottom)</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function LoopBadgeItem({
    edge,
    minX,
    maxX,
    minY,
    midX,
    midY,
    posX,
    posY,
    scale,
    pan,
    onOffsetChange,
    updateXarrow
}: {
    edge: any;
    minX: number;
    maxX: number;
    minY: number;
    midX: number;
    midY: number;
    posX: number;
    posY: number;
    scale: number;
    pan: { x: number; y: number };
    onOffsetChange: (offset: { x: number; y: number }) => void;
    updateXarrow: () => void;
}) {
    const isDragging = React.useRef(false);
    const startPoint = React.useRef({ x: 0, y: 0 });
    const startPos = React.useRef({ x: posX, y: posY });
    const currentPos = React.useRef({ x: posX, y: posY });
    const badgeElRef = React.useRef<HTMLDivElement>(null);
    const totalMoveDist = React.useRef(0);

    React.useEffect(() => {
        currentPos.current = { x: posX, y: posY };
    }, [posX, posY]);

    return (
        <div
            id={`loop-badge-${edge.id}`}
            ref={badgeElRef}
            onClick={(e) => {
                e.stopPropagation();
                if (totalMoveDist.current < 5) {
                    window.dispatchEvent(new CustomEvent('focus-loop-nodes', {
                        detail: { sourceId: edge.source, targetId: edge.target }
                    }));
                }
            }}
            onPointerDown={(e) => {
                e.stopPropagation();
                isDragging.current = true;
                totalMoveDist.current = 0;
                startPoint.current = { x: e.clientX, y: e.clientY };
                startPos.current = { x: posX, y: posY };
                try {
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                } catch { }
            }}
            onPointerMove={(e) => {
                if (!isDragging.current) return;
                const dist = Math.hypot(e.clientX - startPoint.current.x, e.clientY - startPoint.current.y);
                totalMoveDist.current = Math.max(totalMoveDist.current, dist);

                const dx = (e.clientX - startPoint.current.x) / scale;
                const dy = (e.clientY - startPoint.current.y) / scale;

                const rawX = startPos.current.x + dx;
                const rawY = startPos.current.y + dy;

                const isBlocked = rawX < minX || rawX > maxX || rawY < minY;
                const clampedX = Math.max(minX, Math.min(maxX, rawX));
                const clampedY = Math.max(minY, rawY);

                currentPos.current = { x: clampedX, y: clampedY };

                // Edge auto-panning when dragging loop badge label near canvas workspace boundaries
                autoPanOnDragEdge(e);

                if (badgeElRef.current) {
                    if (isBlocked) {
                        badgeElRef.current.classList.add('!bg-rose-950/95', '!border-rose-500', '!text-rose-300', '!ring-2', '!ring-rose-500/80', '!shadow-[0_0_15px_rgba(244,63,94,0.5)]', '!cursor-not-allowed');
                    } else {
                        badgeElRef.current.classList.remove('!bg-rose-950/95', '!border-rose-500', '!text-rose-300', '!ring-2', '!ring-rose-500/80', '!shadow-[0_0_15px_rgba(244,63,94,0.5)]', '!cursor-not-allowed');
                    }
                }

                onOffsetChange({
                    x: clampedX - midX,
                    y: clampedY - midY,
                });
                updateXarrow();
            }}
            onPointerUp={(e) => {
                if (!isDragging.current) return;
                isDragging.current = false;
                try {
                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                } catch { }
                if (badgeElRef.current) {
                    badgeElRef.current.classList.remove('!bg-rose-950/95', '!border-rose-500', '!text-rose-300', '!ring-2', '!ring-rose-500/80', '!shadow-[0_0_15px_rgba(244,63,94,0.5)]', '!cursor-not-allowed');
                }
                if (totalMoveDist.current < 5) {
                    window.dispatchEvent(new CustomEvent('focus-loop-nodes', {
                        detail: { sourceId: edge.source, targetId: edge.target }
                    }));
                }
                onOffsetChange({
                    x: currentPos.current.x - midX,
                    y: currentPos.current.y - midY,
                });
                updateXarrow();
            }}
            style={{
                position: 'absolute',
                transformOrigin: '0 0',
                transform: `translate3d(${posX * scale + pan.x}px, ${posY * scale + pan.y}px, 0px) scale(${scale})`,
                touchAction: 'none'
            }}
            className="px-2.5 py-1 rounded-full text-[9.5px] font-bold whitespace-nowrap backdrop-blur-md shadow-2xl border select-none pointer-events-auto flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing bg-[#1e1b4b] border-[#c4c0ff] text-[#c4c0ff] hover:bg-[#2e2b6b] transition-colors"
        >
            {/* LEFT OUTPUT HANDLE */}
            <div
                id={`loop-badge-out-${edge.id}`}
                className="w-2.5 h-2.5 rounded-full bg-[#c4c0ff] border border-white shadow-[0_0_8px_#c4c0ff] shrink-0 pointer-events-auto"
                title="Output (to previous card)"
            />

            <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3 shrink-0" />
                <span>{edge.label || 'Loop Back'}</span>
            </div>

            {/* RIGHT INPUT HANDLE */}
            <div
                id={`loop-badge-in-${edge.id}`}
                className="w-2.5 h-2.5 rounded-full bg-[#c4c0ff] border border-white shadow-[0_0_8px_#c4c0ff] shrink-0 pointer-events-auto"
                title="Input (from current card)"
            />
        </div>
    );
}

// Ensure smooth curving
export function CanvasEdges() {
    const edges = useSelector((state: RootState) => state.flow.edges);
    const nodes = useSelector((state: RootState) => state.flow.nodes);
    const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNodeId);
    const { pan, scale } = useCanvas();
    const updateXarrow = useXarrow();
    const [badgeOffsets, setBadgeOffsets] = React.useState<Record<string, { x: number; y: number }>>({});

    const xarrowRafRef = React.useRef<number | null>(null);
    const throttledUpdateXarrow = React.useCallback(() => {
        if (xarrowRafRef.current === null) {
            xarrowRafRef.current = requestAnimationFrame(() => {
                updateXarrow();
                xarrowRafRef.current = null;
            });
        }
    }, [updateXarrow]);

    return (
        <>
            {edges.map(edge => {
                const isFollowingEdge = edge.label === 'If Following';
                const isNotFollowingEdge = edge.label === 'If Not Following';
                const isLoopEdge = edge.id.includes('loop') || edge.label?.includes('Loop');

                const edgeColor = isFollowingEdge
                    ? '#10b981'
                    : isNotFollowingEdge
                        ? '#f43f5e'
                        : isLoopEdge
                            ? '#c4c0ff'
                            : edge.label
                                ? '#c4c0ff'
                                : '#666';

                const headColor = isFollowingEdge
                    ? '#10b981'
                    : isNotFollowingEdge
                        ? '#f43f5e'
                        : isLoopEdge
                            ? '#c4c0ff'
                            : edge.label
                                ? '#c4c0ff'
                                : '#8e9192';

                if (isLoopEdge) {
                    const sNode = nodes.find(n => n.id === edge.source);
                    const tNode = nodes.find(n => n.id === edge.target);

                    const { width: sW, height: sH } = sNode ? getNodeDimensions(sNode) : { width: 320, height: 280 };
                    const { width: tW, height: tH } = tNode ? getNodeDimensions(tNode) : { width: 320, height: 280 };

                    const leftNodeX = Math.min(tNode?.position.x ?? 0, sNode?.position.x ?? 0);
                    const rightNodeX = Math.max((tNode?.position.x ?? 0) + tW, (sNode?.position.x ?? 0) + sW);

                    // Min & Max bounds: strictly between the cards with safe margins
                    const minX = leftNodeX + 20;
                    const maxX = Math.max(minX, rightNodeX - 20);

                    // Centered horizontally along Y-axis between target and source
                    const midX = (leftNodeX + rightNodeX) / 2 - 55;

                    // Find all cards spanning horizontally between source and target (including any intermediate/sibling cards)
                    const spanNodes = nodes.filter(n => {
                        const { width: nW } = getNodeDimensions(n);
                        const nLeft = n.position.x;
                        const nRight = n.position.x + nW;
                        return nRight >= leftNodeX - 40 && nLeft <= rightNodeX + 40;
                    });

                    // Ensure loop badge is strictly below the lowest card in the entire span
                    const bottomCardsY = spanNodes.length > 0
                        ? Math.max(...spanNodes.map(n => {
                            const { height: nH } = getNodeDimensions(n);
                            return n.position.y + nH;
                        }))
                        : Math.max((tNode?.position.y ?? 0) + tH, (sNode?.position.y ?? 0) + sH);

                    const minY = bottomCardsY + 40;
                    const midY = bottomCardsY + 110;

                    const offset = badgeOffsets[edge.id] || { x: 0, y: 0 };
                    const rawX = midX + offset.x;
                    const rawY = midY + offset.y;

                    const posX = Math.max(minX, Math.min(maxX, rawX));
                    const posY = Math.max(minY, rawY);

                    return (
                        <div key={edge.id} className="group/loop-wire">
                            {/* Draggable Waypoint Badge centered at (0, -5) between Target Card (0, 3) and Loop Back Card (2, 3) */}
                            <LoopBadgeItem
                                edge={edge}
                                minX={minX}
                                maxX={maxX}
                                minY={minY}
                                midX={midX}
                                midY={midY}
                                posX={posX}
                                posY={posY}
                                scale={scale}
                                pan={pan}
                                onOffsetChange={(newOffset) => {
                                    setBadgeOffsets(prev => ({
                                        ...prev,
                                        [edge.id]: newOffset
                                    }));
                                }}
                                updateXarrow={throttledUpdateXarrow}
                            />

                            {/* Segment 1: Source bottom side into the EXACT RIGHT handle of the badge */}
                            <Xarrow
                                key={`seg1-${edge.id}`}
                                start={edge.source}
                                end={`loop-badge-in-${edge.id}`}
                                color="#c4c0ff"
                                strokeWidth={2 * scale}
                                path="smooth"
                                showHead={true}
                                headSize={3.5}
                                headColor="#c4c0ff"
                                headShape="arrow1"
                                curveness={0.55}
                                startAnchor="bottom"
                                endAnchor="right"
                                dashness={{ strokeLen: 5, nonStrokeLen: 5 }}
                                zIndex={0}
                                passProps={{ className: "loop-back-wire-path" }}
                            />

                            {/* Segment 2: Exits horizontally from EXACT LEFT handle of the badge into BOTTOM of previous card */}
                            <Xarrow
                                key={`seg2-${edge.id}`}
                                start={`loop-badge-out-${edge.id}`}
                                end={edge.target}
                                color="#c4c0ff"
                                strokeWidth={2 * scale}
                                path="smooth"
                                showHead={true}
                                headSize={4}
                                headColor="#c4c0ff"
                                headShape="arrow1"
                                curveness={0.55}
                                startAnchor="left"
                                endAnchor="bottom"
                                dashness={{ strokeLen: 5, nonStrokeLen: 5 }}
                                zIndex={0}
                                passProps={{ className: "loop-back-wire-path" }}
                            />
                        </div>
                    );
                }

                return (
                    <Xarrow
                        key={edge.id}
                        start={edge.source}
                        end={edge.target}
                        color={edgeColor}
                        strokeWidth={2 * scale}
                        path="smooth"
                        showHead={true}
                        headSize={4}
                        headColor={headColor}
                        headShape="arrow1"
                        curveness={0.5}
                        startAnchor="right"
                        endAnchor="left"
                        dashness={false}
                        labels={edge.label ? {
                            middle: (
                                <div
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap backdrop-blur-sm shadow-2xl border pointer-events-none select-none",
                                        isFollowingEdge
                                            ? "bg-[#064e3b]/90 border-emerald-500/40 text-emerald-300"
                                            : isNotFollowingEdge
                                                ? "bg-[#4c0519]/90 border-rose-500/40 text-rose-300"
                                                : "bg-[#161622] border-[#c4c0ff]/30 text-[#c4c0ff]"
                                    )}
                                >
                                    {edge.label}
                                </div>
                            )
                        } : undefined}
                    />
                );
            })}
            {(() => {
                const selectedNode = nodes.find(n => n.id === selectedNodeId);
                const showSettingsEdge = selectedNodeId && selectedNodeId !== 'global' && selectedNode && selectedNode.type !== 'action' && selectedNode.type !== 'condition' && selectedNode.type !== 'trigger';
                if (!showSettingsEdge) return null;
                return (
                    <Xarrow
                        key={`settings-edge-${selectedNodeId}`}
                        start={selectedNodeId}
                        end="settings-sidebar"
                        color="#c4c0ff"
                        strokeWidth={1.5 * scale}
                        path="straight"
                        dashness={{ strokeLen: 4, nonStrokeLen: 4 }}
                        showHead={false}
                        startAnchor="right"
                        endAnchor="left"
                    />
                );
            })()}
        </>
    );
}
