import api from './axios';

// Recupera tutti i promemoria
export const getReminders = () => api.get('/reminders');

export const createReminder = (applicationId, data) => {
    return api.post(`/applications/${applicationId}/reminders`, data);
}

export const updateReminder = (id, data) => {
    return api.put(`/reminders/${id}`, data);
}

export const deleteReminder = (id) => {
    return api.delete(`/reminders/${id}`);
}