import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SearchPage from './pages/SearchPage'
import ProfessionalProfilePage from './pages/ProfessionalProfilePage'
import AppointmentsPage from './pages/AppointmentsPage'
import SupportPage from './pages/SupportPage'
import ProfilePage from './pages/ProfilePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import TermsPage from './pages/TermsPage'
import MyPatientsPage from './pages/MyPatientsPage'
import FinancialPage from './pages/FinancialPage'
import SchedulePage from './pages/SchedulePage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/professional/:id" element={<ProfessionalProfilePage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-patients" element={<MyPatientsPage />} />
          <Route path="/financial" element={<FinancialPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/termos-de-uso" element={<TermsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

