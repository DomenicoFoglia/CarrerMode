import { useState } from "react"
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import {useNavigate} from 'react-router-dom'


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Per mostrare errori all'utente
    // const [user,  setUser] = useState('');

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
            const response = await api.post('/auth/login', {
                email: email, 
                password: password
            });

            //Sanctum restituiscec il token e lo user
            const token = response.data.token;
            const user = response.data.user;
            //L salviamo nel localStorage
            setToken(token);
            //Losalviamo nello store Zustand
            setUser(user);

            //Portiamo l'uteente alla Dashboard
            navigate('/');
        }catch(err){
            // Se il backend risponde con un errore (es. 401 Credenziali errate)
            const message = err.response?.data?.message || "Errore durante il login";
            setError(message);
            console.error("Login fallito:", message);
        }

    };

    return (
        <div>
            <h1>Accedi a CareerMode</h1>
            {error && (
                <p style={{ color: 'red', fontWeight: 'bold' }}>
                    {error}
                </p>
            )}
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Accedi</button>
            </form>
        </div>
    )
}

export default Login