// src/pages/RegulasiPes.tsx
import { Link } from 'react-router-dom'
import NavbarSimple from '../components/NavbarLogo' // Asumsi lokasi file sesuai struktur Anda

const PERATURAN_LOMBA = [
    'Perlombaan akan dilaksanakan di GPIN Filipi pada hari Minggu, 23 Agustus 2026 pukul 14.00 - selesai. (TM dilaksanakan 14.00 WIB Sebelum Lomba dimulai).',
    'Setiap peserta wajib hadir 10 menit sebelum acara dimulai.',
    'Peserta yang sudah mendaftar namun tidak berada di lokasi pada saat lomba maka akan di eliminasi (3x panggilan).',
    'Setiap peserta wajib menjaga sportivitas selama perlombaan berlangsung.',
    'Setiap peserta dan penonton yg berkata kasar akan denda Rp 5.000,- per kata.',
    'Jika pemain terkena kartu merah maka peserta tersebut dikenakan denda sebesar Rp 5.000,-.',
    'Keputusan panitia tidak dapat diganggu gugat.'
]

const PERATURAN_PERTANDINGAN = [
    'Perangkat yang digunakan adalah Playstation 4.',
    'Peserta diperkenankan menggunakan club/negara yang sama dengan lawan (Dilarang Pakai Team Klasik).',
    'Dalam babak penyisihan waktu pertandingan yang digunakan 7 menit (ET: No; PK: Yes).',
    'Dalam babak semifinal dan final waktu pertandingan yang digunakan 10 menit (ET: Yes; PK: Yes).',
    'Kondisi players: netral; Stadion: Wembley; Waktu: Night; Cuaca: Normal; Rumput: Pendek; Bola: Jabulani; Substitusi: 4 (empat); Speed: +1 (Plus 1).',
    'Peserta diberikan waktu 3 menit untuk setting formasi. Setelah waktu habis peserta wajib memulai pertandingan.',
    'Dalam pertadingan peserta dilarang menekan tombol start dengan alasan apapun. Jika melanggar maka akan diberikan peringatan keras. Dan jika sudah 3 (tiga) kali peringatan maka akan di diskualifikasi.',
    'Peserta diperkenankan melakukan pergantian pemain saat half-time, pemain cedera, dan bola mati.',
    'Jika terjadi kartu merah, peserta dapat melakukan setting formasi maks. 1 menit.',
    'Peserta dilarang menggunakan cheat.',
    'Keputusan panitia tidak dapat diganggu gugat.'
]

export default function RegulasiPes() {
    return (
        <>
            <NavbarSimple />
            <div className="min-h-screen bg-night text-cream py-16 px-6">
                <div className="max-w-3xl mx-auto">

                    <div className="mt-8 mb-10 border-b border-cream/10 pb-8">
                        <p className="uppercase tracking-[0.3em] text-xs text-violet font-semibold mb-2">
                            Petunjuk Teknis & Pelaksanaan
                        </p>
                        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
                            Pro Evolution Soccer (PES) Competition
                        </h1>
                        <p className="text-gold font-medium mt-3">Youth Fun Day GPIN Mawil Lampung</p>
                    </div>

                    <div className="space-y-12">
                        {/* Bagian A: Peraturan Lomba */}
                        <section className="bg-night2 border border-cream/10 rounded-2xl p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-cream mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-violet/20 text-violet flex items-center justify-center text-sm">A</span>
                                Peraturan Lomba
                            </h2>
                            <ol className="space-y-4 list-decimal list-outside ml-5 text-cream/80 text-sm sm:text-base leading-relaxed">
                                {PERATURAN_LOMBA.map((rule, index) => (
                                    <li key={`lomba-${index}`} className="pl-2 marker:text-gold marker:font-bold">
                                        {rule}
                                    </li>
                                ))}
                            </ol>
                        </section>

                        {/* Bagian B: Peraturan Pertandingan */}
                        <section className="bg-night2 border border-cream/10 rounded-2xl p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-cream mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gold/20 text-gold flex items-center justify-center text-sm">B</span>
                                Peraturan Pertandingan
                            </h2>
                            <ol className="space-y-4 list-decimal list-outside ml-5 text-cream/80 text-sm sm:text-base leading-relaxed">
                                {PERATURAN_PERTANDINGAN.map((rule, index) => (
                                    <li key={`tanding-${index}`} className="pl-2 marker:text-violet marker:font-bold">
                                        {rule}
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}