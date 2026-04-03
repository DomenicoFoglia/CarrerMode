import { create } from 'zustand'

const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme || 'midnight')
}

// Applica il tema salvato subito al caricamento della pagina
applyTheme(localStorage.getItem('theme') || 'midnight')

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    setUser: (user) => {
        if (user?.theme) {
            applyTheme(user.theme)
            localStorage.setItem('theme', user.theme)
        }
        set({ user })
    },
    setToken: (token) => {
        localStorage.setItem('token', token)
        set({ token, isAuthenticated: true })
    },
    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('theme') // al logout rimuove il tema scelto dal localstorage
        set({ user: null, token: null, isAuthenticated: false })
    },
}))

export default useAuthStore