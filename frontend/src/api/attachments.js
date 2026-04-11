import api from './axios'

export const uploadAttachment = (applicationId, type, file) => {
    const formData = new FormData()
    formData.append('type', type)
    formData.append('file', file)
    return api.post(`/applications/${applicationId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export const deleteAttachment = (id) => {
    return api.delete(`/attachments/${id}`)
}

export const downloadAttachment = (id) => 
    api.get(`/attachments/${id}`, { responseType: 'blob' })