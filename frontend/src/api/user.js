import api from './axios'

export const updateTheme = (theme) => {
    return api.put('/user/theme', { theme })
}

export const updatePassword = (data) => {
    return api.put('/user/password', data)
}

export const updateGeminiKey = (key) => api.put('/user/gemini-key', { gemini_api_key: key })

export const getGeminiKeyStatus = () => api.get('/user/gemini-key-status')

export const updateName = (name) => api.put('/user/name', { name })

export const completeOnboarding = () => api.post('/user/onboarding-complete')
export const resetOnboarding = () => api.post('/user/onboarding-reset')

export const updateAiProvider = (provider) => api.put('/user/ai-provider', { ai_provider: provider })
export const updateGroqKey = (key) => api.put('/user/groq-key', { groq_api_key: key })
export const getGroqKeyStatus = () => api.get('/user/groq-key-status')