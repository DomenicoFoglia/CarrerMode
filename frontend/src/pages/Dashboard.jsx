import { useEffect, useState } from 'react';
import { getStats } from '../api/applications';
import './Dashboard.css';
import { getApplications } from '../api/applications';
import { getReminders } from '../api/reminders'
import { useNavigate } from 'react-router-dom';

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
    const itemsPerPage = 5;


    const [loading, setLoading] = useState(true); // Stato per il caricamento

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
                console.log("Dati ricevuti dal server:", statsRes.data);
                console.log("Candidataure ricevute dal server:", appsRes.data)
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

    const navigate = useNavigate();

    if (loading) return <div className="loading">Caricamento in corso...</div>;

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <p className="subtitle">Bentornato! Ecco il riepilogo delle tue attività.</p>
            {/* Sezione Card */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Totale Candidature</h3>
                    <span className="number">{stats?.total || 0}</span>
                    <span className="card-subtitle animated">
                        {cardSubtitleIndex === 0 
                            ? `+${stats?.this_month || 0} questo mese`
                            : `${stats?.sent || 0} inviate`
                        }
                    </span>
                </div>
                <div className="stat-card green">
                    <h3>Colloqui ottenuti</h3>
                    <span className="number">{stats?.interview || 0}</span>
                    <span className="card-subtitle animated">
                        {cardSubtitleIndex === 0
                            ? `Tasso: ${tassoColloqui}%`
                            : `Su ${stats?.total || 0} candidature`
                        }
                    </span>
                </div>
                <div className="stat-card orange">
                    <h3>In attesa</h3>
                    <span className="number">{stats?.waiting || 0}</span>
                    <span className="card-subtitle animated">
                        {cardSubtitleIndex === 0
                            ? `${stats?.expiring_reminders || 0} scadono presto`
                            : `Richiedono follow-up`
                        }
                    </span>
                </div>
                <div className="stat-card red">
                    <h3>Rifiutate</h3>
                    <span className="number">{stats?.rejected || 0}</span>
                    <span className="card-subtitle animated">
                        {cardSubtitleIndex === 0
                            ? `${percentualeRifiutate}% del totale`
                            : `${stats?.total - stats?.rejected || 0} ancora attive`
                        }
                    </span>
                </div>
            </div>

            {/* Sezione Contenuto Principale: Tabella + Reminder affiancati */}
            <div className="dashboard-main-content">
                
                {/* Tabella Sinistra */}
                <div className="recent-applications">
                    <h2>Candidature Recenti</h2>
                    <table className="apps-table">
                        <thead>
                            <tr>
                                <th>Azienda</th>
                                <th>Ruolo</th>
                                <th>Data</th>
                                <th>Stato</th>
                                <th>Tag</th>
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
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">Nessuna candidatura trovata.</td>
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
                        <h2>Promemoria</h2>
                        <span className="reminders-link" onClick={() => navigate('/reminders')}>Vedi tutti →</span>
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
                                        <span className="reminder-company">{rem.application?.company || '—'}</span>
                                        <span className="reminder-date">
                                            {new Date(rem.remind_at).toLocaleDateString('it-IT')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-reminders">Nessun reminder.</p>
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
                                <p><span className="detail-label">Azienda:</span> {selectedReminder.application?.company || '—'}</p>
                                <p><span className="detail-label">Data:</span> {new Date(selectedReminder.remind_at).toLocaleString('it-IT')}</p>
                                <p><span className="detail-label">Note:</span> {selectedReminder.notes || 'Nessuna nota.'}</p>
                                <p><span className="detail-label">Stato:</span> {selectedReminder.sent ? 'Completato' : 'In attesa'}</p>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Pannello stastistiche */}
                <div className="dashboard-status-chart">
                    <h2>Stato candidature</h2>
                    {stats && (
                        <div className="mini-bars">
                            {[
                                { label: 'Inviate', value: stats.sent, color: '#4a9eff' },
                                { label: 'Colloquio', value: stats.interview, color: '#3dba7e' },
                                { label: 'In attesa', value: stats.waiting, color: '#e8a44a' },
                                { label: 'Rifiutate', value: stats.rejected, color: '#e05a5a' },
                            ].map(item => (
                                <div key={item.label} className="mini-bar-row">
                                    <span className="mini-bar-label">{item.label}</span>
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

