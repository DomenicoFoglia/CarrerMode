import './App.css'
import {Routes, Route, Navigate} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ApplicationDetail from './pages/ApplicationDetail'
import ApplicationNew from './pages/ApplicationNew'
import Applications from './pages/Applications'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import Statistics from './pages/Statistics'
import Reminders from './pages/Reminders'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'


function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/applications/new" element={<ProtectedRoute><ApplicationNew /></ProtectedRoute>} />
      <Route path="/application/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
      <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
      <Route path="/reminder" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      {/* Questa ultima rotta serve per gestire pagine che non esistono, il sistema ti riporta alla Dashboard.
      Se sei loggato resta li altrimenti va alla pagina di Login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App