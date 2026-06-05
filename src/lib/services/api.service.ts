import axios from 'axios';
import { authService } from './auth.service';

const API_URL = `https://${process.env.NEXT_PUBLIC_API_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'ngrok-skip-browser-warning': 'true'
    }
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

export default api;
