import { useState } from "react"
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import {useNavigate} from 'react-router-dom'


function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState(null); // Per mostrare errori all'utente

    //Hook di navigazione e store
    const navigate = useNavigate();
    const setToken = useAuthStore((state) => state.setToken);
    const setUser = useAuthStore((state) => state.setUser);

    //Inviio
    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError(null); //Resetta l'errore a ogni tentativo

        try{
            //Inviamo i dati al backend
            const response = await api.post('/auth/register', {
                name: name,
                email: email, 
                password: password,
                password_confirmation: password_confirmation
            });

            //Sanctum restituiscec il token e lo user
            const token = response.data.token;
            const user = response.data.user;
            //Lo salviamo nel localStorage
            setToken(token);
            //Losalviamo nello store Zustand
            setUser(user);

            //Redirect alla Dashboard perche abbiamo gia il tokene siamo loggati dopo la registrazione
            //se cosi non fosse entreremmo nel catch
            navigate('/');
        
        }catch(err){
            // Se il backend risponde con un errore (es. 401 Credenziali errate)
            const message = err.response?.data?.message || "Errore durante la registrazione";
            setError(message);
            console.error("Registrazione fallita:", message);
        }

    };

    return (
        <div>
            <h1>Registrati a CareerMode</h1>
            {error && (
                <p style={{ color: 'red', fontWeight: 'bold' }}>
                    {error}
                </p>
            )}
            <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome"
                    required
                />
                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <input 
                    type="password"
                    value={password_confirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Conferma password"
                    required
                />
                <button type="submit">Registrati</button>
            </form>
        </div>
    )
}

export default Register