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

const deleteNodeRecursively = (state: FlowState, nodeId: string) => {
    // Find all outgoing edges from this node
    const outgoingEdges = state.edges.filter(e => e.source === nodeId);

    // Recursively delete all downstream target nodes
    outgoingEdges.forEach(edge => {
        deleteNodeRecursively(state, edge.target);
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
                if (btn.type !== 'web_url' && btn.type !== 'product' && btn.payload) {
                    if (!seenPayloads.has(btn.payload)) {
                        seenPayloads.add(btn.payload);
                        activeEvents.push({ payload: btn.payload, label: btn.title || btn.payload });
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
                    if (btn.type !== 'web_url' && btn.type !== 'product' && btn.payload) {
                        const payload = btn.payload;
                        if (!seenPayloads.has(payload)) {
                            seenPayloads.add(payload);
                            activeEvents.push({ payload, label: btn.title || payload });
                        }
                    }
                });
            });
        }
    } else {
        return;
    }

    // Get current connected reply nodes for this node (via labeled edges)
    const connectedEdges = state.edges.filter(e => e.source === nodeId && e.label);

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
        }
    });

    // Update connected edges list after deletion
    const remainingEdges = state.edges.filter(e => e.source === nodeId && e.label);

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
                            x: node.position.x + 450,
                            y: node.position.y + 350 + idx * 220,
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
                            x: node.position.x + 800,
                            y: node.position.y + 350 + idx * 220,
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
                            x: node.position.x + 1150,
                            y: node.position.y + 350 + idx * 220,
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
            } else {
                const newNodeId = `node-reply-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
                const newNode: FlowNode = {
                    id: newNodeId,
                    type: 'action',
                    position: {
                        x: node.position.x + 450,
                        y: node.position.y + idx * 220,
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
            if (node) node.position = action.payload.position;
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
                if (node.type === 'action' && key !== 'is_placeholder') {
                    node.data.is_placeholder = false;
                }
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
                const linkedEdges = state.edges.filter(e => e.source === id && e.label);
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
                const linkedEdges = state.edges.filter(e => e.source === id && e.label);
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
                syncLinkedNodes(state, id);
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
        selectNode: (state, action: PayloadAction<{ id: string | null, rect?: { top: number, left: number, width: number, height: number } } | null>) => {
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

            const tId = `node-t-${Date.now()}`;
            const cId = `node-c-${Date.now()}`;

            state.nodes.push({ id: tId, type: 'trigger', position: { x: 100, y: 150 }, data: caseData.target, ruleType, templateId: tid });
            state.nodes.push({ id: cId, type: 'condition', position: { x: 550, y: 150 }, data: caseData.condition, ruleType, templateId: tid });
            state.edges.push({ id: `edge-${Date.now()}-1`, source: tId, target: cId });

            if (caseData.giveaway) {
                const gId = `node-g-${Date.now()}`;
                state.nodes.push({ id: gId, type: 'giveaway_config', position: { x: 1000, y: 50 }, data: caseData.giveaway, ruleType, templateId: tid });
                state.edges.push({ id: `edge-${Date.now()}-2`, source: cId, target: gId });

                if (caseData.giveaway.rewards) {
                    caseData.giveaway.rewards.forEach((rew, idx) => {
                        const rId = `node-r-${Date.now()}-${idx}`;
                        state.nodes.push({ id: rId, type: 'reward', position: { x: 1450, y: 50 + (idx * 160) }, data: rew, ruleType, templateId: tid });
                        state.edges.push({ id: `edge-${Date.now()}-reward-${idx}`, source: gId, target: rId });
                    });
                }
            }

            if (caseData.actions) {
                caseData.actions.forEach((act, i) => {
                    const aId = `node-a-${Date.now()}-${i}`;
                    const hasConfiguredData =
                        (act.messages && act.messages.length > 0) ||
                        (act.dm_format && act.dm_format !== 'text') ||
                        (act.action_type && act.action_type !== 'send_dm');
                    // Offset vertically for multiple actions
                    state.nodes.push({ id: aId, type: 'action', position: { x: 1000, y: caseData.giveaway ? 300 + (i * 200) : 150 + (i * 200) }, data: { ...act, is_placeholder: !hasConfiguredData }, ruleType, templateId: tid });
                    state.edges.push({ id: `edge-${Date.now()}-act-${i}`, source: cId, target: aId });
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
            const { sourceNodeId, parentEventPayload, parentEventLabel, offsetX = 450, offsetY = 0 } = action.payload;
            const sourceNode = state.nodes.find(n => n.id === sourceNodeId);
            if (!sourceNode) return;

            // Check if a linked node for this event already exists
            const alreadyLinked = state.nodes.find(
                n => n.data?.parent_event === parentEventPayload && state.edges.some(e => e.source === sourceNodeId && e.target === n.id)
            );
            if (alreadyLinked) return;

            const newNodeId = `node-reply-${Date.now()}`;
            // Stack reply nodes vertically based on how many already exist from this source
            const existingReplies = state.edges.filter(e => e.source === sourceNodeId && e.label).length;
            const newNode: FlowNode = {
                id: newNodeId,
                type: 'action',
                position: {
                    x: sourceNode.position.x + offsetX,
                    y: sourceNode.position.y + existingReplies * 220 + offsetY,
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
    undo,
    redo
} = flowSlice.actions;

export default flowSlice.reducer;
