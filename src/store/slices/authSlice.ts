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
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrating: false,
  isFetchingAccounts: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("user", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("user");
        }
      }
    },
    setInstagramAccounts: (state, action: PayloadAction<any[]>) => {
      state.instagramAccounts = action.payload || [];
      if (typeof window !== "undefined") {
        localStorage.setItem("instagram_accounts", JSON.stringify(action.payload || []));
      }
    },
    setTokens: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      if (typeof window !== "undefined") {
        if (action.payload.access) localStorage.setItem("access_token", action.payload.access);
        if (action.payload.refresh) localStorage.setItem("refresh_token", action.payload.refresh);
      }
    },
    setHydrating: (state, action: PayloadAction<boolean>) => {
      state.isHydrating = action.payload;
    },
    setFetchingAccounts: (state, action: PayloadAction<boolean>) => {
      state.isFetchingAccounts = action.payload;
    },
    hydrateFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        const storedAccess = localStorage.getItem("access_token");
        const storedRefresh = localStorage.getItem("refresh_token");
        const storedAccounts = localStorage.getItem("instagram_accounts");
        if (storedUser) {
          try {
            state.user = JSON.parse(storedUser);
            state.isAuthenticated = true;
          } catch (e) {}
        }
        if (storedAccess) state.accessToken = storedAccess;
        if (storedRefresh) state.refreshToken = storedRefresh;
        if (storedAccounts) {
          try {
            state.instagramAccounts = JSON.parse(storedAccounts);
          } catch (e) {}
        }
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.instagramAccounts = [];
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isHydrating = false;
      state.isFetchingAccounts = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.removeItem("instagram_accounts");
      }
    },
  },
});

export const { 
  setUser, 
  setInstagramAccounts, 
  setTokens, 
  setHydrating, 
  setFetchingAccounts, 
  hydrateFromStorage,
  clearAuth 
} = authSlice.actions;
export default authSlice.reducer;

