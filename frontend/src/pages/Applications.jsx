import { useEffect, useState } from 'react';
import './Applications.css';
import { getApplications } from '../api/applications';
import { useNavigate, useSearchParams } from 'react-router-dom';


function Applications() {
    const [searchParams] = useSearchParams();
    
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    //Stati per la ricerca
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');

    //Logica di filtrraggio
    const filteredApps = applications.filter(app => {
        const searchTerm = search.toLowerCase();

        //Ricerca per azienda o ruolo
        const matchSearch = 
            app.company.toLowerCase().includes(searchTerm) || 
            app.role.toLowerCase().includes(searchTerm);

            //Filtro per stato
            const matchStatus = filterStatus === 'all' || app.status === filterStatus;

            return matchSearch && matchStatus;
    });

    const navigate = useNavigate();

    useEffect(() => {
        setFilterStatus(searchParams.get('status') || 'all')
    }, [searchParams])
    
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

            {/* Filtri */}
            <div className="filters-bar">
                <div className="search-box">
                    <input 
                        type="text" 
                        placeholder="Cerca per azienda o ruolo..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="status-filters">
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tutti gli stati</option>
                        <option value="sent">Inviata</option>
                        <option value="waiting">In attesa</option>
                        <option value="interview">Colloquio</option>
                        <option value="rejected">Rifiutata</option>
                        <option value="draft">Bozza</option>
                    </select>
                </div>
                
                <div className="results-count">
                    Trovate: <strong>{filteredApps.length}</strong>
                </div>
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
                        {filteredApps.length > 0 ? (
                            filteredApps.map(app => (
                                <tr key={app.id} onClick={() => navigate(`/applications/${app.id}`)}>
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
                                        <button 
                                            className="btn-small btn-outline"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app.id}/edit`)} }
                                        >
                                            Modifica
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    {search || filterStatus !== 'all' 
                                        ? "Nessun risultato corrisponde ai filtri selezionati." 
                                        : "Non hai ancora inserito nessuna candidatura."}
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