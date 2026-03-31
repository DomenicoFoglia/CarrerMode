import api from './axios'

export const updateTheme = (theme) => {
    return api.put('/user/theme', { theme })
}

export const updatePassword = (data) => {
    return api.put('/user/password', data)
}