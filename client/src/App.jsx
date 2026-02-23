import { Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './utils/auth.js'

import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ApplicationsListPage from './pages/ApplicationsListPage.jsx'
import CreateApplicationPage from './pages/CreateApplicationPage.jsx'
import ApplicationDetailPage from './pages/ApplicationDetailPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/applications/new" element={<CreateApplicationPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Default redirect */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
