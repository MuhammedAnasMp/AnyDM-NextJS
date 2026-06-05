import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlowState, FlowNode, NodeType } from '@/lib/types';
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
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      saveToPast(state);
      state.nodes = state.nodes.filter(n => n.id !== action.payload);
      state.edges = state.edges.filter(e => e.source !== action.payload && e.target !== action.payload);
      if (state.selectedNodeId === action.payload) {
        state.selectedNodeId = null;
        state.selectedNodeRect = null;
      }
    },
    addEdge: (state, action: PayloadAction<{ source: string; target: string }>) => {
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
      
      state.nodes.push({ id: tId, type: 'trigger', position: { x: 100, y: 150 }, data: caseData.target, ruleType });
      state.nodes.push({ id: cId, type: 'condition', position: { x: 550, y: 150 }, data: caseData.condition, ruleType });
      state.edges.push({ id: `edge-${Date.now()}-1`, source: tId, target: cId });
      
      if (caseData.giveaway) {
         const gId = `node-g-${Date.now()}`;
         state.nodes.push({ id: gId, type: 'giveaway_config', position: { x: 1000, y: 50 }, data: caseData.giveaway, ruleType });
         state.edges.push({ id: `edge-${Date.now()}-2`, source: cId, target: gId });
         
         if (caseData.giveaway.rewards) {
           const rId = `node-r-${Date.now()}`;
           state.nodes.push({ id: rId, type: 'reward', position: { x: 1450, y: 50 }, data: caseData.giveaway.rewards[0], ruleType });
           state.edges.push({ id: `edge-${Date.now()}-3`, source: gId, target: rId });
         }
      }
      
      if (caseData.actions) {
         caseData.actions.forEach((act, i) => {
            const aId = `node-a-${Date.now()}-${i}`;
            // Offset vertically for multiple actions
            state.nodes.push({ id: aId, type: 'action', position: { x: 1000, y: caseData.giveaway ? 300 + (i * 200) : 150 + (i * 200) }, data: { ...act, is_placeholder: true }, ruleType });
            state.edges.push({ id: `edge-${Date.now()}-act-${i}`, source: cId, target: aId });
         });
      }
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
  addNode, 
  updateNodePosition, 
  updateNodeData, 
  removeNode, 
  addEdge, 
  removeEdge, 
  selectNode, 
  addDefaultFlowTemplate,
  undo,
  redo
} = flowSlice.actions;

export default flowSlice.reducer;
