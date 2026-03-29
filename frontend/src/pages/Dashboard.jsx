import { useEffect, useState } from 'react';
import { getStats } from '../api/applications';
import './Dashboard.css';
import { getApplications } from '../api/applications';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true); // Stato per il caricamento

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, appsRes] = await Promise.all([
                    getStats(),
                    getApplications()
                ]);

                setStats(statsRes.data);
                setApplications(appsRes.data.data);
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

    if (loading) return <div className="loading">Caricamento in corso...</div>;

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            
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

            {/* Nuova Sezione Tabella */}
            <div className="recent-applications">
                <h2>Candidature Recenti</h2>
                <table className="apps-table">
                    <thead>
                        <tr>
                            <th>Azienda</th>
                            <th>Ruolo</th>
                            <th>Data</th>
                            <th>Stato</th>
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
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">Nessuna candidatura trovata.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

}

export default Dashboard;