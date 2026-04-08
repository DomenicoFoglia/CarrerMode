import { useEffect, useState } from 'react';
import { getStats, getApplications } from '../api/applications';
import './Dashboard.css';
import { getReminders } from '../api/reminders'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Dashboard() {
    //Statistiche nelle card
    const [stats, setStats] = useState(null);
    const [cardSubtitleIndex, setCardSubtitleIndex] = useState(0);
    //Candidature
    const [applications, setApplications] = useState([]);
    //Reminders
    const [reminders, setReminders] = useState([]);
    const [selectedReminder, setSelectedReminder] = useState(null);
    //Paginazione candidature e reminder
    const [currentPageApps, setCurrentPageApps] = useState(1);
    const [currentPageReminders, setCurrentPageReminders] = useState(1);
    const [loading, setLoading] = useState(true); // Stato per il caricamento
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
            }finally{
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

    //Dati aggiuntivi delle card
    const tassoColloqui = stats?.total > 0 
        ? ((stats.interview / stats.total) * 100).toFixed(1) 
        : 0

    const percentualeRifiutate = stats?.total > 0 
        ? ((stats.rejected / stats.total) * 100).toFixed(1) 
        : 0

    //Paginazione
    const totalPages= Math.ceil(applications.length / itemsPerPage);
    const totalePagesReminders = Math.ceil(reminders.length / itemsPerPage);
    const paginatedApps = applications.slice( (currentPageApps - 1) * itemsPerPage, currentPageApps * itemsPerPage);
    const paginatedReminders = reminders.slice((currentPageReminders - 1) * itemsPerPage, currentPageReminders * itemsPerPage);


    if (loading) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div className="dashboard-container">
            <h1>{t('dashboard.title')}</h1>
            <p className="subtitle">{t('dashboard.subtitle')}</p>
            {/* Sezione Card */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{t('dashboard.total')}</h3>
                    <span className="number">{stats?.total || 0}</span>
                    <span className="card-subtitle animated">
                        {cardSubtitleIndex === 0 
                            ? `+${stats?.this_month || 0} ${t('dashboard.this_month')}`
                            : `${stats?.sent || 0} ${t('dashboard.sent_label')}`
                        }
                    </span>
                </div>
                <div className="stat-card green">
                    <h3>{t('dashboard.interviews')}</h3>
                    <span className="number">{stats?.interview || 0}</span>
                    <span className="card-subtitle animated" key={`i-${cardSubtitleIndex}`}>
                        {cardSubtitleIndex === 0
                            ? `${t('dashboard.conversion_rate')} ${tassoColloqui}%`
                            : `${t('dashboard.on_total')} ${stats?.total || 0}`
                        }
                    </span>
                </div>
                <div className="stat-card orange">
                    <h3>${t('dashboard.on_total')}</h3>
                    <span className="number">{stats?.waiting || 0}</span>
                    <span className="card-subtitle animated" key={`w-${cardSubtitleIndex}`}>
                        {cardSubtitleIndex === 0
                            ? `${stats?.expiring_reminders || 0} ${t('dashboard.expiring_soon')}`
                            : t('dashboard.follow_up')
                        }
                    </span>
                </div>
                <div className="stat-card red">
                    <h3>{t('dashboard.rejected')}</h3>
                    <span className="number">{stats?.rejected || 0}</span>
                    <span className="card-subtitle animated" key={`r-${cardSubtitleIndex}`}>
                        {cardSubtitleIndex === 0
                            ? `${percentualeRifiutate}% ${t('dashboard.of_total')}`
                            : `${stats?.total - stats?.rejected || 0} ${t('dashboard.still_active')}`
                        }
                    </span>
                </div>
            </div>

            {/* Sezione Contenuto Principale: Tabella + Reminder affiancati */}
            <div className="dashboard-main-content">
                
                {/* Tabella Sinistra */}
                <div className="recent-applications">
                    <h2>{t('dashboard.recent_applications')}</h2>
                    <table className="apps-table">
                        <thead>
                            <tr>
                                <th>{t('applications.col_company')}</th>
                                <th>{t('applications.col_role')}</th>
                                <th>{t('applications.col_date')}</th>
                                <th>{t('applications.col_status')}</th>
                                <th>{t('applications.col_tags')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.length > 0 ? (
                                paginatedApps.map(app => (
                                    <tr key={app.id}>
                                        <td>{app.company}</td>
                                        <td>{app.role}</td>
                                        <td>{new Date(app.created_at).toLocaleDateString('it-IT')}</td>
                                        <td>
                                            <span className={`status-badge ${app.status}`}>
                                                {t('applications.col_tags')}
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
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">{t('applications.empty')}</td>
                                </tr>
                            )}
                            {totalPages > 1 && (
                                <div className="dashboard-pagination">
                                    <button 
                                        onClick={() => setCurrentPageApps(p => p - 1)} 
                                        disabled={currentPageApps === 1}
                                        className="page-btn"
                                    >←</button>
                                    <span className="page-info">{currentPageApps} / {totalPages}</span>
                                    <button 
                                        onClick={() => setCurrentPageApps(p => p + 1)} 
                                        disabled={currentPageApps === totalPages}
                                        className="page-btn"
                                    >→</button>
                                </div>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pannello Reminder Destra */}
                <aside className="dashboard-reminders">
                    <div className="reminders-header">
                        <h2>{t('dashboard.reminders_title')}</h2>
                        <span className="reminders-link" onClick={() => navigate('/reminders')}>{t('dashboard.see_all')}</span>
                    </div>
                    <div className="reminders-list">
                        {reminders.length > 0 ? (
                            paginatedReminders.map(rem => (
                                <div 
                                    key={rem.id} 
                                    className={`reminder-item ${selectedReminder?.id === rem.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedReminder(selectedReminder?.id === rem.id ? null : rem)}
                                >
                                    <div className={`reminder-dot ${rem.sent ? 'sent' : 'pending'}`}></div>
                                    <div className="reminder-info">
                                        <span className="reminder-title">{rem.title}</span>
                                        <span className="reminder-company">{rem.application?.company || '-'}</span>
                                        <span className="reminder-date">
                                            {new Date(rem.remind_at).toLocaleDateString('it-IT')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-reminders">{t('dashboard.no_reminders')}</p>
                        )}
                        {totalePagesReminders > 1 && (
                            <div className="dashboard-pagination">
                                <button 
                                    onClick={() => setCurrentPageReminders(p => p - 1)} 
                                    disabled={currentPageReminders === 1}
                                    className="page-btn"
                                >←</button>
                                <span className="page-info">{currentPageReminders} / {totalePagesReminders}</span>
                                <button 
                                    onClick={() => setCurrentPageReminders(p => p + 1)} 
                                    disabled={currentPageReminders === totalePagesReminders}
                                    className="page-btn"
                                >→</button>
                            </div>
                            )}
                    </div>

                    {/* Pannello dettaglio */}
                    {selectedReminder && (
                        <div className="reminder-detail">
                            <div className="reminder-detail-header">
                                <span className="reminder-detail-title">{selectedReminder.title}</span>
                                <button className="reminder-detail-close" onClick={() => setSelectedReminder(null)}>×</button>
                            </div>
                            <div className="reminder-detail-body">
                                <p><span className="detail-label">{t('application_detail.location').replace(':', '')}:</span> {selectedReminder.application?.company || '—'}</p>
                                <p><span className="detail-label">{t('reminders.remind_at')}:</span> {new Date(selectedReminder.remind_at).toLocaleString('it-IT')}</p>
                                <p><span className="detail-label">{t('reminders.notes')}:</span> {selectedReminder.notes || 'Nessuna nota.'}</p>
                                <p><span className="detail-label">{t('applications.col_status')}:</span> {selectedReminder.sent ? 'Completato' : 'In attesa'}</p>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Pannello stastistiche */}
                <div className="dashboard-status-chart">
                    <h2>{t('dashboard.status_chart')}</h2>
                    {stats && (
                        <div className="mini-bars">
                            {[
                                { key: 'sent', value: stats.sent, color: '#4a9eff' },
                                { key: 'interview', value: stats.interview, color: '#3dba7e' },
                                { key: 'waiting', value: stats.waiting, color: '#e8a44a' },
                                { key: 'rejected', value: stats.rejected, color: '#e05a5a' },
                            ].map(item => (
                                <div key={item.key} className="mini-bar-row">
                                    <span className="mini-bar-label">{t(`status.${item.key}`)}</span>
                                    <div className="mini-bar-track">
                                        <div 
                                            className="mini-bar-fill"
                                            style={{ 
                                                width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : '0%',
                                                background: item.color 
                                            }}
                                        />
                                    </div>
                                    <span className="mini-bar-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>           
        </div>
    );

}

export default Dashboard;

