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
                <button className="btn-add">Nuova Candidatura</button>
            </div>

            <div className="apps-table-container">
                <table className="apps-table">
                    <thead>
                        <tr>
                            <th>Azienda</th>
                            <th>Ruolo</th>
                            <th>Data</th>
                            <th>Stato</th>
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
                                        <button onClick={() => navigate(`/applications/${app.id}`)}>Dettagli</button>
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