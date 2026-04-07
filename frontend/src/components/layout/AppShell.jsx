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

        <footer className="app-footer">
            <span>Domenico Foglia</span>
            <span className="app-footer-dot">·</span>
            <span>CareerMode v1.0.0</span>
            <span className="app-footer-dot">·</span>
            <span>2026</span>
            <div className="auth-creator-links">
                <a href="https://github.com/DomenicoFoglia" target="_blank" rel="noreferrer">
                    GitHub
                </a>
                <a href="https://linkedin.com/in/domenicofoglia" target="_blank" rel="noreferrer">
                    LinkedIn
                </a>
                <a href="mailto:tua@email.com">
                    Email
                </a>
            </div>
        </footer>
    </div>
    )
}

export default AppShell