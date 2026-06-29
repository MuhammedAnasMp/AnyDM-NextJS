import axios from 'axios';
import { authService } from './auth.service';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const hasProtocol = rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://');
const isLocal = rawApiUrl.includes('localhost') || 
                rawApiUrl.includes('127.0.0.1') || 
                rawApiUrl.startsWith('192.168.') || 
                rawApiUrl.startsWith('10.') || 
                rawApiUrl.startsWith('172.');

const protocol = hasProtocol ? '' : (isLocal ? 'http://' : 'https://');
const API_URL = `${protocol}${rawApiUrl}/api`;

// In-memory cache store
const cacheMap = new Map<string, {
    data: any;
    headers: any;
    status: number;
    statusText: string;
    timestamp: number;
}>();

// Default TTL: 2 minutes
const DEFAULT_TTL = 2 * 60 * 1000;

// Get the default Axios adapter
const defaultAdapter = (() => {
    const adapter = axios.defaults.adapter;
    if (typeof adapter === 'function') {
        return adapter;
    }
    if (typeof (axios as any).getAdapter === 'function') {
        return (axios as any).getAdapter(adapter);
    }
    return null;
})();

const cacheAdapter = async (config: any) => {
    const method = config.method?.toLowerCase();

    // Only cache GET requests
    if (method === 'get') {
        const bypassCache = config.headers?.['x-bypass-cache'] === 'true' || config.bypassCache;

        if (!bypassCache) {
            const serializedParams = config.params
                ? (typeof config.params === 'string' ? config.params : JSON.stringify(config.params))
                : '';
            const authHeader = config.headers?.Authorization || '';
            const cacheKey = `${authHeader}:${config.url}?${serializedParams}`;

            const cached = cacheMap.get(cacheKey);
            const ttl = config.cacheTTL || DEFAULT_TTL;

            if (cached && Date.now() - cached.timestamp < ttl) {
                console.log(`[API Cache Hit] ${config.url}`);
                return {
                    data: cached.data,
                    status: cached.status,
                    statusText: cached.statusText,
                    headers: cached.headers,
                    config,
                    request: config.request
                };
            }

            console.log(`[API Cache Miss] ${config.url}`);
            if (defaultAdapter) {
                const response = await defaultAdapter(config);
                if (response.status >= 200 && response.status < 300) {
                    cacheMap.set(cacheKey, {
                        data: response.data,
                        headers: response.headers,
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: Date.now()
                    });
                }
                return response;
            }
        }
    } else if (['post', 'put', 'delete', 'patch'].includes(method || '')) {
        // Invalidate the entire cache on any mutating request
        console.log(`[API Cache Invalidation] Mutating request (${method?.toUpperCase()}) to ${config.url}. Clearing cache.`);
        cacheMap.clear();
    }

    if (defaultAdapter) {
        return defaultAdapter(config);
    }
    throw new Error('No Axios adapter available');
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'ngrok-skip-browser-warning': 'true'
    },
    adapter: cacheAdapter as any
});

api.interceptors.request.use(
    (config) => {
        const token = authService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await authService.refreshToken();
                const newToken = authService.getAccessToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (err) {
                authService.logout();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?expired=true';
                }
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export const clearApiCache = () => {
    cacheMap.clear();
};

export default api;
