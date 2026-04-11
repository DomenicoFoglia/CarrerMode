import { useState } from "react"
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import './Auth.css'

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const navigate = useNavigate();
    const setToken = useAuthStore((state) => state.setToken);
    const setUser = useAuthStore((state) => state.setUser);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post('/auth/register', {
                name, email, password, password_confirmation
            })
            setToken(response.data.token);
            setUser(response.data.user);
            navigate('/');
        } catch (err) {
            const errors = err.response?.data?.errors
            const message = errors
                ? Object.values(errors).flat().join(' ')
                : err.response?.data?.message || t('common.error')
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <LanguageSwitcher />
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />

            <div className="auth-card">
                <div className="auth-logo">
                    <span className="auth-logo-cm">Career</span>
                    <span className="auth-logo-mode">Mode</span>
                </div>

                <h2 className="auth-title">{t('auth.register_title')}</h2>
                <p className="auth-subtitle">{t('auth.register_subtitle')}</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label>{t('auth.name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('auth.name_placeholder')}
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div className="auth-field">
                        <label>{t('auth.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('auth.email_placeholder')}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label>{t('auth.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                        <span className="auth-hint">
                            {t('auth.password_placeholder')}
                        </span>
                    </div>

                    <div className="auth-field">
                        <label>{t('auth.confirm_password')}</label>
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
                        {loading ? t('auth.registering') : t('auth.register_btn')}
                    </button>
                </form>

                <footer className="auth-footer">
                    {t('auth.have_account')}{' '}
                    <Link to="/login">{t('auth.sign_in')}</Link>
                </footer>
                
                <div className="auth-creator">
                    <div className="auth-creator-info">
                        <span>Domenico Foglia</span>
                        <span className="auth-creator-dot">·</span>
                        <span>2026</span>
                        <span className="auth-creator-dot">·</span>
                        <span>{t('common.built_with')}</span>
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
            </div>
        </div>
    )
}

export default Register