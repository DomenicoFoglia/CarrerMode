import './Topbar.css'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import {useNavigate} from 'react-router-dom'

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