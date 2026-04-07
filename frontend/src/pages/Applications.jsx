import { useEffect, useState } from 'react';
import './Applications.css';
import { getApplications } from '../api/applications';
import { getTags } from '../api/tags';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Applications() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
    const [filterTags, setFilterTags] = useState([]);
    const [tagMode, setTagMode] = useState('OR');
    const [tagPanelOpen, setTagPanelOpen] = useState(false);

    const [perPage, setPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    useEffect(() => {
        setFilterStatus(searchParams.get('status') || 'all')
    }, [searchParams])

    // Debounce su ricerca e tag
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1)
            setFetchTrigger(t => t + 1)
        }, 1300)
        return () => clearTimeout(timer)
    }, [search, filterTags, tagMode])

    // Reset immediato su cambio stato e perPage
    useEffect(() => {
        setCurrentPage(1)
        setFetchTrigger(t => t + 1)
    }, [filterStatus, perPage])

    // UseEffect principale
    useEffect(() => {
        const fetchApps = async () => {
            setLoading(true)
            try {
                const params = { page: currentPage, per_page: perPage }
                if (filterStatus !== 'all') params.status = filterStatus
                if (search.trim())          params.search = search.trim()
                if (filterTags.length > 0) {
                    params.tags     = filterTags.map(t => t.id).join(',')
                    params.tag_mode = tagMode
                }

                const [appsRes, tagsRes] = await Promise.all([
                    getApplications(params),
                    getTags()
                ])

                setApplications(appsRes.data.data)
                setCurrentPage(appsRes.data.current_page)
                setLastPage(appsRes.data.last_page)
                setTotal(appsRes.data.total)
                setAllTags(tagsRes.data.tags || tagsRes.data)
            } catch (error) {
                console.error("Errore:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchApps()
    }, [currentPage, fetchTrigger])

    const toggleTag = (tag) => {
        const already = filterTags.find(t => t.id === tag.id)
        if (already) {
            setFilterTags(filterTags.filter(t => t.id !== tag.id))
        } else {
            setFilterTags([...filterTags, tag])
        }
    }

    if (loading) return <div className="loading">Caricamento candidature...</div>;

    return (
        <div className='applications-container'>
            <div className="apps-header">
                <h1>Le mie candidature</h1>
                <button className="btn-add" onClick={() => navigate('/applications/new')}>
                    Nuova Candidatura
                </button>
            </div>

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
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Tutti gli stati</option>
                        <option value="sent">Inviata</option>
                        <option value="waiting">In attesa</option>
                        <option value="interview">Colloquio</option>
                        <option value="rejected">Rifiutata</option>
                        <option value="draft">Bozza</option>
                    </select>
                </div>
                <button
                    className={`tag-filter-btn ${tagPanelOpen ? 'open' : ''}`}
                    onClick={() => setTagPanelOpen(!tagPanelOpen)}
                >
                    Filtra per tag
                    {filterTags.length > 0 && (
                        <span className="tag-filter-count">{filterTags.length}</span>
                    )}
                </button>
                <div className="results-count">
                    Trovate: <strong>{total}</strong>
                </div>
                <div className="per-page-select">
                    <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                        <option value={5}>5 per pagina</option>
                        <option value={10}>10 per pagina</option>
                        <option value={15}>15 per pagina</option>
                        <option value={25}>25 per pagina</option>
                        <option value={50}>50 per pagina</option>
                    </select>
                </div>
            </div>

            {tagPanelOpen && (
                <div className="tag-panel">
                    <div className="tag-panel-header">
                        <span className="tag-panel-title">Seleziona uno o più tag</span>
                        <div className="tag-mode-toggle">
                            <span className="tag-mode-label">Modalità:</span>
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${tagMode === 'OR' ? 'active-or' : ''}`}
                                    onClick={() => setTagMode('OR')}
                                >
                                    Almeno uno (OR)
                                </button>
                                <button
                                    className={`toggle-btn ${tagMode === 'AND' ? 'active-and' : ''}`}
                                    onClick={() => setTagMode('AND')}
                                >
                                    Tutti (AND)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="tag-pill-list">
                        {allTags.map(tag => {
                            const isSelected = filterTags.find(t => t.id === tag.id)
                            return (
                                <span
                                    key={tag.id}
                                    className={`tag-pill ${isSelected ? 'selected' : ''}`}
                                    style={{
                                        backgroundColor: isSelected ? tag.color + '30' : tag.color + '12',
                                        color: tag.color,
                                        borderColor: isSelected ? tag.color : tag.color + '60',
                                        boxShadow: isSelected ? `0 0 0 2px ${tag.color}` : 'none'
                                    }}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag.name}
                                </span>
                            )
                        })}
                    </div>

                    {filterTags.length > 0 && (
                        <div className="tag-panel-footer">
                            <span className="tag-panel-footer-label">Attivi:</span>
                            <div className="active-tags-row">
                                {filterTags.map((ft, index) => (
                                    <span key={ft.id} style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                        {index > 0 && (
                                            <span className={`op-badge ${tagMode === 'OR' ? 'op-or' : 'op-and'}`}>
                                                {tagMode}
                                            </span>
                                        )}
                                        <span
                                            className="active-tag-pill"
                                            style={{
                                                backgroundColor: ft.color + '22',
                                                color: ft.color,
                                                border: `1px solid ${ft.color}`
                                            }}
                                            onClick={() => toggleTag(ft)}
                                        >
                                            {ft.name} ×
                                        </span>
                                    </span>
                                ))}
                            </div>
                            <button className="clear-tags-btn" onClick={() => setFilterTags([])}>
                                Cancella tutti
                            </button>
                        </div>
                    )}
                </div>
            )}

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
                                                        className={`tag-badge ${filterTags.find(t => t.id === tag.id) ? 'tag-active' : ''}`}
                                                        style={{
                                                            backgroundColor: tag.color + '22',
                                                            color: tag.color,
                                                            border: `1px solid ${tag.color}`
                                                        }}
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
                                            onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app.id}`) }}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn-small btn-outline"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app.id}/edit`) }}
                                        >
                                            Modifica
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    {search || filterStatus !== 'all' || filterTags.length > 0
                                        ? "Nessun risultato corrisponde ai filtri selezionati."
                                        : "Non hai ancora inserito nessuna candidatura."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {lastPage > 1 && (
                    <div className="pagination-bar">
                        <button
                            className="page-btn"
                            onClick={() => setCurrentPage(p => p - 1)}
                            disabled={currentPage === 1}
                        >←</button>

                        {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            className="page-btn"
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage === lastPage}
                        >→</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Applications