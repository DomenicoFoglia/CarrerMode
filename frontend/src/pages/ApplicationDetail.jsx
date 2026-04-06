import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
import './ApplicationDetail.css';
import { getApplication } from '../api/applications';
import { deleteApplication } from '../api/applications';
import { analyzeOffer, generateCoverLetter } from '../api/ai'

function ApplicationDetail() {
    const { id } = useParams(); // Recupera l'ID dall'URL (es. /applications/5)
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //AI
    const [aiLoading, setAiLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [coverLetter, setCoverLetter] = useState(null);
    const [aiPanel, setAiPanel] = useState(null);
    const aiPanelRef = useRef(null);

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

    const handleAnalyze = async () => {
        if (!application.offer_text) {
            alert('Questa candidatura non ha il testo dell\'offerta. Aggiungilo modificando la candidatura.')
            return
        }
        setAiLoading(true);
        setAiPanel('analysis');

        setTimeout(() => {
            aiPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100);

        try {
            const res = await analyzeOffer(application.offer_text)
            setAnalysis(res.data)
        } catch (error) {
            const msg = error.response?.data?.message || 'Errore nella chiamata AI.'
            alert(msg)
            setAiPanel(null)
        } finally {
            setAiLoading(false)
        }
    }

    const handleCoverLetter = async () => {
        if (!application.offer_text) {
            alert('Questa candidatura non ha il testo dell\'offerta. Aggiungilo modificando la candidatura.')
            return
        }
        setAiLoading(true);
        setAiPanel('cover');

        setTimeout(() => {
            aiPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 50);

        try {
            const res = await generateCoverLetter({
                offer_text: application.offer_text,
                company: application.company,
                role: application.role
            })
            setCoverLetter(res.data.cover_letter)
        } catch (error) {
            const msg = error.response?.data?.message || 'Errore nella chiamata AI.'
            alert(msg)
            setAiPanel(null)
        } finally {
            setAiLoading(false)
        }
    }

    if (loading) return <div className="loading">Caricamento candidature...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <div className="header-actions-left">
                    <button className="btn-back" onClick={() => navigate('/applications')}>
                        ← Torna alla lista
                    </button>
                </div>

                <div className="header-info">
                    <h1>{application.role} @ {application.company}</h1>
                    {/* Lo stato lo mettiamo qui sotto o accanto al titolo */}
                    <span className={`status-badge ${application.status}`}>{application.status}</span>
                </div>

                {/* Ora questo div andrà tutto a destra grazie al CSS */}
                <div className="header-actions">
                    <button className="btn-edit" onClick={() => navigate(`/applications/${id}/edit`)}>
                        Modifica
                    </button>
                    <button className="btn-delete" onClick={handleDelete}>
                        Elimina
                    </button>
                    <button className="btn-ai" onClick={handleAnalyze} disabled={aiLoading}>
                        {aiLoading && aiPanel === 'analysis' ? 'Analisi...' : 'Analizza con AI'}
                    </button>
                    <button className="btn-ai" onClick={handleCoverLetter} disabled={aiLoading}>
                        {aiLoading && aiPanel === 'cover' ? 'Generazione...' : 'Genera Cover Letter'}
                    </button>
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

                {/* Valutazioni */}
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

            {/* Testo Offerta */}
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

            {/* PANNELLO AI */}
            {aiPanel === 'analysis' && (
                <div className="detail-card full-width ai-panel" ref={aiPanelRef}>
                    <div className="ai-panel-header">
                        <h3>Analisi AI</h3>
                        <button className="ai-close" onClick={() => setAiPanel(null)}>×</button>
                    </div>
                    {aiLoading ? (
                        <div className="ai-loading">Analisi in corso...</div>
                    ) : analysis && (
                        <div className="ai-content">
                            <div className="ai-score">
                                <span className="ai-score-label">Match Score</span>
                                <span className="ai-score-value" style={{
                                    color: analysis.match_score >= 70 ? '#3dba7e' : analysis.match_score >= 40 ? '#e8a44a' : '#e05a5a'
                                }}>
                                    {analysis.match_score}%
                                </span>
                            </div>
                            <p className="ai-summary">{analysis.summary}</p>
                            <div className="ai-columns">
                                <div>
                                    <h4 className="ai-section-title strengths">Punti di forza</h4>
                                    <ul className="ai-list">
                                        {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="ai-section-title gaps">Lacune</h4>
                                    <ul className="ai-list">
                                        {analysis.gaps?.map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                </div>
                            </div>
                            <p className="ai-verdict">{analysis.verdict}</p>
                        </div>
                    )}
                </div>
            )}

            {aiPanel === 'cover' && (
                <div className="detail-card full-width ai-panel" ref={aiPanelRef}>
                    <div className="ai-panel-header">
                        <h3>Cover Letter generata</h3>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <button className="btn-copy" onClick={() => {
                                navigator.clipboard.writeText(coverLetter)
                                alert('Copiata negli appunti!')
                            }}>
                                Copia
                            </button>
                            <button className="ai-close" onClick={() => setAiPanel(null)}>×</button>
                        </div>
                    </div>
                    {aiLoading ? (
                        <div className="ai-loading">Generazione in corso...</div>
                    ) : coverLetter && (
                        <div className="cover-letter-text">{coverLetter}</div>
                    )}
                </div>
            )}

            
        </div>
    );
}

export default ApplicationDetail