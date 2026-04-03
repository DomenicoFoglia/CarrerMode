import './Topbar.css'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import {useNavigate, NavLink} from 'react-router-dom'


function Topbar(){
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Errore durante il logout dal server", error);
        }finally{
            logout();
            navigate('/');
        }
    };

    return(
        <header className="topbar">
            <div className="topbar-logo">CarrerMode</div>

            <nav className="topbar-nav">
                <NavLink to="/" end className={({isActive}) => isActive ? 'topbar-link active' : 'topbar-link'}>Dashboard</NavLink>
                <NavLink to="/applications" className={({isActive}) => isActive ? 'topbar-link active' : 'topbar-link'}>Candidature</NavLink>
                <NavLink to="/statistics" className={({isActive}) => isActive ? 'topbar-link active' : 'topbar-link'}>Statistiche</NavLink>
                <NavLink to="/reminders" className={({isActive}) => isActive ? 'topbar-link active' : 'topbar-link'}>Promemoria</NavLink>
            </nav>

            <div className="topbar-user-section">
                <span>{user?.name}</span>
                <button 
                    onClick={handleLogout} 
                    className="logout-link"
                >
                    Esci
                </button>
            </div>
            
        </header>
    );
}

export default Topbar;