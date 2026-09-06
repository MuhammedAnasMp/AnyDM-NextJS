import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlowState, FlowNode, FlowEdge, NodeType } from '@/lib/types';
import templateCases from '@/lib/templateCases.json';

const generateId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const initialState: FlowState = {
    id: generateId(),
    name: 'Flow: Price Inquiry',
    nodes: [],
    edges: [],
    selectedNodeId: null,
    mediaPicker: null,
};

export const EXECUTION_COLUMNS = {
    1: { name: 'TRIGGER', step: 1, baseX: 80, minX: 40, maxX: 380 },
    2: { name: 'FILTER', step: 2, baseX: 440, minX: 400, maxX: 740 },
    3: { name: 'ACTION', step: 3, baseX: 800, minX: 760, maxX: 1100 },
    4: { name: 'DM / COMMENT', step: 4, baseX: 1160, minX: 1120, maxX: 1460 },
    5: { name: 'NEXT', step: 5, baseX: 1520, minX: 1480, maxX: 2000 },
} as const;

export function getNodeExecutionStep(node: FlowNode): number {
    if (node.type === 'trigger' || node.data?.is_icebreaker_trigger || node.data?.is_menu_trigger) {
        return 1;
    }
    if (node.type === 'condition') {
        return 2;
    }
    if (node.type === 'giveaway_config' || node.data?.is_cf_gate || node.data?.is_cf_fork) {
        return 3;
    }
    if (node.type === 'action') {
        if (node.data?.action_type === 'reply_comment') {
            return 3;
        }
        if (node.position?.x !== undefined) {
            if (node.position.x < 400) return 1;
            if (node.position.x < 760) return 2;
            if (node.position.x < 1120) return 3;
            if (node.position.x < 1480) return 4;
            return Math.max(4, Math.floor((node.position.x - 80) / 360) + 1);
        }
        return 4;
    }
    return 3;
}

export function getNodeDimensions(node: FlowNode): { width: number; height: number } {
    if (node.data?.is_cf_fork) {
        return { width: 40, height: 40 };
    }
    if (node.data?.is_placeholder && !node.data?.messages?.length && node.type === 'action') {
        return { width: 155, height: 240 };
    }
    if (node.data?.dm_format === 'show_profile' || node.data?.is_profile_card) {
        return { width: 320, height: 260 };
    }
    if (node.type === 'trigger') {
        return { width: 320, height: 260 };
    }
    if (node.type === 'condition') {
        return { width: 320, height: 240 };
    }
    if (node.type === 'giveaway_config') {
        return { width: 320, height: 280 };
    }
    if (node.type === 'reward') {
        return { width: 320, height: 220 };
    }
    // Default action card
    return { width: 320, height: 280 };
}

export function resolveNodePosition(
    node: FlowNode,
    targetX: number,
    targetY: number,
    allNodes: FlowNode[],
    edges: FlowEdge[]
): { x: number; y: number } {
    const nodeStep = getNodeExecutionStep(node);
    const colConfig = EXECUTION_COLUMNS[nodeStep as keyof typeof EXECUTION_COLUMNS] || EXECUTION_COLUMNS[3];
    const { width: nodeW, height: nodeH } = getNodeDimensions(node);

    // 1. Horizontal execution order constraints (predecessors & successors)
    const incomingExecEdges = edges.filter(
        e => e.target === node.id && !e.id.includes('loop') && !e.label?.includes('Loop')
    );
    let minAllowedX: number = colConfig.minX;
    if (incomingExecEdges.length > 0) {
        const parentNodes = allNodes.filter(n => incomingExecEdges.some(e => e.source === n.id));
        if (parentNodes.length > 0) {
            const maxParentEdge = Math.max(...parentNodes.map(p => {
                const { width: pW } = getNodeDimensions(p);
                return p.position.x + pW;
            }));
            minAllowedX = Math.max(minAllowedX, maxParentEdge + 40);
        }
    }

    const outgoingExecEdges = edges.filter(
        e => e.source === node.id && !e.id.includes('loop') && !e.label?.includes('Loop')
    );
    let maxAllowedX: number = colConfig.maxX;
    if (outgoingExecEdges.length > 0) {
        const childNodes = allNodes.filter(n => outgoingExecEdges.some(e => e.target === n.id));
        if (childNodes.length > 0) {
            const minChildX = Math.min(...childNodes.map(c => c.position.x));
            maxAllowedX = Math.min(maxAllowedX, minChildX - nodeW - 40);
        }
    }

    let clampedX = targetX;
    if (maxAllowedX >= minAllowedX) {
        clampedX = Math.max(minAllowedX, Math.min(maxAllowedX, targetX));
    } else {
        clampedX = Math.max(minAllowedX, targetX);
    }

    let clampedY = Math.max(40, targetY);
    const GAP = 40;

    // 2. Collision avoidance with all other cards
    const otherNodes = allNodes.filter(n => n.id !== node.id);
    let hasOverlap = true;
    let iterations = 0;
    const maxIterations = 15;

    while (hasOverlap && iterations < maxIterations) {
        hasOverlap = false;
        iterations++;

        for (const other of otherNodes) {
            const { width: otherW, height: otherH } = getNodeDimensions(other);
            const otherX = other.position.x;
            const otherY = other.position.y;

            // Check if bounding boxes overlap with less than 40px gap
            const isOverlapX = clampedX < otherX + otherW + GAP && clampedX + nodeW + GAP > otherX;
            const isOverlapY = clampedY < otherY + otherH + GAP && clampedY + nodeH + GAP > otherY;

            if (isOverlapX && isOverlapY) {
                hasOverlap = true;
                const nodeCenterY = clampedY + nodeH / 2;
                const otherCenterY = otherY + otherH / 2;

                if (nodeCenterY < otherCenterY && otherY - nodeH - GAP >= 40) {
                    clampedY = otherY - nodeH - GAP;
                } else {
                    clampedY = otherY + otherH + GAP;
                }
                clampedY = Math.max(40, clampedY);
            }
        }
    }

    return { x: clampedX, y: clampedY };
}

const MAX_HISTORY = 50;

const saveToPast = (state: FlowState) => {
    if (!state.past) state.past = [];
    state.past.push({
        name: state.name,
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        edges: JSON.parse(JSON.stringify(state.edges)),
    });
    if (state.past.length > MAX_HISTORY) {
        state.past.shift();
    }
    state.future = [];
    state.lastEdit = null;
};

const deleteNodeRecursively = (state: FlowState, nodeId: string, visited: Set<string> = new Set()) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    // Find all outgoing non-loop downstream edges from this node
    const outgoingEdges = state.edges.filter(
        e => e.source === nodeId && !e.id.includes('loop') && !e.label?.includes('Loop')
    );

    // Recursively delete all downstream target nodes
    outgoingEdges.forEach(edge => {
        deleteNodeRecursively(state, edge.target, visited);
    });

    // Remove all edges connected to this node (incoming and outgoing)
    state.edges = state.edges.filter(e => e.source !== nodeId && e.target !== nodeId);

    // Remove the node itself
    state.nodes = state.nodes.filter(n => n.id !== nodeId);
};

const syncLinkedNodes = (state: FlowState, nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const activeEvents: { payload: string; label: string }[] = [];

    if (node.type === 'trigger') {
        if (node.data?.is_icebreaker_trigger) {
            const icebreakers = node.data?.icebreakers || [];
            icebreakers.forEach((ib: any) => {
                if (ib.question && ib.payload) {
                    activeEvents.push({ payload: ib.payload, label: ib.question });
                }
            });
        } else if (node.data?.is_menu_trigger) {
            const items = node.data?.persistent_menu_items || [];
            items.forEach((item: any) => {
                if (item.type === 'postback' && item.title && item.payload) {
                    activeEvents.push({ payload: item.payload, label: item.title });
                }
            });
        } else {
            return;
        }
    } else if (node.type === 'action') {
        const format = node.data?.dm_format;
        if (format === 'quick_reply') {
            const titles: string[] = node.data?.quick_replies_titles || [];
            titles.forEach((title) => {
                const payload = `QR_${title.toUpperCase().replace(/\s+/g, '_')}`;
                activeEvents.push({ payload, label: title });
            });
        } else if (format === 'button_template') {
            let buttons: any[] = [];
            const btnsJson = node.data?.button_template_buttons_json;
            if (typeof btnsJson === 'string' && btnsJson.trim()) {
                try { buttons = JSON.parse(btnsJson); } catch (e) { }
            } else if (Array.isArray(btnsJson)) {
                buttons = btnsJson;
            }

            const seenPayloads = new Set<string>();
            buttons.forEach((btn) => {
                if (btn.payload === 'CHECK_FOLLOW') {
                    if (!seenPayloads.has('CHECK_FOLLOW')) {
                        seenPayloads.add('CHECK_FOLLOW');
                        activeEvents.push({ payload: 'CHECK_FOLLOW', label: btn.title || '👉 Follow Us', extra: btn } as any);
                    }
                } else if (btn.is_profile_button || (btn.type === 'web_url' && btn.url && btn.url.includes('instagram.com') && (btn.title?.includes('Profile') || btn.title?.includes('👤')))) {
                    if (!seenPayloads.has('SHOW_PROFILE')) {
                        seenPayloads.add('SHOW_PROFILE');
                        activeEvents.push({ payload: 'SHOW_PROFILE', label: btn.title || '👤 Visit Profile', extra: btn } as any);
                    }
                } else if (btn.type !== 'web_url' && btn.type !== 'product' && btn.payload) {
                    if (!seenPayloads.has(btn.payload)) {
                        seenPayloads.add(btn.payload);
                        activeEvents.push({ payload: btn.payload, label: btn.title || btn.payload, extra: btn } as any);
                    }
                }
            });
        } else if (format === 'generic_template') {
            let elements: any[] = [];
            const elemsJson = node.data?.generic_template_elements_json;
            if (typeof elemsJson === 'string' && elemsJson.trim()) {
                try { elements = JSON.parse(elemsJson); } catch (e) { }
            } else if (Array.isArray(elemsJson)) {
                elements = elemsJson;
            }

            const seenPayloads = new Set<string>();
            elements.forEach((elem) => {
                (elem.buttons || []).forEach((btn: any) => {
                    if (btn.payload === 'CHECK_FOLLOW') {
                        if (!seenPayloads.has('CHECK_FOLLOW')) {
                            seenPayloads.add('CHECK_FOLLOW');
                            activeEvents.push({ payload: 'CHECK_FOLLOW', label: btn.title || '👉 Follow Us', extra: btn } as any);
                        }
                    } else if (btn.is_profile_button || (btn.type === 'web_url' && btn.url && btn.url.includes('instagram.com') && (btn.title?.includes('Profile') || btn.title?.includes('👤')))) {
                        if (!seenPayloads.has('SHOW_PROFILE')) {
                            seenPayloads.add('SHOW_PROFILE');
                            activeEvents.push({ payload: 'SHOW_PROFILE', label: btn.title || '👤 Visit Profile', extra: btn } as any);
                        }
                    } else if (btn.type !== 'web_url' && btn.type !== 'product' && btn.payload) {
                        const payload = btn.payload;
                        if (!seenPayloads.has(payload)) {
                            seenPayloads.add(payload);
                            activeEvents.push({ payload, label: btn.title || payload, extra: btn } as any);
                        }
                    }
                });
            });
        }
    } else {
        return;
    }

    // Get current connected reply nodes for this node (via labeled non-loop edges)
    const connectedEdges = state.edges.filter(
        e => e.source === nodeId && e.label && !e.id.includes('loop') && !e.label?.includes('Loop')
    );

    // 1. Remove orphaned nodes (downstream nodes whose parent event is no longer in activeEvents)
    connectedEdges.forEach(edge => {
        const childNode = state.nodes.find(n => n.id === edge.target);
        const parentEvent = childNode?.data?.parent_event;
        const stillActive = activeEvents.some(ae => ae.payload === parentEvent);
        if (!stillActive) {
            // Delete the child node and all downstream flows recursively
            deleteNodeRecursively(state, edge.target);

            // Also cleanup prompt/input/response sub-nodes if it was TRACK_ORDER
            if (parentEvent === 'TRACK_ORDER') {
                const promptId = `${nodeId}-track-prompt`;
                const inputId = `${nodeId}-track-input`;
                const responseId = `${nodeId}-track-response`;
                state.nodes = state.nodes.filter(n => n.id !== promptId && n.id !== inputId && n.id !== responseId);
                state.edges = state.edges.filter(e => e.source !== promptId && e.target !== promptId && e.source !== inputId && e.target !== inputId && e.source !== responseId && e.target !== responseId);
            }
            if (parentEvent === 'CHECK_FOLLOW') {
                const forkId = `${nodeId}-cf-fork`;
                const gateId = `${nodeId}-cf-gate`;
                const followingId = `${nodeId}-cf-following`;
                const notFollowingId = `${nodeId}-cf-not-following`;
                state.nodes = state.nodes.filter(n => n.id !== forkId && n.id !== gateId && n.id !== followingId && n.id !== notFollowingId);
                state.edges = state.edges.filter(e => e.source !== forkId && e.target !== forkId && e.source !== gateId && e.target !== gateId && e.source !== followingId && e.target !== followingId && e.source !== notFollowingId && e.target !== notFollowingId);
            }
            if (parentEvent === 'SHOW_PROFILE') {
                const profileId = `${nodeId}-profile-card`;
                state.nodes = state.nodes.filter(n => n.id !== profileId);
                state.edges = state.edges.filter(e => e.source !== profileId && e.target !== profileId);
            }
        }
    });

    // Update connected edges list after deletion
    const remainingEdges = state.edges.filter(
        e => e.source === nodeId && e.label && !e.id.includes('loop') && !e.label?.includes('Loop')
    );

    // 2. Add missing nodes for new activeEvents
    activeEvents.forEach((ae, idx) => {
        const hasNode = remainingEdges.some(e => {
            const child = state.nodes.find(n => n.id === e.target);
            return child?.data?.parent_event === ae.payload;
        });

        if (!hasNode) {
            if (ae.payload === 'TRACK_ORDER') {
                const promptId = `${nodeId}-track-prompt`;
                const inputId = `${nodeId}-track-input`;
                const responseId = `${nodeId}-track-response`;

                if (!state.nodes.some(n => n.id === promptId)) {
                    state.nodes.push({
                        id: promptId,
                        type: 'action',
                        position: {
                            x: node.position.x + 360,
                            y: node.position.y + 360 + idx * 320,
                        },
                        data: {
                            action_type: 'send_dm',
                            dm_format: 'text',
                            messages: ["Please reply with your Order ID to track your order. 📦"],
                            parent_event: 'TRACK_ORDER',
                            parent_label: ae.label,
                            is_track_prompt: true,
                        },
                    });
                }

                if (!state.nodes.some(n => n.id === inputId)) {
                    state.nodes.push({
                        id: inputId,
                        type: 'action',
                        position: {
                            x: node.position.x + 720,
                            y: node.position.y + 360 + idx * 320,
                        },
                        data: {
                            action_type: 'send_dm',
                            dm_format: 'text',
                            messages: ["Customer replies with Order ID"],
                            parent_event: 'TRACK_ORDER',
                            parent_label: ae.label,
                            is_track_input: true,
                        },
                    });
                }

                if (!state.nodes.some(n => n.id === responseId)) {
                    state.nodes.push({
                        id: responseId,
                        type: 'action',
                        position: {
                            x: node.position.x + 1080,
                            y: node.position.y + 360 + idx * 320,
                        },
                        data: {
                            action_type: 'send_dm',
                            dm_format: 'text',
                            messages: ["Returns Live status details"],
                            parent_event: 'TRACK_ORDER',
                            parent_label: ae.label,
                            is_track_response: true,
                        },
                    });
                }

                if (!state.edges.some(e => e.source === nodeId && e.target === promptId)) {
                    state.edges.push({
                        id: `edge-${nodeId}-prompt-${Date.now()}`,
                        source: nodeId,
                        target: promptId,
                        label: ae.label,
                    });
                }

                if (!state.edges.some(e => e.source === promptId && e.target === inputId)) {
                    state.edges.push({
                        id: `edge-prompt-input-${Date.now()}`,
                        source: promptId,
                        target: inputId,
                        label: "Awaiting DM",
                    });
                }

                if (!state.edges.some(e => e.source === inputId && e.target === responseId)) {
                    state.edges.push({
                        id: `edge-input-response-${Date.now()}`,
                        source: inputId,
                        target: responseId,
                        label: "Send Response",
                    });
                }
            } else if (ae.payload === 'CHECK_FOLLOW') {
                const forkId = `${nodeId}-cf-fork`;
                const followingId = `${nodeId}-cf-following`;
                const notFollowingId = `${nodeId}-cf-not-following`;

                // 1. Y-Split Junction Pin (shows Button Name on the first half wire)
                if (!state.nodes.some(n => n.id === forkId)) {
                    state.nodes.push({
                        id: forkId,
                        type: 'action',
                        position: {
                            x: node.position.x + 360,
                            y: node.position.y + 140 + idx * 360,
                        },
                        data: {
                            action_type: 'send_dm',
                            parent_event: 'CHECK_FOLLOW',
                            parent_label: ae.label || '👉 Follow Us',
                            button_name: ae.label || '👉 Follow Us',
                            is_cf_fork: true,
                            is_placeholder: false,
                        },
                    });
                } else {
                    const fNode = state.nodes.find(n => n.id === forkId);
                    if (fNode) {
                        fNode.data.button_name = ae.label || fNode.data.button_name;
                        fNode.data.parent_label = ae.label || fNode.data.parent_label;
                    }
                }

                // 2. Branch 1: If Following Node (Message Type list menu)
                if (!state.nodes.some(n => n.id === followingId)) {
                    state.nodes.push({
                        id: followingId,
                        type: 'action',
                        position: {
                            x: node.position.x + 440,
                            y: node.position.y - 120 + idx * 360,
                        },
                        data: {
                            action_type: 'send_dm',
                            parent_event: 'CHECK_FOLLOW',
                            cf_branch: 'following',
                            parent_label: '✅ If Following',
                            is_cf_following: true,
                            is_placeholder: true,
                        },
                    });
                }

                // 3. Branch 2: If Not Following Node (Message Type list menu)
                if (!state.nodes.some(n => n.id === notFollowingId)) {
                    state.nodes.push({
                        id: notFollowingId,
                        type: 'action',
                        position: {
                            x: node.position.x + 440,
                            y: node.position.y + 200 + idx * 360,
                        },
                        data: {
                            action_type: 'send_dm',
                            parent_event: 'CHECK_FOLLOW',
                            cf_branch: 'not_following',
                            parent_label: '❌ If Not Following',
                            is_cf_not_following: true,
                            is_placeholder: true,
                        },
                    });
                }

                // Edge 1 (Stem): Parent DM -> Y-Split Junction
                const parentToForkEdge = state.edges.find(e => e.source === nodeId && e.target === forkId);
                if (!parentToForkEdge) {
                    state.edges.push({
                        id: `edge-${nodeId}-fork-${Date.now()}`,
                        source: nodeId,
                        target: forkId,
                        label: ae.label || "Check Follow",
                    });
                } else if (parentToForkEdge.label !== ae.label) {
                    parentToForkEdge.label = ae.label;
                }

                // Edge 2 (Top Branch): Y-Split Junction -> If Following Card
                if (!state.edges.some(e => e.source === forkId && e.target === followingId)) {
                    state.edges.push({
                        id: `edge-${forkId}-following-${Date.now()}`,
                        source: forkId,
                        target: followingId,
                        label: "If Following",
                    });
                }

                // Edge 3 (Bottom Branch): Y-Split Junction -> If Not Following Card
                if (!state.edges.some(e => e.source === forkId && e.target === notFollowingId)) {
                    state.edges.push({
                        id: `edge-${forkId}-not-following-${Date.now()}`,
                        source: forkId,
                        target: notFollowingId,
                        label: "If Not Following",
                    });
                }
            } else if (ae.payload === 'SHOW_PROFILE') {
                const profileId = `${nodeId}-profile-card`;

                if (!state.nodes.some(n => n.id === profileId)) {
                    state.nodes.push({
                        id: profileId,
                        type: 'action',
                        position: {
                            x: node.position.x + 360,
                            y: node.position.y + idx * 320,
                        },
                        data: {
                            action_type: 'send_dm',
                            dm_format: 'show_profile',
                            profile_url: (ae as any).extra?.url || 'https://instagram.com',
                            profile_button_text: (ae as any).extra?.title || '👤 Visit Profile',
                            parent_event: 'SHOW_PROFILE',
                            parent_label: '👤 Profile View',
                            is_profile_card: true,
                            is_placeholder: false,
                        },
                    });
                } else {
                    const pNode = state.nodes.find(n => n.id === profileId);
                    if (pNode) {
                        pNode.data.profile_url = (ae as any).extra?.url || pNode.data.profile_url;
                        pNode.data.profile_button_text = (ae as any).extra?.title || pNode.data.profile_button_text;
                    }
                }

                if (!state.edges.some(e => e.source === nodeId && e.target === profileId)) {
                    state.edges.push({
                        id: `edge-${nodeId}-profile-${Date.now()}`,
                        source: nodeId,
                        target: profileId,
                        label: "Show Profile",
                    });
                }
            } else {
                const newNodeId = `node-reply-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
                const newNode: FlowNode = {
                    id: newNodeId,
                    type: 'action',
                    position: {
                        x: node.position.x + 360,
                        y: node.position.y + idx * 320,
                    },
                    data: {
                        action_type: 'send_dm',
                        is_placeholder: true,
                        parent_event: ae.payload,
                        parent_label: ae.label,
                    },
                };
                state.nodes.push(newNode);
                state.edges.push({
                    id: `edge-reply-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                    source: nodeId,
                    target: newNodeId,
                    label: ae.label,
                });
            }
        } else {
            // Update edge label if the button/pill text changed
            const edge = remainingEdges.find(e => {
                const child = state.nodes.find(n => n.id === e.target);
                return child?.data?.parent_event === ae.payload;
            });
            if (edge) {
                if (edge.label !== ae.label) {
                    edge.label = ae.label;
                }
                const childNode = state.nodes.find(n => n.id === edge.target);
                if (childNode && childNode.data.parent_label !== ae.label) {
                    childNode.data.parent_label = ae.label;
                }
            }
        }
    });
};

export const flowSlice = createSlice({
    name: 'flow',
    initialState,
    reducers: {
        setFlow: (state, action: PayloadAction<FlowState>) => {
            return {
                ...action.payload,
                past: [],
                future: [],
                lastEdit: null,
            };
        },
        updateFlowName: (state, action: PayloadAction<string>) => {
            saveToPast(state);
            state.name = action.payload;
        },
        addNode: (state, action: PayloadAction<{ type: NodeType; position: { x: number; y: number }; data?: Record<string, unknown>; ruleType?: string }>) => {
            saveToPast(state);
            const newNode: FlowNode = {
                id: `node-${Date.now()}`,
                type: action.payload.type,
                position: action.payload.position,
                data: action.payload.data || {},
                ruleType: action.payload.ruleType,
            };
            state.nodes.push(newNode);
        },
        updateNodePosition: (state, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) => {
            saveToPast(state);
            const node = state.nodes.find(n => n.id === action.payload.id);
            if (node) {
                const resolved = resolveNodePosition(node, action.payload.position.x, action.payload.position.y, state.nodes, state.edges);
                node.position = resolved;
            }
        },
        updateNodeData: (state, action: PayloadAction<{ id: string; key: string; value: unknown }>) => {
            const { id, key, value } = action.payload;
            if (state.lastEdit && state.lastEdit.id === id && state.lastEdit.key === key) {
                // Coalescing: skip saving to past for active/consecutive keystrokes on the same node field
            } else {
                saveToPast(state);
                state.lastEdit = { id, key };
            }
            const node = state.nodes.find(n => n.id === id);
            if (node) {
                node.data = { ...node.data, [key]: value };
                syncLinkedNodes(state, id);
            }
        },
        // Atomically change DM format and wipe ALL stale format-specific fields + remove linked reply nodes
        setDMFormat: (state, action: PayloadAction<{ id: string; format: string }>) => {
            saveToPast(state);
            state.lastEdit = null;
            const { id, format } = action.payload;
            const node = state.nodes.find(n => n.id === id);
            if (node) {
                // 1. Find all labeled edges from this node (these point to linked reply nodes)
                const linkedEdges = state.edges.filter(
                    e => e.source === id && e.label && !e.id.includes('loop') && !e.label?.includes('Loop')
                );
                const linkedNodeIds = linkedEdges.map(e => e.target);

                // 2. Cascade-remove linked reply nodes and all their downstream edges and nodes
                if (linkedNodeIds.length > 0) {
                    linkedNodeIds.forEach(targetId => {
                        deleteNodeRecursively(state, targetId);
                    });
                }

                // 3. Strip every format-specific key so the new wireframe is blank
                const {
                    dm_format: _df,
                    is_placeholder: _ip,
                    action_type,
                    parent_event,
                    rate_limit_limit,
                    rate_limit_window_seconds,
                    ...nonFormatKeys
                } = node.data;
                void nonFormatKeys; // intentionally unused — cleared
                node.data = {
                    action_type: action_type ?? 'send_dm',
                    parent_event,
                    rate_limit_limit,
                    rate_limit_window_seconds,
                    dm_format: format,
                    is_placeholder: false,
                };
                syncLinkedNodes(state, id);
            }
        },

        // Reset a node back to placeholder and cascade-remove linked reply nodes
        resetToPlaceholder: (state, action: PayloadAction<string>) => {
            saveToPast(state);
            state.lastEdit = null;
            const id = action.payload;
            const node = state.nodes.find(n => n.id === id);
            if (node) {
                // Remove all linked reply nodes and their downstream flows recursively
                const linkedEdges = state.edges.filter(
                    e => e.source === id && e.label && !e.id.includes('loop') && !e.label?.includes('Loop')
                );
                const linkedNodeIds = linkedEdges.map(e => e.target);
                if (linkedNodeIds.length > 0) {
                    linkedNodeIds.forEach(targetId => {
                        deleteNodeRecursively(state, targetId);
                    });
                }
                // Reset node data — keep only non-format fields
                node.data = {
                    action_type: node.data.action_type ?? 'send_dm',
                    parent_event: node.data.parent_event,
                    rate_limit_limit: node.data.rate_limit_limit,
                    rate_limit_window_seconds: node.data.rate_limit_window_seconds,
                    is_placeholder: true,
                };
                // Clean up any loop edges originating from this node
                state.edges = state.edges.filter(e => !(e.source === id && e.id.includes('loop')));
                syncLinkedNodes(state, id);
            }
        },

        setLoopBackTarget: (state, action: PayloadAction<{ sourceId: string; targetId: string }>) => {
            saveToPast(state);
            const { sourceId, targetId } = action.payload;
            const node = state.nodes.find(n => n.id === sourceId);
            const targetNode = state.nodes.find(n => n.id === targetId);

            if (targetId && node && targetNode) {
                if (targetNode.position.x >= node.position.x - 50) {
                    return; // Reject loop connection to same or later card horizontally
                }
                if (targetNode.data?.dm_format === 'loop_back') {
                    return; // Reject loop connection to another loop back card
                }
            }

            if (node) {
                node.data = {
                    ...node.data,
                    dm_format: 'loop_back',
                    loop_target_id: targetId,
                    is_placeholder: false,
                    validationError: null,
                };
            }
            // Remove existing loop edge from this source
            state.edges = state.edges.filter(e => !(e.source === sourceId && e.id.includes('loop')));
            // Add new loop edge
            if (targetId) {
                state.edges.push({
                    id: `edge-loop-${sourceId}-${targetId}-${Date.now()}`,
                    source: sourceId,
                    target: targetId,
                    label: '🔄 Loop Back',
                });
            }
        },

        removeNode: (state, action: PayloadAction<string>) => {
            saveToPast(state);
            deleteNodeRecursively(state, action.payload);
            if (state.selectedNodeId === action.payload) {
                state.selectedNodeId = null;
                state.selectedNodeRect = null;
            }
        },
        addEdge: (state, action: PayloadAction<{ source: string; target: string; label?: string }>) => {
            // Prevent duplicates
            const exists = state.edges.find(e => e.source === action.payload.source && e.target === action.payload.target);
            if (!exists) {
                saveToPast(state);
                state.edges.push({ id: `edge-${Date.now()}`, ...action.payload });
            }
        },
        removeEdge: (state, action: PayloadAction<string>) => {
            saveToPast(state);
            state.edges = state.edges.filter(e => e.id !== action.payload);
        },
        selectNode: (state, action: PayloadAction<{ id: string | null, rect?: { top: number, left: number, width: number, height: number } | null } | null>) => {
            state.lastEdit = null;
            if (action.payload === null) {
                state.selectedNodeId = null;
                state.selectedNodeRect = null;
            } else {
                state.selectedNodeId = action.payload.id;
                state.selectedNodeRect = action.payload.rect || null;
            }
        },
        openMediaPicker: (state, action: PayloadAction<{ nodeId: string; fieldKey: string; resourceType: 'media' | 'story' }>) => {
            state.mediaPicker = {
                isOpen: true,
                nodeId: action.payload.nodeId,
                fieldKey: action.payload.fieldKey,
                resourceType: action.payload.resourceType,
            };
        },
        closeMediaPicker: (state) => {
            if (state.mediaPicker) {
                state.mediaPicker.isOpen = false;
            }
        },
        addDefaultFlowTemplate: (state, action: PayloadAction<{ ruleType: string, name: string, templateId?: string }>) => {
            saveToPast(state);
            state.nodes = [];
            state.edges = [];
            state.selectedNodeId = null;
            state.name = action.payload.name;

            const ruleType = action.payload.ruleType;
            const tid = action.payload.templateId || '1';

            const cases = templateCases as Record<string, {
                target: Record<string, unknown>;
                condition: Record<string, unknown>;
                actions?: Array<Record<string, unknown>>;
                giveaway?: {
                    rewards?: Array<Record<string, unknown>>;
                };
            }>;
            const caseData = cases[tid];

            if (!caseData) return;

            const isShareRule = ruleType.includes('share') || tid === '23';

            const targetData = {
                start_at: caseData.target?.start_at || null,
                end_at: caseData.target?.end_at || null,
                ...(caseData.target || {}),
            };

            const tId = `node-t-${Date.now()}`;
            state.nodes.push({ id: tId, type: 'trigger', position: { x: 80, y: 150 }, data: targetData, ruleType, templateId: tid });

            let parentNodeId = tId;

            if (!isShareRule) {
                const cId = `node-c-${Date.now()}`;
                state.nodes.push({ id: cId, type: 'condition', position: { x: 440, y: 150 }, data: caseData.condition, ruleType, templateId: tid });
                state.edges.push({ id: `edge-${Date.now()}-1`, source: tId, target: cId });
                parentNodeId = cId;
            }

            if (caseData.giveaway) {
                const gId = `node-g-${Date.now()}`;
                state.nodes.push({ id: gId, type: 'giveaway_config', position: { x: 800, y: 50 }, data: caseData.giveaway, ruleType, templateId: tid });
                state.edges.push({ id: `edge-${Date.now()}-2`, source: parentNodeId, target: gId });

                if (caseData.giveaway.rewards) {
                    caseData.giveaway.rewards.forEach((rew, idx) => {
                        const rId = `node-r-${Date.now()}-${idx}`;
                        state.nodes.push({ id: rId, type: 'reward', position: { x: 1160, y: 50 + (idx * 300) }, data: rew, ruleType, templateId: tid });
                        state.edges.push({ id: `edge-${Date.now()}-reward-${idx}`, source: gId, target: rId });
                    });
                }
            }

            if (caseData.actions) {
                caseData.actions.forEach((act, i) => {
                    const aId = `node-a-${Date.now()}-${i}`;
                    const actAny = act as any;
                    const hasConfiguredData =
                        (actAny.messages && actAny.messages.length > 0) ||
                        (actAny.dm_format && actAny.dm_format !== 'text') ||
                        (actAny.action_type && actAny.action_type !== 'send_dm');
                    const posX = isShareRule ? 440 : 800;
                    // Offset vertically with at least 40px gap between action cards
                    state.nodes.push({ id: aId, type: 'action', position: { x: posX, y: caseData.giveaway ? 360 + (i * 320) : 150 + (i * 320) }, data: { ...act, is_placeholder: !hasConfiguredData }, ruleType, templateId: tid });
                    state.edges.push({ id: `edge-${Date.now()}-act-${i}`, source: parentNodeId, target: aId });
                });
            }
        },
        // Add a linked DM reply node for a postback button/pill
        addLinkedDMNode: (state, action: PayloadAction<{
            sourceNodeId: string;
            parentEventPayload: string;
            parentEventLabel: string;
            offsetX?: number;
            offsetY?: number;
        }>) => {
            saveToPast(state);
            const { sourceNodeId, parentEventPayload, parentEventLabel, offsetX = 360, offsetY = 0 } = action.payload;
            const sourceNode = state.nodes.find(n => n.id === sourceNodeId);
            if (!sourceNode) return;

            // Check if a linked node for this event already exists
            const alreadyLinked = state.nodes.find(
                n => n.data?.parent_event === parentEventPayload && state.edges.some(e => e.source === sourceNodeId && e.target === n.id)
            );
            if (alreadyLinked) return;

            const newNodeId = `node-reply-${Date.now()}`;
            // Stack reply nodes vertically based on how many already exist from this source with at least 40px gap
            const existingReplies = state.edges.filter(e => e.source === sourceNodeId && e.label).length;
            const newNode: FlowNode = {
                id: newNodeId,
                type: 'action',
                position: {
                    x: sourceNode.position.x + offsetX,
                    y: sourceNode.position.y + existingReplies * 320 + offsetY,
                },
                data: {
                    action_type: 'send_dm',
                    is_placeholder: true,
                    parent_event: parentEventPayload,
                },
            };
            state.nodes.push(newNode);
            state.edges.push({
                id: `edge-reply-${Date.now()}`,
                source: sourceNodeId,
                target: newNodeId,
                label: parentEventLabel,
            });
        },
        undo: (state) => {
            state.lastEdit = null;
            if (state.past && state.past.length > 0) {
                const previous = state.past.pop();
                if (previous) {
                    if (!state.future) state.future = [];
                    state.future.push({
                        name: state.name,
                        nodes: JSON.parse(JSON.stringify(state.nodes)),
                        edges: JSON.parse(JSON.stringify(state.edges)),
                    });

                    state.name = previous.name;
                    state.nodes = previous.nodes;
                    state.edges = previous.edges;

                    // Clear selection if node no longer exists
                    if (state.selectedNodeId && !previous.nodes.some(n => n.id === state.selectedNodeId)) {
                        state.selectedNodeId = null;
                        state.selectedNodeRect = null;
                    }
                }
            }
        },
        redo: (state) => {
            state.lastEdit = null;
            if (state.future && state.future.length > 0) {
                const next = state.future.pop();
                if (next) {
                    if (!state.past) state.past = [];
                    state.past.push({
                        name: state.name,
                        nodes: JSON.parse(JSON.stringify(state.nodes)),
                        edges: JSON.parse(JSON.stringify(state.edges)),
                    });

                    state.name = next.name;
                    state.nodes = next.nodes;
                    state.edges = next.edges;
                }
            }
        }
    },
});

export const {
    setFlow,
    updateFlowName,
    addNode,
    updateNodePosition,
    updateNodeData,
    removeNode,
    addEdge,
    removeEdge,
    selectNode,
    openMediaPicker,
    closeMediaPicker,
    addDefaultFlowTemplate,
    addLinkedDMNode,
    setDMFormat,
    resetToPlaceholder,
    setLoopBackTarget,
    undo,
    redo
} = flowSlice.actions;

export default flowSlice.reducer;
