import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import automationReducer from './slices/automationSlice';
import flowReducer from './slices/flowSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    automation: automationReducer,
    flow: flowReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
