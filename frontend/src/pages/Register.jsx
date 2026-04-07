import { useState } from "react"
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password_confirmation, setPasswordConfirmation] = useState('')
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
            const response = await api.post('/auth/register', {
                name, email, password, password_confirmation
            })
            setToken(response.data.token)
            setUser(response.data.user)
            navigate('/')
        } catch (err) {
            const errors = err.response?.data?.errors
            const message = errors
                ? Object.values(errors).flat().join(' ')
                : err.response?.data?.message || "Errore durante la registrazione"
            setError(message)
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

                <h2 className="auth-title">Crea un account</h2>
                <p className="auth-subtitle">Inizia a tracciare le tue candidature</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label>Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Il tuo nome"
                            required
                            autoComplete="name"
                        />
                    </div>

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
                            placeholder="Minimo 8 caratteri"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="auth-field">
                        <label>Conferma password</label>
                        <input
                            type="password"
                            value={password_confirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? 'Registrazione...' : 'Registrati'}
                    </button>
                </form>

                <footer className="auth-footer">
                    Hai già un account?{' '}
                    <Link to="/login">Accedi</Link>
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

export default Register