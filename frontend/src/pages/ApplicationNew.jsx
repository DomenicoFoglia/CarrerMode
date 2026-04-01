import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApplication, deleteApplication } from '../api/applications';
import { getTags, createTag } from '../api/tags';
import './ApplicationNew.css';
import { uploadAttachment } from '../api/attachments';


function ApplicationNew() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
    //Stati per i Tag
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTagName, setNewTagName] = useState([]);

    //Stati per CV e Lettera di prensetazione
    const [cvFile, setCvFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    useEffect(() => {
        getTags().then(res => {
            setAvailableTags(res.data.tags || res.data);
        })
    }, []);


    const handleChange = (e) => {
        //Destrutturiamo name e valuie dall'input che scatena l'evento
        const { name, value } = e.target;

        setForm({
            ...form, //Copia tutto  quello che e' ora presente
            [name]: value //Sovrascrivi solo la chiave che il nome dell'input
        });
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setLoading(true);
        let createdAppId = null;

        try{
            const response = await createApplication({...form, tags: selectedTags});
            createdAppId = response.data.application.id;

            //Upload allegati se presenti
            const uploadPromises = [];
            if(cvFile){
                uploadPromises.push(uploadAttachment(createdAppId, 'cv', cvFile));
            }
            if(coverFile){
                uploadPromises.push(uploadAttachment(createdAppId, 'cover_letter', coverFile));
            }

            await Promise.all(uploadPromises);

            navigate('/applications');
        }catch(error){
            // Se la candidatura era stata creata ma i file non sono stati caricati correttaemnte
            if (createdAppId) {
                console.warn("Upload fallito, elimino la candidatura orfana...");
                await deleteApplication(createdAppId); 
            }

            // Gestione errore più specifica
            const errorMsg = error.response?.data?.errors 
                ? Object.values(error.response.data.errors).flat().join("\n")
                : "Errore durante il salvataggio. Controlla i formati dei file.";
                
            alert(errorMsg);
        }finally{
            setLoading(false);
        }
    };

    return (
        <div className="new-app-container">
            <div className="header-section">
                <h1>Nuova Candidatura</h1>
                <p>Inserisci i dettagli della posizione per cui ti sei candidato.</p>
            </div>

            <form onSubmit={handleSubmit} className="app-form">
                
                {/* SEZIONE 1: Informazioni Principali */}
                <section className="form-section">
                    <h3><span className="step-num">1</span> Informazioni Base</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Azienda *</label>
                            <input type="text" name="company" value={form.company} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Ruolo *</label>
                            <input type="text" name="role" value={form.role} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Data Candidatura *</label>
                            <input type="date" name="applied_at" value={form.applied_at} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Stato</label>
                            <select name="status" value={form.status} onChange={handleChange}>
                                <option value="sent">Inviata</option>
                                <option value="waiting">In attesa</option>
                                <option value="interview">Colloquio</option>
                                <option value="rejected">Rifiutata</option>
                                <option value="draft">Bozza</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* SEZIONE 2: Dettagli e Link */}
                <section className="form-section">
                    <h3><span className="step-num">2</span> Dettagli Posizione</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Sito/Source (es. LinkedIn)</label>
                            <input type="text" name="source" value={form.source} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Località</label>
                            <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Milano, Remote..." />
                        </div>
                        <div className="form-group">
                            <label>Tipo Contratto</label>
                            <input type="text" name="contract_type" value={form.contract_type} onChange={handleChange} placeholder="Indeterminato, Part-time..." />
                        </div>
                        <div className="form-group">
                            <label>RAL / Range Salariale</label>
                            <input type="text" name="salary_range" value={form.salary_range} onChange={handleChange} placeholder="es: 30k-35k" />
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>URL Annuncio</label>
                        <input type="url" name="url" value={form.url} onChange={handleChange} />
                    </div>
                </section>

                {/* SEZIONE 3: Valutazioni e Note */}
                <section className="form-section">
                    <h3><span className="step-num">3</span> Valutazioni e Note</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Interesse (1-5)</label>
                            <input type="number" name="interest_rating" min="1" max="5" value={form.interest_rating} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Match Score %</label>
                            <input type="number" name="match_score" min="0" max="100" value={form.match_score} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>Testo dell'offerta</label>
                        <textarea name="offer_text" value={form.offer_text} onChange={handleChange} rows="5" placeholder="Incolla qui il testo dell'annuncio..."></textarea>
                    </div>
                    <div className="form-group full-width">
                        <label>Note personali</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
                    </div>
                </section>

                {/* SEZIONE 4: Tag */}
                <section className="form-section">
                    <h3><span className="step-num">4</span> Tag</h3>
                    
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
                            placeholder="Nuovo tag..."
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
                                        alert('Tag già esistente o errore.')
                                    }
                                }
                            }}
                        />
                        <span style={{fontSize: '17px', color: '#4a5060'}}>Premi Invio per creare</span>
                    </div>
                </section>

                {/* SEZIONE 5: Allegati */}
                <section className="form-section">
                    <h3><span className="step-num">5</span> Documenti Allegati</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Curriculum Vitae (PDF, DOCX, ODT)</label>
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
                            <label>Lettera di Presentazione (PDF, DOCX, ODT)</label>
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
                    <button type="button" className="btn-secondary" onClick={() => navigate('/applications')}>Annulla</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Salvataggio...' : 'Crea Candidatura'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ApplicationNew