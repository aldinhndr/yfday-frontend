import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AdminProvider } from './context/AdminContext'

import Landing from './pages/Landing'
import DaftarBadminton from './pages/DaftarBadminton'
import DaftarPes from './pages/DaftarPes'
import DaftarTenisMeja from './pages/DaftarTenisMeja'
import RegulasiPes from './pages/RegulasiPes'

import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import RequireAdmin from './components/RequireAdmin'
import AdminRollingPes from './pages/AdminRollingPes'
import PublicStagePes from './pages/PublicStagePes'
import WasitBadmintonScore from './pages/WasitBadmintonSkor'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <Routes>
              {/* === RUTE PUBLIK & PESERTA === */}
              <Route path="/" element={<Landing />} />
              <Route path="/daftar/badminton" element={<DaftarBadminton />} />
              <Route path="/daftar/pes" element={<DaftarPes />} />
              <Route path="/daftar/tenis-meja" element={<DaftarTenisMeja />} />
              <Route path="/regulasi/pes" element={<RegulasiPes />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* === RUTE OPERASIONAL TURNAMEN === */}
              <Route path="/stage/pes" element={<PublicStagePes />} />
              <Route path="/wasit/badminton" element={<WasitBadmintonSkor />} />

              {/* === RUTE KHUSUS ADMIN === */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    {(admin) => <AdminDashboard />}
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/rolling/pes"
                element={
                  <RequireAdmin>
                    {() => <AdminRollingPes />}
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