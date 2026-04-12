import './AppShell.css'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import OnboardingModal from '../OnboardingModal'
import useAuthStore from '../../store/authStore'

function AppShell() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuthStore();
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (user && !user.onboarding_completed) {
            setShowOnboarding(true)
        }
    }, [user]);

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

        <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '14px',
                },
                success: {
                    iconTheme: {
                        primary: '#3dba7e',
                        secondary: 'var(--bg-secondary)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#e05a5a',
                        secondary: 'var(--bg-secondary)',
                    },
                },
            }}
        />
        {showOnboarding && (
            <OnboardingModal onClose={() => setShowOnboarding(false)} />
        )}
    </div>
    )
}

export default AppShell