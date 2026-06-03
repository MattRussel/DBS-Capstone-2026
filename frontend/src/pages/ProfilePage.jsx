// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';

const ProfilePage = ({ session }) => {
  // Mengambil data profil anak dari session atau localStorage hasil login/register
  const userId = session?.id || localStorage.getItem('student_id') || 6;
  const studentName = session?.name || localStorage.getItem('student_name') || 'Anak Hebat';

  // --- STATE DATA PROFILE ---
  const [loading, setLoading] = useState(!session?.isGuest);
  const [sudahCheckIn, setSudahCheckIn] = useState(false); 
  
  // State untuk menampung detail jurnal hari ini yang diambil langsung dari database
  const [jurnalHariIni, setJurnalHariIni] = useState({
    materi: '-',
    feeling: '😐',
    difficulty: '-'
  });

  const [stats, setStats] = useState({
    rata_skor: 0,
    total_misi_selesai: 0,
    lencana_terbuka: []
  });

  // 🟢 PERBAIKAN 1: Sinkronisasi 15 Judul Topik Resmi Sesuai Dataset 'dataclean_revisi.csv'
  const goalLabels = { 
    'adaptasi makhluk hidup': '🐾 Adaptasi Makhluk Hidup',
    adaptasi_makhluk_hidup: '🐾 Adaptasi Makhluk Hidup',
    'peredaran darah': '❤️ Peredaran Darah Manusia',
    peredaran_darah: '❤️ Peredaran Darah Manusia',
    'peristiwa alam': '🌋 Peristiwa Alam & Dampaknya',
    peristiwa_alam: '🌋 Peristiwa Alam & Dampaknya',
    'sumber daya alam dan kegunaannya': '🌾 Sumber Daya Alam & Kegunaannya',
    sumber_daya_alam: '🌾 Sumber Daya Alam & Kegunaannya',
    'alat pencernaan dan makanan': '🍔 Alat Pencernaan & Makanan',
    alat_pencernaan: '🍔 Alat Pencernaan & Makanan',
    'benda dan sifatnya': '📦 Benda & Sifat-Sifatnya',
    benda_sifatnya: '📦 Benda & Sifat-Sifatnya',
    'bumi dan peristiwa alam': '🪐 Bumi & Peristiwa Alam',
    bumi_peristiwa_alam: '🪐 Bumi & Peristiwa Alam',
    'air': '💧 Air & Siklus Hidrologi',
    'alat tubuh manusia dan hewan': '🦴 Alat Tubuh Manusia & Hewan',
    alat_tubuh_manusia_hewan: '🦴 Alat Tubuh Manusia & Hewan',
    'tumbuhan hijau': '🌿 Tumbuhan Hijau & Fotosintesis',
    tumbuhan_hijau: '🌿 Tumbuhan Hijau & Fotosintesis',
    'gaya, gerak, dan energi': '⚡ Gaya, Gerak, dan Energi',
    gaya_gerak_energi: '⚡ Gaya, Gerak, dan Energi',
    'cahaya dan sifat-sifatnya': '🔦 Cahaya & Sifat-Sifatnya',
    cahaya_sifatnya: '🔦 Cahaya & Sifat-Sifatnya',
    'alat pernapasan manusia dan hewan': '🌬️ Alat Pernapasan Manusia & Hewan',
    alat_pernapasan: '🌬️ Alat Pernapasan Manusia & Hewan',
    'organ tubuh manusia dan hewan': '🧬 Organ Tubuh Manusia & Hewan',
    organ_tubuh_manusia_hewan: '🧬 Organ Tubuh Manusia & Hewan',
    'sistem pernapasan': '🫁 Sistem Pernapasan Manusia',
    sistem_pernapasan: '🫁 Sistem Pernapasan Manusia'
  };

  // 2. FETCH DATA LIVE DARI DATABASE SUPABASE (ANTI TERTUKAR CACHE)
  useEffect(() => {
    if (session?.isGuest) return;

    const ambilDataProfilDanCheckIn = async () => {
      try {
        // 🟢 A. STATUS CHECK-IN (MURNI DARI DATABASE):
        // Memanggil rute backend status untuk mengecek stempel kehadiran user ini hari ini
        const statusRes = await fetch(`http://localhost:5000/api/checkin/status?user_id=${userId}`);
        let dbSudahCheckIn = false;

        if (statusRes.ok) {
          const statusResult = await statusRes.json();
          if (statusResult.success) {
            dbSudahCheckIn = statusResult.sudah_checkin;
            setSudahCheckIn(dbSudahCheckIn);
          }
        }

        // 🟢 B. DETAIL JURNAL (MURNI DARI LIST HISTORY DATABASE):
        // Kita ambil riwayat check-in dari database, lalu cari apakah ada data untuk tanggal hari ini
        const historyRes = await fetch(`http://localhost:5000/api/checkin/history/${userId}`);
        if (historyRes.ok && dbSudahCheckIn) {
          const historyData = await historyRes.json();
          if (Array.isArray(historyData) && historyData.length > 0) {
            // Karena history diurutkan dari yang terbaru, indeks [0] adalah data hari ini!
            const logHariIni = historyData[0];
            setJurnalHariIni({
              materi: goalLabels[logHariIni.materi_dipelajari] || logHariIni.materi_dipelajari || '🌿 Memahami Sains',
              feeling: logHariIni.mood || '😀',
              difficulty: logHariIni.tingkat_kesulitan || '4'
            });
          }
        }

        // C. STATISTIK QUEST KUIS
        const response = await fetch(`http://localhost:5000/api/quests/dashboard?user_id=${userId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const daftarMisi = result.data || [];
            const misiSelesai = daftarMisi.filter(m => m.sudah_selesai);
            const lencanaKoleksi = misiSelesai.map(m => m.lencana_hadiah);

            setStats({
              rata_skor: misiSelesai.length > 0 ? 100 : 0,
              total_misi_selesai: misiSelesai.length,
              lencana_terbuka: lencanaKoleksi
            });
          }
        }

      } catch (error) {
        console.error("❌ Gagal memuat data statistik profil dari database:", error.message);
      } finally {
        setLoading(false);
      }
    };

    ambilDataProfilDanCheckIn();
  }, [userId, session?.isGuest]);

  if (loading) return <div className="text-center mt-20 font-bold text-[#7A8C5C] animate-pulse">Membuka Berkas Ilmuwan... 🔬</div>;

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[#F5F0E8] font-['Nunito'] text-[#2C1A0E]">
      <div className="max-w-3xl mx-auto bg-[#FAF7F2] border border-[#D6CFC4] rounded-[40px] p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* 1. KEPALA IDENTITAS USER ANAK */}
        <div className="flex items-center gap-4 pb-5 border-b border-[#D6CFC4]">
          <div className="w-16 h-16 bg-[#7A8C5C] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-md border-2 border-white shrink-0">
            {session?.isGuest ? 'G' : studentName[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#2C1A0E]">
                {session?.isGuest ? 'Siswa Tamu (Guest)' : studentName}
              </h2>
              
              {!session?.isGuest && (
                <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm border transition-colors duration-300 ${
                  sudahCheckIn 
                    ? 'bg-[#E8F0E0] text-[#556B2F] border-[#7A8C5C]/30' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {sudahCheckIn ? '🟢 Sudah Check-In Hari Ini ✨' : '🔴 Belum Check-In Hari Ini 🔔'}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-[#6B5C4E] uppercase tracking-wider mt-0.5">
              Peran: {session?.isGuest ? 'Akses Terbatas' : 'Ilmuwan Cilik 👤'}
            </p>
          </div>
        </div>

        {/* 2. DOCK INFORMASI INTEGRASI CHECK-IN ANAK */}
        <div className="p-5 bg-white border border-[#D6CFC4] rounded-3xl shadow-inner space-y-3">
          <h3 className="text-xs font-black text-[#6B5C4E] uppercase tracking-wider flex items-center gap-1">
            📋 Ringkasan Jurnal Belajar Hari Ini (Live Supabase)
          </h3>
          
          {sudahCheckIn ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-bold text-[#2C1A0E] pt-1">
              <div className="p-3 bg-[#FAF7F2] border rounded-xl">
                <span className="text-[#6B5C4E] text-[10px] block uppercase mb-0.5">Target Materi</span>
                {jurnalHariIni.materi}
              </div>
              <div className="p-3 bg-[#FAF7F2] border rounded-xl text-center">
                <span className="text-[#6B5C4E] text-[10px] block uppercase mb-0.5">Kondisi Perasaan</span>
                <span className="text-2xl block mt-1">{jurnalHariIni.feeling}</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] border rounded-xl text-center">
                <span className="text-[#6B5C4E] text-[10px] block uppercase mb-0.5">Tingkat Kesulitan</span>
                <span className="text-xl font-black text-[#7A8C5C] block mt-1">
                  {jurnalHariIni.difficulty !== '-' ? `${jurnalHariIni.difficulty} / 7` : '4 / 7'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-600 font-bold bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 leading-relaxed animate-fadeIn">
              ⚠️ Kamu belum mengisi jurnal check-in harian di Beranda Utama untuk hari ini. Yuk, lakukan check-in terlebih dahulu untuk mengaktifkan jurnal barumu! 📝
            </div>
          )}
        </div>

        {/* 3. KONTEN LEVEL & KEPATUHAN LENCANA ANAK */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-black text-[#6B5C4E]">
              <span>Tingkat Kemajuan Ilmuwan (Level {stats.total_misi_selesai + 1})</span>
              <span>{stats.total_misi_selesai * 33}% Menuju Level Berikutnya</span>
            </div>
            <div className="w-full bg-[#D6CFC4]/40 h-3 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#7A8C5C] to-[#9eb07a] rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(stats.total_misi_selesai * 33, 100)}%` }} 
              />
            </div>
          </div>

          <div className="pt-2">
            <h3 className="font-extrabold text-sm text-[#2C1A0E] mb-3 uppercase tracking-wide">🏅 Lemari Lencana Kamu</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className={`bg-white border border-[#D6CFC4] p-4 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center hover:scale-[1.02] transition-all duration-300 ${stats.lencana_terbuka.includes("Solar Master") ? "opacity-100 grayscale-0" : "opacity-30 grayscale select-none"}`}>
                <span className="text-3xl mb-1">☀️</span>
                <h4 className="font-black text-[11px] text-[#2C1A0E] tracking-tight">Solar Master</h4>
                <p className="text-[9px] text-[#6B5C4E] font-bold">
                  {stats.lencana_terbuka.includes("Solar Master") ? "Materi Tata Surya" : "Belum Terkunci"}
                </p>
              </div>

              <div className={`bg-white border border-[#D6CFC4] p-4 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center hover:scale-[1.02] transition-all duration-300 ${stats.lencana_terbuka.includes("Botani Cilik") ? "opacity-100 grayscale-0" : "opacity-30 grayscale select-none"}`}>
                <span className="text-3xl mb-1">🌱</span>
                <h4 className="font-black text-[11px] text-[#2C1A0E] tracking-tight">Botani Cilik</h4>
                <p className="text-[9px] text-[#6B5C4E] font-bold">
                  {stats.lencana_terbuka.includes("Botani Cilik") ? "Tumbuhan Hijau" : "Belum Terkunci"}
                </p>
              </div>

              <div className={`bg-white border border-[#D6CFC4] p-4 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center hover:scale-[1.02] transition-all duration-300 ${stats.lencana_terbuka.includes("Eco Warrior") ? "opacity-100 grayscale-0" : "opacity-30 grayscale select-none"}`}>
                <span className="text-3xl mb-1">🌍</span>
                <h4 className="font-black text-[11px] text-[#2C1A0E] tracking-tight">Eco Warrior</h4>
                <p className="text-[9px] text-[#6B5C4E] font-bold">
                  {stats.lencana_terbuka.includes("Eco Warrior") ? "Lingkungan Hidup" : "Belum Terkunci"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {session?.isGuest && (
          <div className="p-3.5 bg-[#FDE8DC] border border-[#C4621D]/20 text-[#C4621D] text-xs font-bold rounded-xl text-center shadow-inner">
            🔒 Riwayat kuis permanen dinonaktifkan di mode Guest. Yuk, daftar akun untuk simpan lencanamu!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;