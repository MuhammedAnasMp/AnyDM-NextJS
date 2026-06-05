import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  instagramAccounts: any[];
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  isFetchingAccounts: boolean;
}

const initialState: AuthState = {
  user: null,
  instagramAccounts: [],
  accessToken: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  refreshToken: typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null,
  isAuthenticated: false,
  isHydrating: true,
  isFetchingAccounts: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setInstagramAccounts: (state, action: PayloadAction<any[]>) => {
      state.instagramAccounts = action.payload;
    },
    setTokens: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
    },
    setHydrating: (state, action: PayloadAction<boolean>) => {
      state.isHydrating = action.payload;
    },
    setFetchingAccounts: (state, action: PayloadAction<boolean>) => {
      state.isFetchingAccounts = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.instagramAccounts = [];
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isHydrating = false;
      state.isFetchingAccounts = false;
    },
  },
});

export const { 
  setUser, 
  setInstagramAccounts, 
  setTokens, 
  setHydrating, 
  setFetchingAccounts, 
  clearAuth 
} = authSlice.actions;
export default authSlice.reducer;
