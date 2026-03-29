import api from './axios'

// Recupera la lista completa per la tabella
export const getApplications = () => {
    return api.get('/applications');
}

export const getApplication = (id) =>{
    return api.get(`/applications/${id}`);
}

// Recupera i numeri aggregati per le card della Dashboard
export const getStats = () => {
    return api.get('/applications/stats');
}

