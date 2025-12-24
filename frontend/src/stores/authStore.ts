import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import type { User, LoginResponse } from '../services/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
    clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Login action
            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response: LoginResponse = await authApi.login(email, password);
                    
                    // Store token in localStorage (via persist middleware)
                    set({
                        token: response.access_token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    // Also store in localStorage directly for API service
                    localStorage.setItem('access_token', response.access_token);

                    // Load user data
                    await get().loadUser();
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Login failed',
                        isLoading: false,
                        isAuthenticated: false,
                        token: null,
                    });
                    throw error;
                }
            },

            // Register action
            register: async (email: string, password: string, name: string) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.register({ email, password, name });
                    // After registration, automatically log in
                    await get().login(email, password);
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Registration failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            // Logout action
            logout: () => {
                authApi.logout();
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            // Load current user data
            loadUser: async () => {
                const { token } = get();
                if (!token) {
                    set({ user: null, isAuthenticated: false });
                    return;
                }

                try {
                    const user = await authApi.getCurrentUser();
                    set({ user, isAuthenticated: true });
                } catch (error) {
                    // Token might be invalid, clear auth state
                    get().logout();
                }
            },

            // Clear error message
            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'auth-storage', // localStorage key
            partialize: (state) => ({
                token: state.token,
                // Don't persist user or isAuthenticated - reload from API
            }),
        }
    )
);