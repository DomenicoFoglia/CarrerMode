import { useEffect, useState } from 'react';
import './Applications.css';
import { getApplications, exportApplications } from '../api/applications';
import { getTags } from '../api/tags';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

function Applications() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

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

    //Esporta dati in CSV
    const handleExport = async () => {
        try {
            const res = await exportApplications()
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `candidature_${new Date().toISOString().slice(0,10)}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success('File esportato con successo!')
        } catch (error) {
            toast.error(t('common.error'))
        }
    }

    if (loading) return <div className="loading">{t('common.loading_applications')}</div>;

    return (
        <div className='applications-container'>
            <div className="apps-header">
                <h1>{t('applications.title')}</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-export" onClick={handleExport}>
                        ↓ {t('applications.export_btn')}
                    </button>
                    <button className="btn-add" onClick={() => navigate('/applications/new')}>
                        + {t('applications.new_btn')}
                    </button>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder={t('applications.search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="status-filters">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">{t('status.all')}</option>
                        <option value="sent">{t('status.sent')}</option>
                        <option value="waiting">{t('status.waiting')}</option>
                        <option value="interview">{t('status.interview')}</option>
                        <option value="rejected">{t('status.rejected')}</option>
                        <option value="draft">{t('status.draft')}</option>
                    </select>
                </div>
                <button
                    className={`tag-filter-btn ${tagPanelOpen ? 'open' : ''}`}
                    onClick={() => setTagPanelOpen(!tagPanelOpen)}
                >
                    {t('applications.filter_by_tag')}
                    {filterTags.length > 0 && (
                        <span className="tag-filter-count">{filterTags.length}</span>
                    )}
                </button>
                <div className="results-count">
                    {t('applications.found')} <strong>{total}</strong>
                </div>
                <div className="per-page-select">
                    <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                        {[5, 10, 15, 25, 50].map(n => (
                            <option key={n} value={n}>{n} {t('applications.per_page')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {tagPanelOpen && (
                <div className="tag-panel">
                    <div className="tag-panel-header">
                        <span className="tag-panel-title">{t('applications.select_tags')}</span>
                        <div className="tag-mode-toggle">
                            <span className="tag-mode-label">{t('applications.tag_mode_label')}</span>
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${tagMode === 'OR' ? 'active-or' : ''}`}
                                    onClick={() => setTagMode('OR')}
                                >
                                    {t('applications.tag_mode_or')}
                                </button>
                                <button
                                    className={`toggle-btn ${tagMode === 'AND' ? 'active-and' : ''}`}
                                    onClick={() => setTagMode('AND')}
                                >
                                    {t('applications.tag_mode_and')}
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
                            <span className="tag-panel-footer-label">{t('applications.active_tags')}</span>
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
                                {t('applications.clear_tags')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="apps-table-container">
                <table className="apps-table">
                    <thead>
                        <tr>
                            <th>{t('applications.col_company')}</th>
                            <th>{t('applications.col_role')}</th>
                            <th>{t('applications.col_date')}</th>
                            <th>{t('applications.col_status')}</th>
                            <th>{t('applications.col_tags')}</th>
                            <th>{t('applications.col_actions')}</th>
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
                                            {t(`status.${app.status}`)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-tags">
                                            {app.tags && app.tags.length > 0 ? (
                                                <>
                                                    {app.tags.slice(0, 3).map(tag => (
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
                                                    ))}
                                                    {app.tags.length > 3 && (
                                                        <span className="tag-badge-more">
                                                            +{app.tags.length - 3}
                                                            <div className="tag-tooltip">
                                                                {app.tags.slice(3).map(tag => (
                                                                    <span
                                                                        key={tag.id}
                                                                        className="tag-badge"
                                                                        style={{
                                                                            backgroundColor: tag.color + '22',
                                                                            color: tag.color,
                                                                            border: `1px solid ${tag.color}`
                                                                        }}
                                                                    >
                                                                        {tag.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span style={{ color: '#4a5060', fontSize: '12px' }}>—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-small"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app.id}`) }}
                                        >
                                            {t('applications.details_btn')}
                                        </button>
                                        <button
                                            className="btn-small btn-outline"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app.id}/edit`) }}
                                        >
                                            {t('applications.edit_btn')}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    {search || filterStatus !== 'all' || filterTags.length > 0
                                        ? t('applications.no_results')
                                        : t('applications.empty')}
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