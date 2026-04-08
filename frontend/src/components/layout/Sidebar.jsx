import './Sidebar.css'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getStats } from '../../api/applications'
import { useTranslation } from 'react-i18next'

function Sidebar({ isOpen, onClose }) {
    const [searchParams] = useSearchParams();
    const currentStatus = searchParams.get('status') || 'all';
    const location = useLocation();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        getStats().then(res => setStats(res.data)).catch(console.error)
    }, [])

    const isApplicationsArea = location.pathname.startsWith('/applications')
    const isDashboard = location.pathname === '/'

    return (
        <div className={`sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`}>

            <button className="sidebar-close" onClick={onClose}>×</button>

            {/* SIDEBAR DASHBOARD */}
            {isDashboard && (
                <>
                    <div className="sidebar-label">{t('sidebar.overview')}</div>
                    <NavLink to="/" end className="sidebar-link">{t('nav.dashboard')}</NavLink>
                    <NavLink to="/applications" className="sidebar-link">
                        {t('sidebar.all_applications')}
                        {stats && <span className="sidebar-badge">{stats.total}</span>}
                    </NavLink>
                    <NavLink to="/applications?status=waiting" className="sidebar-link">
                        {t('sidebar.waiting')}
                        {stats && <span className="sidebar-badge warn">{stats.waiting}</span>}
                    </NavLink>
                </>
            )}

            {/* SIDEBAR CANDIDATURE */}
            {isApplicationsArea && (
                <>
                    <div className="sidebar-label">{t('sidebar.quick_views')}</div>
                    <NavLink 
                        to="/applications" 
                        end 
                        className={() => `sidebar-link ${currentStatus === 'all' ? 'active' : ''}`}
                    >
                        {t('sidebar.all')}
                        {stats && <span className="sidebar-badge">{stats.total}</span>}
                    </NavLink>
                    <NavLink 
                        to="/applications?status=sent"
                        className={() => `sidebar-link ${currentStatus === 'sent' ? 'active' : ''}`}
                    >
                        {t('sidebar.sent')}
                        {stats && <span className="sidebar-badge">{stats.sent}</span>}
                    </NavLink>
                    <NavLink 
                        to="/applications?status=interview"
                        className={() => `sidebar-link ${currentStatus === 'interview' ? 'active' : ''}`}
                    >
                        {t('sidebar.interview')}
                        {stats && <span className="sidebar-badge ok">{stats.interview}</span>}
                    </NavLink>
                    <NavLink 
                        to="/applications?status=waiting"
                        className={() => `sidebar-link ${currentStatus === 'waiting' ? 'active' : ''}`}
                    >
                        {t('sidebar.waiting')}
                        {stats && <span className="sidebar-badge warn">{stats.waiting}</span>}
                    </NavLink>
                    <NavLink 
                        to="/applications?status=rejected"
                        className={() => `sidebar-link ${currentStatus === 'rejected' ? 'active' : ''}`}
                    >
                        {t('sidebar.rejected')}
                        {stats && <span className="sidebar-badge danger">{stats.rejected}</span>}
                    </NavLink>
                </>
            )}

            {/* STRUMENTI, sempre visibili */}
            <div className="sidebar-label" style={{marginTop: '20px'}}>{t('sidebar.tools')}</div>
            <div className="sidebar-link cursor" onClick={() => navigate('/applications/new')}>{t('sidebar.new_application')}</div>
            {!isDashboard && <NavLink to="/" end className="sidebar-link">{t('nav.dashboard')}</NavLink>}
            {/* se non siamo nell'area candidature E non siamo nella dashboard, mostra il link candidature*/}
            {(!isApplicationsArea && !isDashboard) && <NavLink to="/applications" className="sidebar-link">{t('nav.applications')}</NavLink>}
            <NavLink to="/statistics" className="sidebar-link">{t('nav.statistics')}</NavLink>
            <NavLink to="/reminders" className="sidebar-link">{t('nav.reminders')}</NavLink>
            <NavLink to="/settings" className="sidebar-link">{t('sidebar.settings')}</NavLink>
        </div>
    )
}

export default Sidebar