import React, { useState, useEffect } from 'react'
import { updateTheme, updatePassword, updateGeminiKey, getGeminiKeyStatus, updateName } from '../api/user'
import useAuthStore from '../store/authStore'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import './Settings.css'
import toast from 'react-hot-toast'



function Settings(){
    const { t } = useTranslation();
    //recuperiamo l'utente
    const {user, setUser} = useAuthStore();

    //Stato per il form della password
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const [loading, setLoading] = useState(false);

    //AI
    const [geminiKey, setGeminiKey] = useState('');
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [hasGeminiKey, setHasGeminiKey] = useState(false);

    //Gestione nome utente
    const [newName, setNewName] = useState('');
    const [nameLoading, setNameLoading] = useState(false);

    //Temi
    const themes = [
        { id: 'midnight', name: 'Midnight', color: '#131825' },
        { id: 'steel', name: 'Steel', color: '#27272a' },
        { id: 'violet', name: 'Violet', color: '#2e1065' },
        { id: 'forest', name: 'Forest', color: '#064e3b' },
        { id: 'ember', name: 'Ember', color: '#451a03' },
        { id: 'crimson', name: 'Crimson', color: '#450a0a' },
        { id: 'light', name: 'Light', color: '#dbeafe' },
        { id: 'light-warm', name: 'Warm', color: '#fef3c7' },
        { id: 'light-green', name: 'Nature', color: '#dcfce7' },
        { id: 'royale', name: 'Royale', color: '#f7b538' },
    ];

    useEffect(() => {
        getGeminiKeyStatus()
            .then(res => setHasGeminiKey(res.data.has_gemini_key))
            .catch(console.error)
    }, []);

    const handleThemeChange = async (themeId) => {
        try {
            await updateTheme(themeId)
            localStorage.setItem('theme', themeId)
            document.documentElement.setAttribute('data-theme', themeId)
            setUser({ ...user, theme: themeId })
        } catch (error) {
            console.error('Errore cambio tema', error)
        }
    }

    const handlePasswordSubmit = async (e) =>{
        e.preventDefault();
        setLoading(true);
        
        try{
            await updatePassword(passwordData);
            toast.success(t('settings.password_success'));
            setPasswordData({
                current_password: '',
                password: '',
                password_confirmation: ''
            });
        }catch (error){
            const msg = error.response?.data?.message || t('common.error'); //Il messaaggio di errore ce lo manda LAravel
            toast.error(msg);
        }finally{
            setLoading(false);
        }
    };

    const handleGeminiSubmit = async (e) => {
        e.preventDefault()
        setGeminiLoading(true)
        try {
            await updateGeminiKey(geminiKey)
            if (geminiKey.trim()) {
                toast.success(t('settings.gemini_success'))
                setHasGeminiKey(true)
            } else {
                toast.success(t('settings.gemini_removed'))
                setHasGeminiKey(false)
            }
            setGeminiKey('')
        } catch (error) {
            toast.error(t('common.error'))
        } finally {
            setGeminiLoading(false)
        }
    }

    const handleNameSubmit = async (e) => {
        e.preventDefault()
        setNameLoading(true)
        try {
            const res = await updateName(newName)
            setUser({ ...user, name: res.data.user.name })
            toast.success(t('settings.name_success'))
            setNewName('')
        } catch (error) {
            toast.error(t('common.error'))
        } finally {
            setNameLoading(false)
        }
    }

    return (
        <div className="settings-page">
            <h1 className="settings-title">{t('settings.title')}</h1>

            {/* TEMA */}
            <section className="settings-section">
                <h3>{t('settings.theme_title')}</h3>
                <div className="theme-grid">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            className={`theme-card ${user?.theme === theme.id ? 'active' : ''}`}
                            onClick={() => handleThemeChange(theme.id)}
                        >
                            <div className="theme-preview" style={{ backgroundColor: theme.color }}></div>
                            <span>{theme.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* NOME UTENTE */}
            <section className="settings-section">
                <h3>{t('settings.name_title')}</h3>
                <form onSubmit={handleNameSubmit} className="password-form">
                    <div className="form-group">
                        <label>{t('settings.name_title')}</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder={user?.name}
                        />
                    </div>
                    <button type="submit" className="btn-save" disabled={nameLoading || !newName.trim()}>
                        {nameLoading ? t('common.loading') : t('settings.name_save')}
                    </button>
                </form>
            </section>

            {/* GEMINI API KEY */}
            <section className="settings-section">
                <h3>{t('settings.gemini_title')}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    {t('settings.gemini_description')}{' '}
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                        aistudio.google.com
                    </a>.
                </p>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                    padding: '10px 16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                }}>
                    <span style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: hasGeminiKey ? '#3dba7e' : '#e05a5a',
                        flexShrink: 0
                    }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        {hasGeminiKey ? t('settings.gemini_saved') : t('settings.gemini_not_set')}
                    </span>
                </div>

                <form onSubmit={handleGeminiSubmit} className="password-form">
                    <div className="form-group">
                        <input
                            type="password"
                            value={geminiKey}
                            onChange={e => setGeminiKey(e.target.value)}
                            placeholder={t('settings.gemini_placeholder')}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn-save" disabled={geminiLoading || !geminiKey.trim()}>
                            {geminiLoading ? t('common.loading') : t('settings.gemini_save')}
                        </button>
                        {hasGeminiKey && (
                            <button
                                type="button"
                                className="btn-save"
                                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                                onClick={() => {
                                    setGeminiKey('')
                                    handleGeminiSubmit({ preventDefault: () => {} })
                                }}
                            >
                                {t('settings.gemini_remove')}
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {/* PASSWORD */}
            <section className="settings-section">
                <h3>{t('settings.password_title')}</h3>
                <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className="form-group">
                        <label>{t('settings.current_password')}</label>
                        <input
                            type="password"
                            value={passwordData.current_password}
                            onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('settings.new_password')}</label>
                        <input
                            type="password"
                            value={passwordData.password}
                            onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('settings.confirm_password')}</label>
                        <input
                            type="password"
                            value={passwordData.password_confirmation}
                            onChange={e => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? t('settings.saving') : t('settings.save_password')}
                    </button>
                </form>
            </section>
        </div>
    );
}

export default Settings