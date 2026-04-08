import { useState } from "react"
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import './Auth.css'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            const response = await api.post('/auth/login', { email, password });
            setToken(response.data.token);
            setUser(response.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || t('common.error'));
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

                <h2 className="auth-title">{t('auth.login_title')}</h2>
                <p className="auth-subtitle">{t('auth.login_subtitle')}</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
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
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? t('auth.logging_in') : t('auth.login_btn')}
                    </button>
                </form>

                <footer className="auth-footer">
                    {t('auth.no_account')}{' '}
                    <Link to="/register">{t('auth.sign_up')}</Link>
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
                        <a href="https://github.com/DomenicoFoglia" target="_blank" rel="noreferrer">GitHub</a>
                        <a href="https://linkedin.com/in/domenicofoglia" target="_blank" rel="noreferrer">LinkedIn</a>
                        <a href="mailto:tua@email.com">Email</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login