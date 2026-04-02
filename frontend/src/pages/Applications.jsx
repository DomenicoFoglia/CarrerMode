import { useEffect, useState } from 'react';
import './Applications.css';
import { getApplications } from '../api/applications';
import { useNavigate } from 'react-router-dom';


function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    
    useEffect(() =>{
        const fetchApps = async () => {
            try{
                const response = await getApplications();
                const data = response.data.data || response.data;
                setApplications(data);
                console.log("Candidataure ricevute dal server:", data)
            }catch(error){
                console.error("Errore nel caricamento delle candidature:", error);
            }finally{
                setLoading(false);
            }
        };

        fetchApps();
    }, []);

    if (loading) return <div className="loading">Caricamento candidature...</div>;
    
    return (
        <div className='applications-container'>
            <div className="apps-header">
                <h1>Le mie candidature</h1>
                <button 
                    className="btn-add" 
                    onClick={() => navigate('/applications/new')}>
                    Nuova Candidatura
                </button>
            </div>

            <div className="apps-table-container">
                <table className="apps-table">
                    <thead>
                        <tr>
                            <th>Azienda</th>
                            <th>Ruolo</th>
                            <th>Data</th>
                            <th>Stato</th>
                            <th>Tag</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {applications.length > 0 ? (
                            applications.map(app => (
                                <tr key={app.id}>
                                    <td><strong>{app.company}</strong></td>
                                    <td>{app.role}</td>
                                    <td>{new Date(app.created_at).toLocaleDateString('it-IT')}</td>
                                    <td>
                                        <span className={`status-badge ${app.status}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-tags">
                                            {app.tags && app.tags.length > 0 ? (
                                                app.tags.map(tag => (
                                                    <span
                                                        key={tag.id}
                                                        className="tag-badge"
                                                        style={{ backgroundColor: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}` }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{color: '#4a5060', fontSize: '12px'}}>—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="btn-small"
                                            onClick={() => navigate(`/applications/${app.id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        {/* AGGIUNTO: Pulsante Modifica rapida */}
                                        <button 
                                            className="btn-small btn-outline"
                                            onClick={() => navigate(`/applications/${app.id}/edit`)}
                                        >
                                            Modifica
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    Non hai ancora inserito nessuna candidatura.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Applications