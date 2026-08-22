import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AdminProvider } from './context/AdminContext'

import Landing from './pages/Landing'
import DaftarBadminton from './pages/DaftarBadminton'
import DaftarPes from './pages/DaftarPes'
import DaftarTenisMeja from './pages/DaftarTenisMeja'
import RegulasiPes from './pages/RegulasiPes' // <-- 1. Import Halaman Baru

import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import RequireAdmin from './components/RequireAdmin'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <Routes>
              {/* === RUTE PUBLIK === */}
              <Route path="/" element={<Landing />} />
              <Route path="/daftar/badminton" element={<DaftarBadminton />} />
              <Route path="/daftar/pes" element={<DaftarPes />} />
              <Route path="/daftar/tenis-meja" element={<DaftarTenisMeja />} />

              <Route path="/regulasi/pes" element={<RegulasiPes />} />

              <Route path="/admin/login" element={<AdminLoginPage />} />

              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    {(admin) => <AdminDashboard />}
                  </RequireAdmin>
                }
              />
            </Routes>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}