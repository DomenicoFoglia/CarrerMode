import { create } from 'zustand'

const useAuthStore = create((set) => ({
    // stato iniziale
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,

    // azioni per modificare lo stato
    setUser: (user) => set({ user }),
    setToken: (token) => set({ 
        token,
        isAuthenticated: !!token
    }),
    logout: () => set({ user: null, token: null, isAuthenticated: false }),
}))

export default useAuthStore