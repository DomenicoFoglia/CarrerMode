import './Sidebar.css'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getStats } from '../../api/applications'

function Sidebar() {
    const [searchParams] = useSearchParams();
    const currentStatus = searchParams.get('status') || 'all';
    const location = useLocation()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)

    useEffect(() => {
        getStats().then(res => setStats(res.data)).catch(console.error)
    }, [])

    const isApplicationsArea = location.pathname.startsWith('/applications')
    const isDashboard = location.pathname === '/'

    return (
        <div className="sidebar">

            {/* SIDEBAR DASHBOARD */}
            {isDashboard && (
                <>
                    <div className="sidebar-label">Panoramica</div>
                    <NavLink to="/" end className="sidebar-link">Dashboard</NavLink>
                    <NavLink to="/applications" className="sidebar-link">
                        Tutte le candidature
                        {stats && <span className="sidebar-badge">{stats.total}</span>}
                    </NavLink>
                    <NavLink to="/applications?status=waiting" className="sidebar-link">
                        In attesa
                        {stats && <span className="sidebar-badge warn">{stats.waiting}</span>}
                    </NavLink>
                </>
            )}

            {/* SIDEBAR CANDIDATURE */}
            {isApplicationsArea && (
                <>
                    <div className="sidebar-label">Viste rapide</div>
                    <NavLink 
                        to="/applications" 
                        end 
                        className={() => `sidebar-link ${currentStatus === 'all' ? 'active' : ''}`}
                    >
                        Tutte
                        {stats && <span className="sidebar-badge">{stats.total}</span>}
                    </NavLink>
                    <NavLink 
                        to="/applications?status=sent"
                        className={() => `sidebar-link ${currentStatus === 'sent' ? 'active' : ''}`}
                    >
                        Inviate
                        {stats && <span className="sidebar-badge">{stats.sent}</span>}
                    </NavLink>
                    <NavLink 
                        to="/applications?status=interview"
                        className={() => `sidebar-link ${currentStatus === 'interview' ? 'active' : ''}`}
                    >
                        Colloquio
                        {stats && <span className="sidebar-badge ok">{stats.interview}</span>}
                    </NavLink>
                    <NavLink 
                        to="/applications?status=waiting"
                        className={() => `sidebar-link ${currentStatus === 'waiting' ? 'active' : ''}`}
                    >
                        In attesa
                        {stats && <span className="sidebar-badge warn">{stats.waiting}</span>}
                    </NavLink>
                    <NavLink 
                        to="/applications?status=rejected"
                        className={() => `sidebar-link ${currentStatus === 'rejected' ? 'active' : ''}`}
                    >
                        Rifiutate
                        {stats && <span className="sidebar-badge danger">{stats.rejected}</span>}
                    </NavLink>
                </>
            )}

            {/* STRUMENTI, sempre visibili */}
            <div className="sidebar-label" style={{marginTop: '20px'}}>Strumenti</div>
            <div className="sidebar-link cursor" onClick={() => navigate('/applications/new')}>+ Nuova candidatura</div>
            <NavLink to="/statistics" className="sidebar-link">Statistiche</NavLink>
            <NavLink to="/reminders" className="sidebar-link">Reminder</NavLink>
            <NavLink to="/settings" className="sidebar-link">Opzioni</NavLink>
        </div>
    )
}

export default Sidebar