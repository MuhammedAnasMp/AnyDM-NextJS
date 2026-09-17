import axios from 'axios';
import { clearApiCache } from './api.service';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    fetchSignInMethodsForEmail,
    sendPasswordResetEmail,
    signInWithCustomToken
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { store } from '@/store';
import { setUser, clearAuth, setInstagramAccounts, setTokens, setHydrating, setFetchingAccounts } from '@/store/slices/authSlice';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localapi.locanydm.online';
const hasProtocol = rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://');
const isLocal = rawApiUrl.includes('localhost') || 
                rawApiUrl.includes('127.0.0.1') || 
                rawApiUrl.startsWith('192.168.') || 
                rawApiUrl.startsWith('10.') || 
                rawApiUrl.startsWith('172.');

const protocol = hasProtocol ? '' : (isLocal ? 'http://' : 'https://');
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${protocol}${rawApiUrl}/api`;

if (typeof window !== 'undefined') {
    axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
}

class AuthService {
    async loginWithGoogle() {
        try {
            if (!auth) throw new Error('Firebase Auth is not initialized');
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            return this.exchangeFirebaseToken(idToken);
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    }

    async loginWithEmail(email: string, pass: string) {
        try {
            if (!auth) throw new Error('Firebase Auth is not initialized');
            const result = await signInWithEmailAndPassword(auth, email, pass);
            const idToken = await result.user.getIdToken();
            return this.exchangeFirebaseToken(idToken);
        } catch (error) {
            console.error('Email login error:', error);
            throw error;
        }
    }

    async signupWithEmail(email: string, pass: string) {
        try {
            if (!auth) throw new Error('Firebase Auth is not initialized');
            const result = await createUserWithEmailAndPassword(auth, email, pass);
            const idToken = await result.user.getIdToken();
            return this.exchangeFirebaseToken(idToken);
        } catch (error) {
            console.error('Email signup error:', error);
            throw error;
        }
    }

    async resetPassword(email: string) {
        try {
            if (!auth) throw new Error('Firebase Auth is not initialized');
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    async getSignInMethods(email: string) {
        try {
            if (!auth) throw new Error('Firebase Auth is not initialized');
            return await fetchSignInMethodsForEmail(auth, email);
        } catch (error) {
            console.error('Fetch sign-in methods error:', error);
            return [];
        }
    }

    async exchangeFirebaseToken(idToken: string) {
        try {
            store.dispatch(setHydrating(true));
            const referralCode = typeof window !== 'undefined' ? sessionStorage.getItem('referral_code') : null;
            const payload: any = { id_token: idToken };
            if (referralCode) {
                payload.referral_code = referralCode;
            }
            const response = await axios.post(`${API_URL}/accounts/auth/firebase/`, payload);

            const { tokens, user, instagram_accounts } = response.data;
            const { access, refresh } = tokens;

            if (typeof window !== 'undefined') {
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
            }
            store.dispatch(setTokens({ access, refresh }));
            
            store.dispatch(setUser(user));
            if (instagram_accounts) {
                store.dispatch(setInstagramAccounts(instagram_accounts));
            }

            store.dispatch(setHydrating(false));
            return { access, refresh, user, instagram_accounts };
        } catch (error) {
            console.error('Token exchange error:', error);
            store.dispatch(setHydrating(false));
            throw error;
        }
    }

    async exchangeInstagramCode(code: string, redirectUri?: string, isLinking: boolean = false) {
        try {
            const config = {};
            const token = isLinking ? this.getAccessToken() : null;
            if (token) {
                (config as any).headers = { Authorization: `Bearer ${token}` };
            }

            const referralCode = typeof window !== 'undefined' ? sessionStorage.getItem('referral_code') : null;
            const payload: any = {
                code: code,
                redirect_uri: redirectUri || `${window.location.origin}/login`
            };
            if (referralCode && !isLinking) {
                payload.referral_code = referralCode;
            }

            const response = await axios.post(`${API_URL}/accounts/auth/instagram/`, payload, config);

            const { tokens, user, instagram_account, firebase_token } = response.data;
            const { access, refresh } = tokens;

            if (firebase_token && auth) {
                await signInWithCustomToken(auth, firebase_token);
            }

            if (!token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', access);
                    localStorage.setItem('refresh_token', refresh);
                }
                store.dispatch(setTokens({ access, refresh }));
            }

            const currentUser = this.getCurrentUser() || {};
            const updatedUser = { ...currentUser, ...user };

            store.dispatch(setUser(updatedUser));
            
            await this.getConnectedInstagramAccounts();

            return { tokens, user: updatedUser, instagram_account };
        } catch (error) {
            console.error('Instagram code exchange error:', error);
            throw error;
        }
    }

    async loginWithInstagram(accessToken: string) {
        try {
            const config = {};
            const token = this.getAccessToken();
            if (token) {
                (config as any).headers = { Authorization: `Bearer ${token}` };
            }

            const response = await axios.post(`${API_URL}/accounts/auth/instagram/`, {
                access_token: accessToken
            }, config);

            const { tokens, user, instagram_account, firebase_token } = response.data;
            const { access, refresh } = tokens;

            if (firebase_token && auth) {
                await signInWithCustomToken(auth, firebase_token);
            }

            if (!token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', access);
                    localStorage.setItem('refresh_token', refresh);
                }
                store.dispatch(setTokens({ access, refresh }));
            }

            const currentUser = this.getCurrentUser() || {};
            const updatedUser = {
                ...currentUser,
                ...user,
            };

            const accounts = currentUser.connected_instagram_accounts || [];
            const exists = accounts.find((a: any) => a.instagram_id === instagram_account.instagram_id);
            if (!exists) {
                accounts.push(instagram_account);
            } else {
                Object.assign(exists, instagram_account);
            }
            updatedUser.connected_instagram_accounts = accounts;

            store.dispatch(setUser(updatedUser));

            return { tokens, user: updatedUser };
        } catch (error) {
            console.error('Instagram login error:', error);
            throw error;
        }
    }

    async updateProfile(data: { display_name?: string; photo_url?: string; profile_picture_url?: string }) {
        try {
            const token = this.getAccessToken();
            const response = await axios.post(`${API_URL}/accounts/profile/update/`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const currentUser = this.getCurrentUser() || {};
            const photoUrl = response.data.photo_url !== undefined ? response.data.photo_url : (data.photo_url || data.profile_picture_url || currentUser.photo_url);
            const updatedUser = {
                ...currentUser,
                display_name: response.data.display_name || data.display_name || currentUser.display_name,
                first_name: response.data.display_name || data.display_name || currentUser.first_name,
                photo_url: photoUrl,
                profile_picture_url: photoUrl,
            };
            store.dispatch(setUser(updatedUser));
            return response.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            if (auth) {
                await signOut(auth);
            }
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
            }
            store.dispatch(clearAuth());
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    getCurrentUser() {
        return store.getState().auth.user;
    }

    async getConnectedInstagramAccounts() {
        try {
            const token = this.getAccessToken();
            if (!token) return [];
            
            store.dispatch(setFetchingAccounts(true));
            const response = await axios.get(`${API_URL}/accounts/auth/instagram/accounts/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const accounts = response.data.accounts || [];
            store.dispatch(setInstagramAccounts(accounts));
            store.dispatch(setFetchingAccounts(false));
            return accounts;
        } catch (error) {
            console.error('Fetch Instagram accounts error:', error);
            store.dispatch(setFetchingAccounts(false));
            return [];
        }
    }

    async removeInstagramAccount(accountId: number) {
        try {
            const token = this.getAccessToken();
            const response = await axios.post(`${API_URL}/accounts/auth/instagram/remove/`, {
                account_id: accountId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Remove Instagram account error:', error);
            throw error;
        }
    }

    async toggleInstagramEnabled(accountId: number, isEnabled: boolean) {
        try {
            const token = this.getAccessToken();
            const response = await axios.post(`${API_URL}/accounts/auth/instagram/toggle-enabled/`, {
                account_id: accountId,
                is_enabled: isEnabled
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Toggle Instagram enabled error:', error);
            throw error;
        }
    }

    async setActiveInstagramAccount(accountId: number) {
        try {
            const token = this.getAccessToken();
            const response = await axios.post(`${API_URL}/accounts/auth/instagram/set-active/`, {
                account_id: accountId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Clear the in-memory API cache so all pages re-fetch for the new account
            clearApiCache();
            
            const currentUser = this.getCurrentUser();
            if (currentUser) {
                store.dispatch(setUser({
                    ...currentUser,
                    active_instagram_account_id: accountId
                }));
            }
            return response.data;
        } catch (error) {
            console.error('Set active Instagram account error:', error);
            throw error;
        }
    }

    getAccessToken() {
        return store.getState().auth.accessToken || (typeof window !== "undefined" ? localStorage.getItem('access_token') : null);
    }

    getRefreshToken() {
        return store.getState().auth.refreshToken || (typeof window !== "undefined" ? localStorage.getItem('refresh_token') : null);
    }

    async refreshToken() {
        const refresh = this.getRefreshToken();
        if (!refresh) throw new Error('No refresh token available');

        try {
            const response = await axios.post(`${API_URL}/accounts/token/refresh/`, {
                refresh: refresh
            });
            const { access } = response.data;
            if (typeof window !== 'undefined') {
                localStorage.setItem('access_token', access);
            }
            store.dispatch(setTokens({ access, refresh: refresh }));
            return access;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            throw error;
        }
    }

    isAuthenticated() {
        return !!this.getAccessToken();
    }

    formatError(error: any): string {
        if (error?.response?.data) {
            const apiData = error.response.data;
            if (typeof apiData.error === 'string' && apiData.error) return apiData.error;
            if (typeof apiData.details === 'string' && apiData.details) return apiData.details;
            if (typeof apiData.message === 'string' && apiData.message) return apiData.message;
            if (typeof apiData.detail === 'string' && apiData.detail) return apiData.detail;
            if (typeof apiData === 'string' && apiData && !apiData.includes('<html')) return apiData;
        }

        const rawMsg = String(error?.message || '');
        const code = error?.code || (rawMsg.match(/auth\/[a-z-]+/)?.[0] || '');

        switch (code) {
            case 'auth/email-already-in-use':
                return 'This email address is already registered. Please sign in instead.';
            case 'auth/invalid-email':
                return 'The email address is invalid. Please check for typos and try again.';
            case 'auth/operation-not-allowed':
                return 'Support for this login method is currently disabled.';
            case 'auth/weak-password':
                return 'Your password is too weak. It must be at least 6 characters long.';
            case 'auth/user-disabled':
                return 'This account has been disabled. Please contact support.';
            case 'auth/user-not-found':
                return 'No account was found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/invalid-credential':
                return 'Invalid login credentials. Please check your email and password.';
            case 'auth/popup-closed-by-user':
                return 'The login window was closed before completing.';
            case 'auth/popup-blocked':
                return 'The login popup was blocked by your browser. Please allow popups for this site.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again in a few minutes.';
            case 'auth/unauthorized-domain':
                return 'This domain is not authorized in Firebase Authentication. Please add anydm.in (or your domain) to Authorized Domains in Firebase Console.';
            case 'auth/email-already-in-use':
                return 'An account with this email address already exists. Please log in instead.';
            case 'auth/credential-already-in-use':
            case 'auth/account-exists-with-different-credential':
                return 'An account already exists with this email using a different sign-in method.';
            case 'auth/network-request-failed':
                return 'Network request failed. Please check your internet connection and try again.';
            case 'auth/internal-error':
                return 'Internal authentication error. Please try again.';
            default:
                if (code) {
                    const readableCode = code.replace(/^auth\//, '').replace(/-/g, ' ');
                    const capitalized = readableCode.charAt(0).toUpperCase() + readableCode.slice(1);
                    return `${capitalized}. Please check your details and try again.`;
                }
                if (rawMsg.startsWith('Firebase: Error')) {
                    const cleanMsg = rawMsg.replace(/^Firebase:\s*Error\s*\(auth\/[a-z-]+\)\.?\s*/i, '').trim();
                    if (cleanMsg) return cleanMsg;
                }
                return error?.message || 'An unexpected error occurred. Please try again.';
        }
    }
}

export const authService = new AuthService();
