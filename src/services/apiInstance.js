import axios from 'axios';
import { store } from '../store/store';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        let token = null;
        try {
            // Try to get token from Redux store first
            token = store.getState().auth.token;
            console.log("token", token);
        } catch (error) {
            console.warn('Could not get token from Redux store', error);
        }

        // Fallback to localStorage
        if (!token) {
            token = localStorage.getItem('token');
        }

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
