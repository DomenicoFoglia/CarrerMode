import React, { useState } from 'react'
import { updateTheme, updatePassword } from '../api/user'
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
    ]

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

            {/* LINGUA */}
            <section className="settings-section">
                <h3>{t('settings.language_title')}</h3>
                <LanguageSwitcher />
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