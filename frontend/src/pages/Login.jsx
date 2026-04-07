import { useState } from "react"
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const setToken = useAuthStore((state) => state.setToken)
    const setUser = useAuthStore((state) => state.setUser)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const response = await api.post('/auth/login', { email, password })
            setToken(response.data.token)
            setUser(response.data.user)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || "Credenziali non valide")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />

            <div className="auth-card">
                <div className="auth-logo">
                    <span className="auth-logo-cm">Career</span>
                    <span className="auth-logo-mode">Mode</span>
                </div>

                <h2 className="auth-title">Bentornato</h2>
                <p className="auth-subtitle">Accedi al tuo account per continuare</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nome@esempio.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? 'Accesso in corso...' : 'Accedi'}
                    </button>
                </form>

                <footer className="auth-footer">
                    Non hai un account?{' '}
                    <Link to="/register">Registrati</Link>
                    <div className="auth-creator">
                        <div className="auth-creator-info">
                            <span>Domenico Foglia</span>
                            <span className="auth-creator-dot">·</span>
                            <span>2026</span>
                            <span className="auth-creator-dot">·</span>
                            <span>Built with Laravel &amp; React</span>
                        </div>
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
                    </div>
                </footer>
            </div>
        </div>

        
    )
}

export default Login