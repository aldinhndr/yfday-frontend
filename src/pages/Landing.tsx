import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.tsx'
import Hero from '../components/Hero.tsx'
import LombaSection from '../components/LombaSection.tsx'
import Jadwal from '../components/Jadwal.tsx'
import History from '../components/History.tsx'
import GpinIntro from '../components/GpinIntro.tsx'
import Footer from '../components/Footer.tsx'

export default function Landing() {
  const navigate = useNavigate()

  const scrollToLomba = () => {
    document.getElementById('lomba')?.scrollIntoView({ behavior: 'smooth' })
  }
  const goDaftar = (lomba: string) => navigate(`/daftar/${lomba}`)

  return (
    <div className="bg-night text-cream">
      <Navbar onDaftar={scrollToLomba} />
      <Hero onDaftar={scrollToLomba} />
      <Jadwal />
      <History />
      <LombaSection onPilihLomba={goDaftar} />
      <GpinIntro />
      <Footer onDaftar={scrollToLomba} />
    </div>
  )
}