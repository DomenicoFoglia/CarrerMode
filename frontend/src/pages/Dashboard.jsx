import { useEffect, useState } from 'react';
import { getStats } from '../api/applications';
import './Dashboard.css';

function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getStats();
                setStats(response.data);
                console.log("Dati ricevuti dal server:", response.data);
            } catch (error) {
                console.error("Errore nel caricamento statistiche:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            
            {/* Se stats è ancora null (mentre carica), mostriamo un caricamento */}
            {!stats ? (
                <p>Caricamento dati...</p>
            ) : (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Totale Candidature</h3>
                        <span className="number">{stats.total}</span>
                    </div>
                    <div className="stat-card">
                        <h3>Inviate</h3>
                        <span className="number">{stats.sent}</span>
                    </div>
                    <div className="stat-card">
                        <h3>Colloqui</h3>
                        <span className="number">{stats.interview}</span>
                    </div>
                    <div className="stat-card">
                        <h3>Rifiutate</h3>
                        <span className="number">{stats.rejected}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;