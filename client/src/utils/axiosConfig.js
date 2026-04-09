import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;
        // 401: Unauthorized, 403: Forbidden
        if (response && (response.status === 401 || response.status === 403)) {
            // Optional: check if the original request was for login
            if (!error.config.url.includes('/api/auth/login') && !error.config.url.includes('/api/auth/register')) {
                toast.error('Session expired. Please log in again.');
                sessionStorage.removeItem('userInfo');
                sessionStorage.removeItem('token');
                // Redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
