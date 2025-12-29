import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, Theme } from '../types';

interface AuthContextType {
    token: string | null;
    user: User | null;
    activeTheme: Theme | null;
    loading: boolean;
    isAuthenticated: boolean;
    loginState: (newToken: string, newUser: User, activeTheme?: Theme | null) => void;
    logoutState: () => void;
    updateActiveTheme: (theme: Theme | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        const savedTheme = localStorage.getItem('activeTheme');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            if (savedTheme) setActiveTheme(JSON.parse(savedTheme));
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
        setLoading(false);
    }, []);

    const loginState = (newToken: string, newUser: User, theme?: Theme | null) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        if (theme) localStorage.setItem('activeTheme', JSON.stringify(theme));
        else localStorage.removeItem('activeTheme');

        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(newUser);
        setActiveTheme(theme || null);
    };

    const logoutState = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeTheme');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        setActiveTheme(null);
    };

    const updateActiveTheme = (theme: Theme | null) => {
        if (theme) localStorage.setItem('activeTheme', JSON.stringify(theme));
        else localStorage.removeItem('activeTheme');
        setActiveTheme(theme);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{
            token,
            user,
            activeTheme,
            loading,
            isAuthenticated,
            loginState,
            logoutState,
            updateActiveTheme
        }}>
            {children}
        </AuthContext.Provider>
    );
};
