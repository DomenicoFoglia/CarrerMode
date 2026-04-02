import './App.css'
import {Routes, Route, Navigate} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ApplicationDetail from './pages/ApplicationDetail'
import ApplicationNew from './pages/ApplicationNew'
import Applications from './pages/Applications'
import ApplicationEdit from './pages/ApplicationEdit'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import Statistics from './pages/Statistics'
import Reminders from './pages/Reminders'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import AppShell from './components/layout/AppShell'


function App() {
  return (
    <Routes>
      {/* Rotte pubbliche */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        {/* Rotte protette con layout */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/new" element={<ApplicationNew />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        <Route path="/applications/:id/edit" element={<ApplicationEdit />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/settings" element={<Settings />} />
        {/* Questa ultima rotta serve per gestire pagine che non esistono, il sistema ti riporta alla Dashboard.
        Se sei loggato resta li altrimenti va alla pagina di Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
      
    </Routes>
  )
}

export default App