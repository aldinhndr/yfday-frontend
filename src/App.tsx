import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing.tsx'
import DaftarBadminton from './pages/DaftarBadminton.tsx'
import DaftarPes from './pages/DaftarPes.tsx'
import DaftarTenisMeja from './pages/DaftarTenisMeja.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import { AdminProvider } from './context/AdminContext.tsx'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/daftar/badminton" element={<DaftarBadminton />} />
              <Route path="/daftar/pes" element={<DaftarPes />} />
              <Route path="/daftar/tenis-meja" element={<DaftarTenisMeja />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}