import './App.css'
import {Routes, Route} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ApplicationDetail from './pages/ApplicationDetail'
import ApplicationNew from './pages/ApplicationNew'
import Applications from './pages/Applications'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import Statistics from './pages/Statistics'
import Reminders from './pages/Reminders'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/applications/new" element={<ApplicationNew />} />
      <Route path="/application/:id" element={<ApplicationDetail />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/reminder" element={<Reminders />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App