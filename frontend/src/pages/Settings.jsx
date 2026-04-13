import React, { useState, useEffect } from 'react'
import { updateTheme, updatePassword, updateGeminiKey, getGeminiKeyStatus, updateName,
    resetOnboarding, updateAiProvider, updateGroqKey, getGroqKeyStatus } from '../api/user'
import useAuthStore from '../store/authStore'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../components/LanguageSwitcher'
import './Settings.css'
import toast from 'react-hot-toast'



function Settings(){
    const navigate = useNavigate();
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

    //AI Gemini
    const [geminiKey, setGeminiKey] = useState('');
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [hasGeminiKey, setHasGeminiKey] = useState(false);

    //AI Grok
    const [groqKey, setGroqKey] = useState('');
    const [groqLoading, setGroqLoading] = useState(false);
    const [hasGroqKey, setHasGroqKey] = useState(false);
    const [aiProvider, setAiProvider] = useState(user?.ai_provider || 'gemini');

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
        getGroqKeyStatus()
            .then(res => setHasGroqKey(res.data.has_groq_key))
            .catch(console.error)
        setAiProvider(user?.ai_provider || 'gemini')
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

    const handleGroqSubmit = async (e) => {
        e.preventDefault()
        setGroqLoading(true)
        try {
            await updateGroqKey(groqKey)
            if (groqKey.trim()) {
                toast.success('Chiave Groq salvata')
                setHasGroqKey(true)
            } else {
                toast.success('Chiave Groq rimossa')
                setHasGroqKey(false)
            }
            setGroqKey('')
        } catch (error) {
            toast.error(t('common.error'))
        } finally {
            setGroqLoading(false)
        }
    }

    const handleProviderChange = async (provider) => {
        try {
            await updateAiProvider(provider)
            setAiProvider(provider)
            setUser({ ...user, ai_provider: provider })
            toast.success(`Provider AI impostato su ${provider === 'gemini' ? 'Google Gemini' : 'Groq'}`)
        } catch (error) {
            toast.error(t('common.error'))
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

    const handleResetOnboarding = async () => {
        try {
            await resetOnboarding();
            setUser({ ...user, onboarding_completed: false });
            toast.success(t('onboarding.repeat_btn'));
            navigate('/');
        } catch (error) {
            toast.error(t('common.error'));
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

            {/* PROVIDER AI */}
            <section className="settings-section">
                <h3>{t('settings.ai_provider_title')}</h3>
                <p className="provider-description">{t('settings.ai_provider_description')}</p>

                <div className="provider-grid">
                    <div
                        className={`provider-card ${aiProvider === 'gemini' ? 'active' : ''}`}
                        onClick={() => handleProviderChange('gemini')}
                    >
                        <h4>Google Gemini</h4>
                        <p>{t('settings.ai_provider_gemini_desc')}</p>
                    </div>
                    <div
                        className={`provider-card ${aiProvider === 'groq' ? 'active' : ''}`}
                        onClick={() => handleProviderChange('groq')}
                    >
                        <h4>Groq</h4>
                        <p>{t('settings.ai_provider_groq_desc')}</p>
                    </div>
                </div>

                {aiProvider === 'gemini' && (
                    <>
                        <p className="provider-description">
                            {t('settings.gemini_description')}{' '}
                            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                                aistudio.google.com
                            </a>.
                        </p>
                        <div className="key-status">
                            <span className={`key-status-dot ${hasGeminiKey ? 'active' : 'inactive'}`} />
                            <span>{hasGeminiKey ? t('settings.gemini_saved') : t('settings.gemini_not_set')}</span>
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
                            <div className="form-actions">
                                <button type="submit" className="btn-save" disabled={geminiLoading || !geminiKey.trim()}>
                                    {geminiLoading ? t('common.loading') : t('settings.gemini_save')}
                                </button>
                                {hasGeminiKey && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => { setGeminiKey(''); handleGeminiSubmit({ preventDefault: () => {} }) }}
                                    >
                                        {t('settings.gemini_remove')}
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                )}

                {aiProvider === 'groq' && (
                    <>
                        <p className="provider-description">
                            {t('settings.groq_description')}{' '}
                            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
                                console.groq.com
                            </a>.
                        </p>
                        <div className="key-status">
                            <span className={`key-status-dot ${hasGroqKey ? 'active' : 'inactive'}`} />
                            <span>{hasGroqKey ? t('settings.groq_saved') : t('settings.groq_not_set')}</span>
                        </div>
                        <form onSubmit={handleGroqSubmit} className="password-form">
                            <div className="form-group">
                                <input
                                    type="password"
                                    value={groqKey}
                                    onChange={e => setGroqKey(e.target.value)}
                                    placeholder={t('settings.groq_placeholder')}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save" disabled={groqLoading || !groqKey.trim()}>
                                    {groqLoading ? t('common.loading') : t('settings.groq_save')}
                                </button>
                                {hasGroqKey && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => { setGroqKey(''); handleGroqSubmit({ preventDefault: () => {} }) }}
                                    >
                                        Rimuovi
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                )}
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

            {/* TUTORIAL */}
            <section className="settings-section">
                <h3>{t('onboarding.repeat_btn')}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    {t('settings.language_description')}
                </p>
                <button className="btn-save" onClick={handleResetOnboarding}>
                    {t('onboarding.repeat_btn')} 🎓
                </button>
            </section>
        </div>
    );
}

export default Settings