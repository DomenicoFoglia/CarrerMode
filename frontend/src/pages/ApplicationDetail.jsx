import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import './ApplicationDetail.css';
import { getApplication } from '../api/applications';


function ApplicationDetail() {
    const { id } = useParams(); // Recupera l'ID dall'URL (es. /applications/5)
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    

    useEffect(() => {
        const fetchDetail = async () => {
            try{
                const response = await getApplication(id);
                setApplication(response.data.application);

                console.log("Candidataura ricevuta dal server:", response.data)
            }catch(error){
                console.error("Errore nel caricamento della candidatura:", error);
                setError("Candidatura non trovata o errore del server.");
            }finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]); //Se cambia l'ID riesegue useEffect

    if (loading) return <div className="loading">Caricamento candidature...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate('/applications')}>
                    ← Torna alla lista
                </button>
                <h1>Dettaglio Candidatura</h1>
            </div>

            <div className="detail-card">
                <div className="detail-row">
                    <span className="label">Azienda:</span>
                    <span className="value">{application.company}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Ruolo:</span>
                    <span className="value">{application.role}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Stato:</span>
                    <span className={`status-badge ${application.status}`}>
                        {application.status}
                    </span>
                </div>
                <div className="detail-row">
                    <span className="label">Data Inserimento:</span>
                    <span className="value">
                        {new Date(application.created_at).toLocaleString('it-IT')}
                    </span>
                </div>
                
                {/* Aggiungeremo qui Note, Link e Tag in futuro */}
                <div className="detail-section">
                    <h3>Note</h3>
                    <p>{application.notes || "Nessuna nota presente."}</p>
                </div>
            </div>
        </div>
    );
}

export default ApplicationDetail