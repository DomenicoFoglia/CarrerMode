import './AppShell.css'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

function AppShell() {
    return (
    <div className="app-shell">
        <Topbar />

        <Sidebar />

        <div className="content">
            <Outlet />
        </div>
    </div>
    )
}

export default AppShell