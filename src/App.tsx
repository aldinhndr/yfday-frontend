import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import Landing from './pages/Landing.tsx'
import DaftarBadminton from './pages/DaftarBadminton.tsx'
import DaftarPes from './pages/DaftarPes.tsx'
import DaftarTenisMeja from './pages/DaftarTenisMeja.tsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/daftar/badminton" element={<DaftarBadminton />} />
          <Route path="/daftar/pes" element={<DaftarPes />} />
          <Route path="/daftar/tenis-meja" element={<DaftarTenisMeja />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider >
  )
}