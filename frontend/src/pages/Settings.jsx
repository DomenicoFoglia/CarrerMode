import React, {useState} from 'react'
import { updateTheme, updatePassword } from '../api/user'
import useAuthStore from '../store/authStore'
import './Settings.css'


function Settings(){
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
    ];

    const handleThemeChange = async (themeId) =>{
        try{
            const response = await updateTheme(themeId);
            //Aggiorniamo lo stato globale
            setUser({...user, theme: response.data.theme});
        }catch (error){
            console.error('Errore cambio tema',error);
        }
    };

    const handlePasswordSubmit = async (e) =>{
        e.preventDefault();
        setLoading(true);
        
        try{
            await updatePassword(passwordData);
            alert('Password aggiornata con successo!');
            setPasswordData({
                current_password: '',
                password: '',
                password_confirmation: ''
            });
        }catch (error){
            const msg = error.response?.data?.message || 'Errore imprevisto'; //Il messaaggio di errore ce lo manda LAravel
            alert(msg);
        }finally{
            setLoading(false);
        }
    };

    return (
        <div className="settings-page">
            <h1 className="settings-title">Impostazioni</h1>
            <section className="settings-section">
                <h3>Tema Applicazione</h3>
                <div className="theme-grid">
                    {themes.map((t) => (
                        <div 
                            key={t.id} 
                            className={`theme-card ${user?.theme === t.id ? 'active' : ''}`}
                            onClick={() => handleThemeChange(t.id)}
                        >
                            <div className="theme-preview" style={{ backgroundColor: t.color }}></div>
                            <span>{t.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* SEZIONE 2: CAMBIO PASSWORD */}
            <section className="settings-section">
                <h3>Sicurezza Account</h3>
                <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className="form-group">
                        <label>Password attuale</label>
                        <input 
                            type="password" 
                            value={passwordData.current_password}
                            onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Nuova password</label>
                        <input 
                            type="password" 
                            value={passwordData.password}
                            onChange={e => setPasswordData({...passwordData, password: e.target.value})}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Conferma password</label>
                        <input 
                            type="password" 
                            value={passwordData.password_confirmation}
                            onChange={e => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
                    </button>
                </form>
            </section>
        </div>
    )



}

export default Settings