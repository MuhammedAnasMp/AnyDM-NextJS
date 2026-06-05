import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Automation {
  id: string;
  name: string;
  rule_type: string;
  trigger_event: string;
  status: 'active' | 'disabled';
  count: string;
  keywords: string[];
  actions: Array<{
    action_type: string;
    messages: string[];
  }>;
}

interface AutomationState {
  createdAutomations: Automation[];
  activeAutomationId: string | null;
}

const initialState: AutomationState = {
  createdAutomations: [], // Start empty so the header initially shows the "Create Automation" trigger
  activeAutomationId: null,
};

const automationSlice = createSlice({
  name: 'automation',
  initialState,
  reducers: {
    addAutomation: (state, action: PayloadAction<Automation>) => {
      state.createdAutomations.unshift(action.payload);
      state.activeAutomationId = action.payload.id;
    },
    deleteAutomation: (state, action: PayloadAction<string>) => {
      state.createdAutomations = state.createdAutomations.filter(auto => auto.id !== action.payload);
      if (state.activeAutomationId === action.payload) {
        state.activeAutomationId = state.createdAutomations[0]?.id || null;
      }
    },
    toggleAutomation: (state, action: PayloadAction<{ id: string; isEnabled: boolean }>) => {
      const auto = state.createdAutomations.find(a => a.id === action.payload.id);
      if (auto) {
        auto.status = action.payload.isEnabled ? 'active' : 'disabled';
      }
    },
    setActiveAutomation: (state, action: PayloadAction<string | null>) => {
      state.activeAutomationId = action.payload;
    }
  }
});

export const {
  addAutomation,
  deleteAutomation,
  toggleAutomation,
  setActiveAutomation
} = automationSlice.actions;

export default automationSlice.reducer;
