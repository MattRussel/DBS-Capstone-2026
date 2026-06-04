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

  // 🟢 PEMETAAN RESMI: Sinkronisasi 100% dengan karakter teks 'dataclean_revisi.csv' Tim AI
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
    'organ tubuh manusia dan hewan': '🧬 Organ Tubuh Manusia & Hewan',
    organ_tubuh_manusia_hewan: '🧬 Organ Tubuh Manusia & Hewan',
    'sistem pernapasan': '🫁 Sistem Pernapasan Manusia',
    sistem_pernapasan: '🫁 Sistem Pernapasan Manusia'
  };

  // FETCH DATA LIVE DARI DATABASE SUPABASE (ANTI TERTUKAR CACHE)
  useEffect(() => {
    if (session?.isGuest) return;

    const ambilDataProfilDanCheckIn = async () => {
      try {
        // A. STATUS CHECK-IN (MURNI DARI DATABASE PER USER ID)
        const statusRes = await fetch(`http://localhost:5000/api/checkin/status?user_id=${userId}`);
        let dbSudahCheckIn = false;

        if (statusRes.ok) {
          const statusResult = await statusRes.json();
          if (statusResult.success) {
            dbSudahCheckIn = statusResult.sudah_checkin;
            setSudahCheckIn(dbSudahCheckIn);
          }
        }

        // B. DETAIL JURNAL (MURNI DARI LIST HISTORY DATABASE PER USER ID)
        const historyRes = await fetch(`http://localhost:5000/api/checkin/history/${userId}`);
        if (historyRes.ok && dbSudahCheckIn) {
          const historyData = await historyRes.json();
          if (Array.isArray(historyData) && historyData.length > 0) {
            const logHariIni = historyData[0];
            setJurnalHariIni({
              materi: goalLabels[logHariIni.materi_dipelajari] || logHariIni.materi_dipelajari || '🌿 Memahami Sains',
              feeling: logHariIni.mood || '😀',
              difficulty: logHariIni.tingkat_kesulitan || '4'
            });
          }
        }

        // 🟢 C. BERSIHKAN QUESTS EKS-DASHBOARD: Ganti penuh ke rute hasil ujian kuis mandiri
        const quizRes = await fetch(`http://localhost:5000/api/quiz/results/${userId}`);
        if (quizRes.ok) {
          const daftarKuisSelesai = await quizRes.json();
          if (Array.isArray(daftarKuisSelesai)) {
            // Ekstrak nama topik kuis unik yang sudah pernah dikerjakan anak dari database
            const listTopikTerbuka = daftarKuisSelesai.map(q => q.topik_ipa ? q.topik_ipa.toLowerCase().trim() : "");

            setStats({
              rata_skor: daftarKuisSelesai.length > 0 ? 100 : 0,
              total_misi_selesai: daftarKuisSelesai.length,
              lencana_terbuka: listTopikTerbuka
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

        {session?.isGuest && (
          <div className="p-3.5 bg-[#FDE8DC] border border-[#C4621D]/20 text-[#C4621D] text-xs font-bold rounded-xl text-center shadow-inner">
            🔒 Riwayat kuis permanen dinonaktifkan di mode Guest. Yuk, pendaftaran akun untuk simpan lencanamu!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;