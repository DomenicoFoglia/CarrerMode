import { useEffect, useState } from 'react';
import { getStats } from '../api/applications';
import './Dashboard.css';
import { getApplications } from '../api/applications';
import { getReminders } from '../api/reminders'
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [selectedReminder, setSelectedReminder] = useState(null);
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

    const navigate = useNavigate();

    if (loading) return <div className="loading">Caricamento in corso...</div>;

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <p className="subtitle">Bentornato! Ecco il riepilogo delle tue attività.</p>
            {/* Sezione Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Totale Candidature</h3>
                    <span className="number">{stats?.total || 0}</span>
                </div>
                <div className="stat-card">
                    <h3>Inviate</h3>
                    <span className="number">{stats?.sent || 0}</span>
                </div>
                <div className="stat-card">
                    <h3>Colloqui</h3>
                    <span className="number">{stats?.interviews || 0}</span>
                </div>
                <div className="stat-card">
                    <h3>Rifiutate</h3>
                    <span className="number">{stats?.rejected || 0}</span>
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
                                applications.map(app => (
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
                            reminders.slice(0, 5).map(rem => (
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

            </div>           
        </div>
    );

}

export default Dashboard;

