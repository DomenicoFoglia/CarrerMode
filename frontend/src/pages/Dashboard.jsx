import { useEffect, useState } from 'react';
import { getStats, getApplications } from '../api/applications';
import './Dashboard.css';
import { getReminders } from '../api/reminders'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const user = useAuthStore((state) => state.user);
    const [cardSubtitleIndex, setCardSubtitleIndex] = useState(0);
    const [applications, setApplications] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [currentPageApps, setCurrentPageApps] = useState(1);
    const [currentPageReminders, setCurrentPageReminders] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 5;
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, appsRes, remindersRes] = await Promise.all([
                    getStats(),
                    getApplications(),
                    getReminders()
                ]);
                setStats(statsRes.data);
                setApplications(appsRes.data.data);
                setReminders(remindersRes.data);
            } catch (error) {
                console.error("Errore nel caricamento statistiche:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCardSubtitleIndex(prev => (prev + 1) % 2)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const tassoColloqui = stats?.total > 0
        ? ((stats.interview / stats.total) * 100).toFixed(1) : 0
    const percentualeRifiutate = stats?.total > 0
        ? ((stats.rejected / stats.total) * 100).toFixed(1) : 0

    const totalPages = Math.ceil(applications.length / itemsPerPage);
    const totalePagesReminders = Math.ceil(reminders.length / itemsPerPage);
    const paginatedApps = applications.slice((currentPageApps - 1) * itemsPerPage, currentPageApps * itemsPerPage);
    const paginatedReminders = reminders.slice((currentPageReminders - 1) * itemsPerPage, currentPageReminders * itemsPerPage);

    if (loading) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div className="dashboard-container">
            <div className="dash-welcome">
                    <span className="dash-welcome-text">
                        {t('dashboard.title')},
                        <strong>
                            <span 
                                onClick={() => navigate('/settings')} 
                                style={{ cursor: 'pointer' }}
                            >
                                {' '}{user?.name}
                            </span>
                        </strong>
                    </span>
                    <span className="dash-welcome-date">
                        {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            <div className="dash-layout">
                

                {/* COLONNA SINISTRA (70%) */}
                <div className="dash-left">

                    {/* Tabella candidature */}
                    <div className="dash-card">
                        <div className="dash-card-header">
                            <div>
                                <span className="dash-card-label">{t('dashboard.recent_applications')}</span>
                                <span className="dash-card-count">{stats?.total || 0} {t('dashboard.total').toLowerCase()}</span>
                            </div>
                            <button className="dash-link" onClick={() => navigate('/applications')}>
                                {t('dashboard.see_all')} →
                            </button>
                        </div>
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>{t('applications.col_company')}</th>
                                    <th>{t('applications.col_role')}</th>
                                    <th>{t('applications.col_status')}</th>
                                    <th>{t('applications.col_tags')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.length > 0 ? (
                                    paginatedApps.map(app => (
                                        <tr key={app.id} onClick={() => navigate(`/applications/${app.id}`)}>
                                            <td><strong>{app.company}</strong></td>
                                            <td className="td-muted">{app.role}</td>
                                            <td>
                                                <span className={`status-badge ${app.status}`}>
                                                    {t(`status.${app.status}`)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="row-tags">
                                                    {app.tags?.slice(0, 2).map(tag => (
                                                        <span key={tag.id} className="tag-badge" style={{
                                                            backgroundColor: tag.color + '22',
                                                            color: tag.color,
                                                            border: `1px solid ${tag.color}`
                                                        }}>{tag.name}</span>
                                                    ))}
                                                    {app.tags?.length > 2 && (
                                                        <span className="tag-badge-more">+{app.tags.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="td-empty">{t('applications.empty')}</td></tr>
                                )}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="dash-pagination">
                                <button onClick={() => setCurrentPageApps(p => p - 1)} disabled={currentPageApps === 1} className="page-btn">←</button>
                                <span className="page-info">{currentPageApps} / {totalPages}</span>
                                <button onClick={() => setCurrentPageApps(p => p + 1)} disabled={currentPageApps === totalPages} className="page-btn">→</button>
                            </div>
                        )}
                    </div>

                    {/* Distribuzione stati */}
                    <div className="dash-card dash-card--chart">
                        <div className="dash-card-header">
                            <span className="dash-card-label">{t('dashboard.status_chart')}</span>
                        </div>
                        {stats && (
                            <div className="mini-bars">
                                {[
                                    { key: 'sent',      value: stats.sent,      color: '#4a9eff' },
                                    { key: 'interview', value: stats.interview,  color: '#3dba7e' },
                                    { key: 'waiting',   value: stats.waiting,    color: '#e8a44a' },
                                    { key: 'rejected',  value: stats.rejected,   color: '#e05a5a' },
                                ].map(item => (
                                    <div key={item.key} className="mini-bar-row">
                                        <span className="mini-bar-label">{t(`status.${item.key}`)}</span>
                                        <div className="mini-bar-track">
                                            <div className="mini-bar-fill" style={{
                                                width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : '0%',
                                                background: item.color
                                            }} />
                                        </div>
                                        <span className="mini-bar-value">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* COLONNA DESTRA (30%) */}
                <div className="dash-right">

                    {/* 4 stat in stile diverso tra loro */}
                    <div className="stat-hero">
                        <span className="stat-hero-label">{t('dashboard.total')}</span>
                        <span className="stat-hero-number">{stats?.total || 0}</span>
                        <span className="stat-hero-sub" key={cardSubtitleIndex}>
                            {cardSubtitleIndex === 0
                                ? `+${stats?.this_month || 0} ${t('dashboard.this_month')}`
                                : `${stats?.sent || 0} ${t('dashboard.sent_label')}`}
                        </span>
                    </div>

                    <div className="stat-row-group">
                        <div className="stat-inline stat-inline--green">
                            <div className="stat-inline-left">
                                <span className="stat-inline-label">{t('dashboard.interviews')}</span>
                                <span className="stat-inline-sub" key={`i-${cardSubtitleIndex}`}>
                                    {cardSubtitleIndex === 0
                                        ? `${t('dashboard.conversion_rate')} ${tassoColloqui}%`
                                        : `${t('dashboard.on_total')} ${stats?.total || 0}`}
                                </span>
                            </div>
                            <span className="stat-inline-number">{stats?.interview || 0}</span>
                        </div>

                        <div className="stat-inline stat-inline--orange">
                            <div className="stat-inline-left">
                                <span className="stat-inline-label">{t('dashboard.waiting')}</span>
                                <span className="stat-inline-sub" key={`w-${cardSubtitleIndex}`}>
                                    {cardSubtitleIndex === 0
                                        ? `${stats?.expiring_reminders || 0} ${t('dashboard.expiring_soon')}`
                                        : t('dashboard.follow_up')}
                                </span>
                            </div>
                            <span className="stat-inline-number">{stats?.waiting || 0}</span>
                        </div>

                        <div className="stat-inline stat-inline--red">
                            <div className="stat-inline-left">
                                <span className="stat-inline-label">{t('dashboard.rejected')}</span>
                                <span className="stat-inline-sub" key={`r-${cardSubtitleIndex}`}>
                                    {cardSubtitleIndex === 0
                                        ? `${percentualeRifiutate}% ${t('dashboard.of_total')}`
                                        : `${(stats?.total - stats?.rejected) || 0} ${t('dashboard.still_active')}`}
                                </span>
                            </div>
                            <span className="stat-inline-number">{stats?.rejected || 0}</span>
                        </div>
                    </div>

                    {/* Reminder */}
                    <div className="dash-card dash-card--reminders">
                        <div className="dash-card-header">
                            <span className="dash-card-label">{t('dashboard.reminders_title')}</span>
                            <button className="dash-link" onClick={() => navigate('/reminders')}>
                                {t('dashboard.see_all')} →
                            </button>
                        </div>
                        <div className="reminders-list">
                            {reminders.length > 0 ? (
                                paginatedReminders.map(rem => (
                                    <div
                                        key={rem.id}
                                        className={`reminder-item ${selectedReminder?.id === rem.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedReminder(selectedReminder?.id === rem.id ? null : rem)}
                                    >
                                        <div className={`reminder-dot ${rem.sent ? 'sent' : 'pending'}`} />
                                        <div className="reminder-info">
                                            <span className="reminder-title">{rem.title}</span>
                                            <span className="reminder-company">{rem.application?.company || '-'}</span>
                                            <span className="reminder-date">{new Date(rem.remind_at).toLocaleDateString('it-IT')}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-reminders">{t('dashboard.no_reminders')}</p>
                            )}
                            {totalePagesReminders > 1 && (
                                <div className="dash-pagination">
                                    <button onClick={() => setCurrentPageReminders(p => p - 1)} disabled={currentPageReminders === 1} className="page-btn">←</button>
                                    <span className="page-info">{currentPageReminders} / {totalePagesReminders}</span>
                                    <button onClick={() => setCurrentPageReminders(p => p + 1)} disabled={currentPageReminders === totalePagesReminders} className="page-btn">→</button>
                                </div>
                            )}
                        </div>
                        {selectedReminder && (
                            <div className="reminder-detail">
                                <div className="reminder-detail-header">
                                    <span className="reminder-detail-title">{selectedReminder.title}</span>
                                    <button className="reminder-detail-close" onClick={() => setSelectedReminder(null)}>×</button>
                                </div>
                                <div className="reminder-detail-body">
                                    <p><span className="detail-label">Azienda:</span> {selectedReminder.application?.company || '—'}</p>
                                    <p><span className="detail-label">{t('reminders.remind_at')}:</span> {new Date(selectedReminder.remind_at).toLocaleString('it-IT')}</p>
                                    <p><span className="detail-label">{t('reminders.notes')}:</span> {selectedReminder.notes || '—'}</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Dashboard;