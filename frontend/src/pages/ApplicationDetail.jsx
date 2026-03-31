import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import './ApplicationDetail.css';
import { getApplication } from '../api/applications';
import { deleteApplication } from '../api/applications';

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

    const handleDelete = async () => {
        if (window.confirm("Sei sicuro di voler eliminare questa candidatura? L'azione è irreversibile.")) {
            try {
                await deleteApplication(id);
                navigate('/applications'); // Torna alla lista dopo l'eliminazione
            } catch (err) {
                alert("Errore durante l'eliminazione.");
                console.error(err);
            }
        }
    };

    if (loading) return <div className="loading">Caricamento candidature...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate('/applications')}>
                    ← Torna alla lista
                </button>

                <button className="btn-delete" onClick={handleDelete}>
                    Elimina Candidatura
                </button>
                
                <div className="header-info">
                    <h1>{application.role} @ {application.company}</h1>
                    <span className={`status-badge ${application.status}`}>{application.status}</span>
                </div>
            </div>

            <div className="detail-grid">
                {/* COLONNA SINISTRA: Info Posizione */}
                <div className="detail-card">
                    <h3>Dettagli Posizione</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="label">Località:</span>
                            <span className="value">{application.location || 'Non specificata'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Contratto:</span>
                            <span className="value">{application.contract_type || 'Non specificato'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">RAL / Range:</span>
                            <span className="value">{application.salary_range || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Sorgente:</span>
                            <span className="value">{application.source || 'Diretto'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Data Invio:</span>
                            <span className="value">{new Date(application.applied_at).toLocaleDateString('it-IT')}</span>
                        </div>
                    </div>
                    
                    {application.url && (
                        <a href={application.url} target="_blank" rel="noreferrer" className="btn-link">
                            Apri Annuncio Originale ↗
                        </a>
                    )}
                </div>

                {/* COLONNA DESTRA: Valutazioni */}
                <div className="detail-card">
                    <h3>Valutazione & Match</h3>
                    <div className="rating-box">
                        <div className="rating-item">
                            <span className="label">Interesse</span>
                            <div className="rating-value">{application.interest_rating}<span>/5</span></div>
                        </div>
                        <div className="rating-item">
                            <span className="label">Match Score</span>
                            <div className="rating-value highlight">{application.match_score}%</div>
                        </div>
                    </div>
                    
                    <div className="notes-section">
                        <h4>Note Personali</h4>
                        <p>{application.notes || 'Nessuna nota inserita.'}</p>
                    </div>
                </div>
            </div>

            {/* SEZIONE FULL WIDTH: Testo Offerta */}
            {application.offer_text && (
                <div className="detail-card full-width">
                    <h3>Testo dell'Offerta</h3>
                    <div className="offer-text-content">
                        {application.offer_text}
                    </div>
                </div>
            )}

            {/* SEZIONE TAG */}
            <div className="detail-card full-width">
                <h3>Tag</h3>
                <div className="tags-container">
                    {application.tags && application.tags.length > 0 ? (
                        application.tags.map(tag => (
                            <span
                                key={tag.id}
                                className="tag-badge"
                                style={{ backgroundColor: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}` }}
                            >
                                {tag.name}
                            </span>
                        ))
                    ) : (
                        <p style={{ color: '#4a5060' }}>Nessun tag associato.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ApplicationDetail