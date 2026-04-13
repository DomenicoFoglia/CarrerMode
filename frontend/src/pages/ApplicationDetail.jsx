import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import './ApplicationDetail.css';
import { getApplication, deleteApplication  } from '../api/applications';
import { analyzeOffer, generateCoverLetter } from '../api/ai';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { downloadAttachment, deleteAttachment } from '../api/attachments';
import useAuthStore from '../store/authStore';


function ApplicationDetail() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //Gestione allegati
    const [attachmentToDelete, setAttachmentToDelete] = useState(null);
    const [confirmAttachmentOpen, setConfirmAttachmentOpen] = useState(false);

    //AI
    const [aiLoading, setAiLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [coverLetter, setCoverLetter] = useState(null);
    const [aiPanel, setAiPanel] = useState(null);
    const aiPanelRef = useRef(null);
    const { user } = useAuthStore();
    const [tempProvider, setTempProvider] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try{
                const response = await getApplication(id);
                setApplication(response.data.application);
            }catch(error){
                console.error("Errore nel caricamento della candidatura:", error);
                setError(t('common.error'));
            }finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]); //Se cambia l'ID riesegue useEffect

    const handleDelete = async () => {
        setConfirmOpen(true)
    }

    const handleDeleteConfirmed = async () => {
        setConfirmOpen(false);
        
        try {
            await deleteApplication(id);
            navigate('/applications'); // Torna alla lista dopo l'eliminazione
        } catch (err) {
            toast.error(t('application_detail.delete_error'));
            console.error(err);
        }
    };

    const handleDownload = async (attachment) => {
        try {
            const res = await downloadAttachment(attachment.id)
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', attachment.filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            toast.error(t('common.error'))
        }
    }

    const handleDeleteAttachment = (attachment) => {
        setAttachmentToDelete(attachment)
        setConfirmAttachmentOpen(true)
    }

    const handleDeleteAttachmentConfirmed = async () => {
        setConfirmAttachmentOpen(false)
        try {
            await deleteAttachment(attachmentToDelete.id)
            setApplication(prev => ({
                ...prev,
                attachments: prev.attachments.filter(a => a.id !== attachmentToDelete.id)
            }))
            toast.success('Allegato eliminato')
        } catch (error) {
            toast.error(t('common.error'))
        } finally {
            setAttachmentToDelete(null)
        }
    }

    const handleAnalyze = async (providerOverride = null) => {
        if (!application.offer_text) {
            console.log('no offer text')
            toast(t('application_detail.no_offer_text'), { icon: 'ℹ️' });
            return
        }
        setAiLoading(true);
        setAiPanel('analysis');

        setTimeout(() => {
            aiPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100);

        try {
            console.log('chiamo analyzeOffer...')
            const res = await analyzeOffer(application.offer_text, providerOverride)
            setAnalysis(res.data)
            setTempProvider(providerOverride)
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
            setAiPanel(null);
        } finally {
            setAiLoading(false);
        }
    }

    const handleCoverLetter = async (providerOverride = null) => {
        if (!application.offer_text) {
            toast(t('application_detail.no_offer_text'), { icon: 'ℹ️' });
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
            }, providerOverride)
            setCoverLetter(res.data.cover_letter)
            setTempProvider(providerOverride)
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
            setAiPanel(null);
        } finally {
            setAiLoading(false);
        }
    }

    if (loading) return <div className="loading">{t('common.loading')}</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <div className="header-actions-left">
                    <button className="btn-back" onClick={() => navigate('/applications')}>
                        {t('application_detail.back')}
                    </button>
                </div>

                <div className="header-info">
                    <h1>{application.role} @ {application.company}</h1>
                    {/* Lo stato lo mettiamo qui sotto o accanto al titolo */}
                    <span className={`status-badge ${application.status}`}>
                        {t(`status.${application.status}`)}
                    </span>
                </div>

                <div className="header-actions">
                    <button className="btn-edit" onClick={() => navigate(`/applications/${id}/edit`)}>
                        {t('application_detail.edit')}
                    </button>
                    <button className="btn-delete" onClick={handleDelete}>
                        {t('application_detail.delete')}
                    </button>
                    <button className="btn-ai" onClick={() => handleAnalyze()} disabled={aiLoading}>
                        {aiLoading && aiPanel === 'analysis' ? t('application_detail.analyzing') : t('application_detail.analyze_ai')}
                    </button>
                    <button className="btn-ai" onClick={() => handleCoverLetter()} disabled={aiLoading}>
                        {aiLoading && aiPanel === 'cover' ? t('application_detail.generating') : t('application_detail.cover_letter_btn')}
                    </button>
                </div>
            </div>

            <div className="detail-grid">
                {/* COLONNA SINISTRA: Info Posizione */}
                <div className="detail-card">
                    <h3>{t('application_detail.position_details')}</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="label">{t('application_detail.location')}</span>
                            <span className="value">{application.location || t('application_detail.not_specified')}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">{t('application_detail.contract')}</span>
                            <span className="value">{application.contract_type || t('application_detail.not_specified')}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">{t('application_detail.salary')}</span>
                            <span className="value">{application.salary_range || t('application_detail.not_specified')}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">{t('application_detail.source')}</span>
                            <span className="value">{application.source || t('application_detail.not_specified')}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">{t('application_detail.applied_at')}</span>
                            <span className="value">{new Date(application.applied_at).toLocaleDateString('it-IT')}</span>
                        </div>
                    </div>
                    
                    {application.url && (
                        <a href={application.url} target="_blank" rel="noreferrer" className="btn-link">
                            {t('application_detail.open_offer')}
                        </a>
                    )}
                </div>

                {/* Valutazioni */}
                <div className="detail-card">
                    <h3>{t('application_detail.rating_match')}</h3>
                    <div className="rating-box">
                        <div className="rating-item">
                            <span className="label">{t('application_detail.interest')}</span>
                            <div className="rating-value">{application.interest_rating}<span>/5</span></div>
                        </div>
                        <div className="rating-item">
                            <span className="label">{t('application_detail.match_score')}</span>
                            <div className="rating-value highlight">{application.match_score}%</div>
                        </div>
                    </div>
                    
                    <div className="notes-section">
                        <h4>{t('application_detail.personal_notes')}</h4>
                        <p>{application.notes || t('application_detail.no_notes')}</p>
                    </div>
                </div>
            </div>

            {/* Testo Offerta */}
            {application.offer_text && (
                <div className="detail-card full-width">
                    <h3>{t('application_detail.offer_text')}</h3>
                    <div className="offer-text-content">
                        {application.offer_text}
                    </div>
                </div>
            )}

            {/* SEZIONE TAG */}
            <div className="detail-card full-width">
                <h3>{t('application_detail.tags')}</h3>
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
                        <p style={{ color: '#4a5060' }}>{t('application_detail.no_tags')}</p>
                    )}
                </div>
            </div>

            {/* ALLEGATI */}
            <div className="detail-card full-width">
                <h3>{t('application_detail.attachments_title')}</h3>
                {application.attachments && application.attachments.length > 0 ? (
                    <div className="attachments-list">
                        {application.attachments.map(att => (
                            <div key={att.id} className="attachment-item">
                                <div className="attachment-info">
                                    <span className="attachment-icon">
                                        {att.type === 'cv' ? '📄' : '✉️'}
                                    </span>
                                    <div className="attachment-details">
                                        <span className="attachment-name">{att.filename}</span>
                                        <span className="attachment-meta">
                                            {att.type === 'cv' ? 'CV' : 'Cover Letter'} · {(att.size / 1024).toFixed(0)} KB
                                        </span>
                                    </div>
                                </div>
                                <div className="attachment-actions">
                                    <button
                                        className="btn-attachment-download"
                                        onClick={() => handleDownload(att)}
                                    >
                                        {t('application_detail.download')}
                                    </button>
                                    <button
                                        className="btn-attachment-delete"
                                        onClick={() => handleDeleteAttachment(att)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#4a5060' }}>{t('application_detail.no_attachments')}</p>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmAttachmentOpen}
                message={t('application_detail.confirm_delete_attachment')}
                onConfirm={handleDeleteAttachmentConfirmed}
                onCancel={() => { setConfirmAttachmentOpen(false); setAttachmentToDelete(null) }}
            />

            {/* PANNELLO AI */}
            {aiPanel === 'analysis' && (
                <div className="detail-card full-width ai-panel" ref={aiPanelRef}>
                    <div className="ai-panel-header">
                        <h3>{t('application_detail.ai_analysis_title')}</h3>
                        <button className="ai-close" onClick={() => setAiPanel(null)}>×</button>
                    </div>
                    {aiLoading ? (
                        <div className="ai-loading">{t('application_detail.ai_analyzing')}</div>
                    ) : analysis && (
                        <div className="ai-content">
                            <div className="ai-score">
                                <span className="ai-score-label">{t('application_detail.ai_match_score')}</span>
                                <span className="ai-score-value" style={{
                                    color: analysis.match_score >= 70 ? '#3dba7e' : analysis.match_score >= 40 ? '#e8a44a' : '#e05a5a'
                                }}>
                                    {analysis.match_score}%
                                </span>
                            </div>
                            <p className="ai-summary">{analysis.summary}</p>
                            <div className="ai-columns">
                                <div>
                                    <h4 className="ai-section-title strengths">{t('application_detail.ai_strengths')}</h4>
                                    <ul className="ai-list">
                                        {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="ai-section-title gaps">{t('application_detail.ai_gaps')}</h4>
                                    <ul className="ai-list">
                                        {analysis.gaps?.map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                </div>
                            </div>
                            <p className="ai-verdict">{analysis.verdict}</p>

                            {/* Bottone per rianalizzare con l'altro provider */}
                            <div className="ai-rerun">
                                <span className="ai-rerun-label">
                                    Analisi eseguita con {tempProvider || user?.ai_provider || 'gemini'} —
                                </span>
                                <button
                                    className="btn-rerun"
                                    disabled={aiLoading}
                                    onClick={() => handleAnalyze(
                                        (tempProvider || user?.ai_provider) === 'gemini' ? 'groq' : 'gemini'
                                    )}
                                >
                                    Rianalizza con {(tempProvider || user?.ai_provider) === 'gemini' ? 'Groq' : 'Gemini'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {aiPanel === 'cover' && (
                <div className="detail-card full-width ai-panel" ref={aiPanelRef}>
                    <div className="ai-panel-header">
                        <h3>{t('application_detail.ai_cover_title')}</h3>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <button className="btn-copy" onClick={() => {
                                navigator.clipboard.writeText(coverLetter)
                                toast.success(t('application_detail.ai_copied'))
                            }}>
                                {t('application_detail.ai_copy')}
                            </button>
                            <button className="ai-close" onClick={() => setAiPanel(null)}>×</button>
                        </div>
                    </div>
                    {aiLoading ? (
                        <div className="ai-loading">{t('application_detail.ai_generating')}</div>
                    ) : coverLetter && (
                        <div className="cover-letter-text">{coverLetter}</div>
                    )}
                    <div className="ai-rerun">
                        <span className="ai-rerun-label">
                            Generata con {tempProvider || user?.ai_provider || 'gemini'} —
                        </span>
                        <button
                            className="btn-rerun"
                            disabled={aiLoading}
                            onClick={() => handleCoverLetter(
                                (tempProvider || user?.ai_provider) === 'gemini' ? 'groq' : 'gemini'
                            )}
                        >
                            Rigenera con {(tempProvider || user?.ai_provider) === 'gemini' ? 'Groq' : 'Gemini'}
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmOpen}
                message={t('application_detail.confirm_delete')}
                onConfirm={handleDeleteConfirmed}
                onCancel={() => setConfirmOpen(false)}
            />
            
        </div>
    );
}

export default ApplicationDetail