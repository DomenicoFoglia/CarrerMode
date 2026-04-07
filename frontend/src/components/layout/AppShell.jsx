import './AppShell.css'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import { useState } from 'react'

function AppShell() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
    <div className="app-shell">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <Sidebar 
            isOpen= {sidebarOpen}
            onClose={() => setSidebarOpen(false)}
        />
        {sidebarOpen && (
            <div className='sidebar-overlay' onClick={() => setSidebarOpen(false)}   />
        )}

        <main className="content">
            <Outlet />
        </main>
    </div>
    )
}

export default AppShell