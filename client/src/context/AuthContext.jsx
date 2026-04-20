import { createContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            setUser(data);
            sessionStorage.setItem('userInfo', JSON.stringify(data));
            sessionStorage.setItem('token', data.token);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const sendSignupOTP = async (name, email, password, role) => {
        try {
            const { data } = await api.post('/api/auth/signup-otp', { name, email, password, role });
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to send verification code' };
        }
    };

    const register = async (email, otp) => {
        try {
            const { data } = await api.post('/api/auth/register', { email, otp });
            setUser(data);
            sessionStorage.setItem('userInfo', JSON.stringify(data));
            sessionStorage.setItem('token', data.token);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('userInfo');
        sessionStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (data) => {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        sessionStorage.setItem('userInfo', JSON.stringify(updatedUser));
        if (data.token) {
            sessionStorage.setItem('token', data.token);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, sendSignupOTP, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
