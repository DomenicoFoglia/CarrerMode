import './ApplicationEdit.css'
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApplication, updateApplication } from '../api/applications';
import { getTags, createTag } from '../api/tags';
import { uploadAttachment } from '../api/attachments';
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

function ApplicationEdit(){
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

    const { id } = useParams();
    // const [application, setApplication] = useState(null);
    const [form, setForm] =useState({
        company:'',
        role:'',
        status: 'sent',
        applied_at: '',
        notes: '',
        url: '',
        offer_text: '',
        source: '',
        contract_type: '',
        location: '',
        salary_range: '',
        interest_rating: '',
        match_score: '',
    });

    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTagName, setNewTagName] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    useEffect (() => {
        const fetchApplication = async () =>{
            setLoading(true);
            try{
                const [appRes, tagsRes] = await Promise.all([
                    getApplication(id),
                    getTags()
                ])
                const app = appRes.data.application;

                setAvailableTags(tagsRes.data.tags || tagsRes.data)

                setForm({
                    company: app.company || '',
                    role: app.role || '',
                    status: app.status || 'sent',
                    applied_at: app.applied_at || '',
                    notes: app.notes || '',
                    url: app.url || '',
                    offer_text: app.offer_text || '',
                    source: app.source || '',
                    contract_type: app.contract_type || '',
                    location: app.location || '',
                    salary_range: app.salary_range || '',
                    interest_rating: app.interest_rating || '',
                    match_score: app.match_score || '',
                });

                //Preselezioniamo i tag gia' associati
                setSelectedTags(app.tags.map(t => t.id))
            }catch(error){
                console.error("Errore:", error);
                setError(t('common.error'));
            }finally{
                setLoading(false);
            }
        };
        fetchApplication();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setLoading(true);

        try{
            //Aggiorna la candidatura
            await updateApplication(id, {...form, tags: selectedTags});

            // 2. Gestione Allegati (con gestione errore specifica)
            try {
                if (cvFile) await uploadAttachment(id, 'cv', cvFile);
                if (coverFile) await uploadAttachment(id, 'cover_letter', coverFile);
            } catch (fileError) {
                // Se fallisce solo il file, avvisiamo l'utente ma non blocchiamo tutto
                const fileMsg = fileError.response?.data?.errors?.file?.[0] 
                    || t('common.error');
                toast.error(`${t('application_form.update')}: ${fileMsg}`);
                return; // Usciamo per non navigare via, così l'utente può riprovare il file
            }

            navigate(`/applications/${id}`);
        }catch(error){
            const errorMsg = error.response?.data?.errors 
                ? Object.values(error.response.data.errors).flat().join("\n")
                : t('common.error');
                
            toast.error(errorMsg);
        }finally{
            setLoading(false);
        }
    };



    return (
        <div className="new-app-container">
            <div className="header-section">
                <h1>{t('application_form.edit_title')}</h1>
            </div>

            <form onSubmit={handleSubmit} className="app-form">
                
                {/* SEZIONE 1: Informazioni Principali */}
                <section className="form-section">
                    <h3><span className="step-num">1</span> {t('application_form.step1')}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>{t('application_form.company')} *</label>
                            <input type="text" name="company" value={form.company} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>{t('application_form.role')} *</label>
                            <input type="text" name="role" value={form.role} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>{t('application_form.applied_at')} *</label>
                            <input type="date" name="applied_at" value={form.applied_at} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>{t('application_form.status')}</label>
                            <select name="status" value={form.status} onChange={handleChange}>
                                <option value="sent">{t('status.sent')}</option>
                                <option value="waiting">{t('status.waiting')}</option>
                                <option value="interview">{t('status.interview')}</option>
                                <option value="rejected">{t('status.rejected')}</option>
                                <option value="draft">{t('status.draft')}</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* SEZIONE 2: Dettagli e Link */}
                <section className="form-section">
                    <h3><span className="step-num">2</span> {t('application_form.step2')}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>{t('application_form.source')} (es. LinkedIn)</label>
                            <input type="text" name="source" value={form.source} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>{t('application_form.location')}</label>
                            <input type="text" name="location" value={form.location} onChange={handleChange} placeholder={t('application_form.location_placeholder')} />
                        </div>
                        <div className="form-group">
                            <label>{t('application_form.contract_type')}</label>
                            <input type="text" name="contract_type" value={form.contract_type} onChange={handleChange} placeholder={t('application_form.contract_placeholder')} />
                        </div>
                        <div className="form-group">
                            <label>{t('application_form.salary_range')}</label>
                            <input type="text" name="salary_range" value={form.salary_range} onChange={handleChange} placeholder={t('application_form.salary_placeholder')} />
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>{t('application_form.url')}</label>
                        <input type="url" name="url" value={form.url} onChange={handleChange} />
                    </div>
                </section>

                {/* SEZIONE 3: Valutazioni e Note */}
                <section className="form-section">
                    <h3><span className="step-num">3</span> {t('application_form.step3')}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>{t('application_form.interest_rating')}</label>
                            <input type="number" name="interest_rating" min="1" max="5" value={form.interest_rating} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>{t('application_form.match_score')}</label>
                            <input type="number" name="match_score" min="0" max="100" value={form.match_score} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>{t('application_form.offer_text')}</label>
                        <textarea name="offer_text" value={form.offer_text} onChange={handleChange} rows="5" placeholder={t('application_form.offer_text_placeholder')}></textarea>
                    </div>
                    <div className="form-group full-width">
                        <label>{t('application_form.notes')}</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder={t('application_form.notes_placeholder')}></textarea>
                    </div>
                </section>

                {/* SEZIONE 4: Tag */}
                <section className="form-section">
                    <h3><span className="step-num">4</span> {t('application_form.step4_tags')}</h3>
                    
                    {/* Tag esistenti selezionabili */}
                    <div className="tags-available">
                        {availableTags.map(tag => {
                            // Definiamo un colore di fallback se tag.color è nullo o mancante
                            const tagColor = tag.color || '#4a9eff'; 
                            const isSelected = selectedTags.includes(tag.id);

                            return (
                                <span
                                    key={tag.id}
                                    className={`tag-option ${isSelected ? 'selected' : ''}`}
                                    style={{ 
                                        borderColor: tagColor, 
                                        color: isSelected ? '#fff' : tagColor, 
                                        backgroundColor: isSelected ? tagColor : 'transparent' 
                                    }}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag.id)
                                                ? prev.filter(id => id !== tag.id)
                                                : [...prev, tag.id]
                                        );
                                    }}
                                >
                                    {tag.name}
                                </span>
                            );
                        })}
                    </div>

                    {/* Crea nuovo tag al volo */}
                    <div className="new-tag-row">
                        <input
                            type="text"
                            placeholder={t('application_form.new_tag_placeholder') ?? 'Tag'}
                            value={newTagName}
                            onChange={e => setNewTagName(e.target.value)}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter' && newTagName.trim()) {
                                    e.preventDefault()
                                    try {
                                        const res = await createTag({ name: newTagName.trim() })
                                        const created = res.data.tag
                                        setAvailableTags(prev => [...prev, created])
                                        setSelectedTags(prev => [...prev, created.id])
                                        setNewTagName('')
                                    } catch {
                                        toast.error(t('common.error'))
                                    }
                                }
                            }}
                        />
                        <span style={{fontSize: '17px', color: 'var(--text-hint)'}}>{t('application_form.tag_hint')}</span>
                    </div>
                </section>

                {/* SEZIONE 5: Allegati */}
                <section className="form-section">
                    <h3><span className="step-num">5</span> {t('application_form.step4')}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>{t('application_form.cv_label')} (PDF, DOCX, ODT)</label>
                            <div className="file-input-wrapper">
                                <input 
                                    type="file" 
                                    accept=".pdf,.docx,.odt"
                                    onChange={(e) => setCvFile(e.target.files[0])} 
                                />
                                {cvFile && <span className="file-name">✅ {cvFile.name}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{t('application_form.cover_label')} (PDF, DOCX, ODT)</label>
                            <div className="file-input-wrapper">
                                <input 
                                    type="file" 
                                    accept=".pdf,.docx,.odt"
                                    onChange={(e) => setCoverFile(e.target.files[0])} 
                                />
                                {coverFile && <span className="file-name">✅ {coverFile.name}</span>}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/applications')}>{t('application_form.cancel')}</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? t('application_form.updating') : t('application_form.update')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ApplicationEdit;