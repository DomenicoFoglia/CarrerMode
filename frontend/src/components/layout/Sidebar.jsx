import './Sidebar.css'
import { NavLink } from 'react-router-dom'

function Sidebar(){

    return(
        <div className='sidebar'>
            <nav className='sidebar-nav'>
                <NavLink className="sidebar-link" to="/" end>Dashboard</NavLink>
                <NavLink className="sidebar-link" to="/applications">Candidature</NavLink>
                <NavLink className="sidebar-link" to="/statistics">Statistiche</NavLink>
                <NavLink className="sidebar-link" to="/reminders">Promemorie</NavLink>
                <NavLink className="sidebar-link" to="/settings">Opzioni</NavLink>
            </nav>
        </div>
        
    );
}

export default Sidebar;