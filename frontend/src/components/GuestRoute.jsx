import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function GuestRoute({ children }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (isAuthenticated) {
        return <Navigate to="/" />
    }

    return children
}

export default GuestRoute