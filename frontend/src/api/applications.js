import ApplicationDetail from '../pages/ApplicationDetail';
import api from './axios'

// Recupera la lista completa per la tabella
export const getApplications = ( params = {}) => {
    return api.get('/applications', {params});
}

// Recupoera una applicazione specifica in modo dinamico
export const getApplication = (id) =>{
    return api.get(`/applications/${id}`);
}

// Recupera i numeri aggregati per le card della Dashboard
export const getStats = () => {
    return api.get('/applications/stats');
}

export const createApplication = (data) => {
    return api.post('/applications', data);
}

export const updateApplication = (id, data) => {
    return api.put(`/applications/${id}`, data)
}

export const deleteApplication = (id) => api.delete(`/applications/${id}`);

export const exportApplications = () => 
    api.get('/applications/export', { responseType: 'blob' })

