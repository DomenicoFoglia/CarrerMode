import { create } from 'zustand'

const useAuthStore = create((set) => ({
    // stato iniziale
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    // azioni per modificare lo stato
    setUser: (user) => set({ user }),
    setToken: (token) => {
        localStorage.setItem('token', token)
        set({ token, isAuthenticated: true })
    },
    logout: () => {
    localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
    },
}))

export default useAuthStore