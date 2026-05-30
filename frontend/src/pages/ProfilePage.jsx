import React, { useState, useEffect } from 'react';

const ProfilePage = ({ session }) => {
  const userId = localStorage.getItem('student_id') || 1;

  
  // 1. VALIDASI PERPUTARAN HARI BERBASIS FRONTEND LOCAL
  
  const tanggalHariIni = new Date().toLocaleDateString('sv-SE');
  const tanggalTerakhirCheckIn = localStorage.getItem('tanggal_terakhir_checkin');

  // Evaluasi kecocokan hari untuk mereset tampilan jurnal secara otomatis
  const validHariIni = tanggalTerakhirCheckIn === tanggalHariIni;

  const currentGoal = validHariIni ? localStorage.getItem('user_daily_goal') : null;
  const savedFeeling = validHariIni ? localStorage.getItem('user_feeling') : '😐';
  const savedDifficulty = validHariIni ? localStorage.getItem('user_difficulty') : '-';

  const goalLabels = { 
    ekosistem: '🌿 Memahami Ekosistem Sawah & Hutan', 
    fisika: '⚡ Eksperimen Gaya Fisika', 
    tatasurya: '🪐 Mengenal Anggota Tata Surya', 
    anatomi: '🦴 Belajar Anatomi Tubuh Manusia' 
  };

  // --- STATE DATA PROFILE ---
  const [loading, setLoading] = useState(!session.isGuest);
  const [sudahCheckIn, setSudahCheckIn] = useState(false); 
  const [stats, setStats] = useState({
    rata_skor: 0,
    total_misi_selesai: 0,
    lencana_terbuka: []
  });

  
  // 2. FETCH DATA LIVE KUIS DARI TIDB CLOUD
  
  useEffect(() => {
    if (session.isGuest) return;

    const ambilDataProfilDanCheckIn = async () => {
      try {
        // Ambil data statistik dashboard kuis yang sudah terdaftar aman di backend kamu
        const response = await fetch(`http://localhost:5000/api/quests/dashboard?user_id=${userId}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const daftarMisi = result.data || [];
            const misiSelesai = daftarMisi.filter(m => m.sudah_selesai);
            const lencanaKoleksi = misiSelesai.map(m => m.lencana_hadiah);
            const kalkulasiSkor = misiSelesai.length > 0 ? 100 : 0; 

            setStats({
              rata_skor: kalkulasiSkor,
              total_misi_selesai: misiSelesai.length,
              lencana_terbuka: lencanaKoleksi
            });
          }
        }

        // KUNCI AMAN: Mengikat status check-in ke validasi tanggal lokal laptop anak
        setSudahCheckIn(validHariIni);

      } catch (error) {
        console.error("❌ Gagal memuat data statistik profil:", error.message);
        setSudahCheckIn(validHariIni);
      } finally {
        setLoading(false);
      }
    };

    ambilDataProfilDanCheckIn();
  }, [userId, session.isGuest, validHariIni]);

  if (loading) return <div className="text-center mt-20 font-bold text-[#7A8C5C] animate-pulse">Membuka Berkas Ilmuwan... 🔬</div>;

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[#F5F0E8] font-['Nunito'] text-[#2C1A0E]">
      <div className="max-w-3xl mx-auto bg-[#FAF7F2] border border-[#D6CFC4] rounded-[40px] p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* 1. KEPALA IDENTITAS USER */}
        <div className="flex items-center gap-4 pb-5 border-b border-[#D6CFC4]">
          <div className="w-16 h-16 bg-[#7A8C5C] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-md border-2 border-white shrink-0">
            {session.isGuest ? 'G' : (session.name ? session.name[0].toUpperCase() : 'U')}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#2C1A0E]">
                {session.isGuest ? 'Siswa Tamu (Guest)' : (session.name || 'Siswa Cerdas')}
              </h2>
              
              {!session.isGuest && (
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
              Peran: {session.isGuest ? 'Akses Terbatas' : `Akun ${session.role || 'anak'}`}
            </p>
          </div>
        </div>

        {/* 2. DOCK INFORMASI INTEGRASI CHECK-IN */}
        <div className="p-5 bg-white border border-[#D6CFC4] rounded-3xl shadow-inner space-y-3">
          <h3 className="text-xs font-black text-[#6B5C4E] uppercase tracking-wider flex items-center gap-1">
            📋 Ringkasan Jurnal Belajar Hari Ini
          </h3>
          
          {sudahCheckIn ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-bold text-[#2C1A0E] pt-1">
              <div className="p-3 bg-[#FAF7F2] border rounded-xl">
                <span className="text-[#6B5C4E] text-[10px] block uppercase mb-0.5">Target Materi</span>
                {goalLabels[currentGoal] || '🌿 Memahami Ekosistem Sawah & Hutan'}
              </div>
              <div className="p-3 bg-[#FAF7F2] border rounded-xl text-center">
                <span className="text-[#6B5C4E] text-[10px] block uppercase mb-0.5">Kondisi Perasaan</span>
                <span className="text-2xl block mt-1">{savedFeeling}</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] border rounded-xl text-center">
                <span className="text-[#6B5C4E] text-[10px] block uppercase mb-0.5">Tingkat Kesulitan</span>
                <span className="text-xl font-black text-[#7A8C5C] block mt-1">
                  {savedDifficulty !== '-' ? `${savedDifficulty} / 7` : '4 / 7'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-600 font-bold bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 leading-relaxed">
              ⚠️ Kamu belum mengisi jurnal check-in harian di Beranda Utama untuk hari ini. Yuk, lakukan check-in terlebih dahulu untuk mengaktifkan jurnal barumu! 📝
            </div>
          )}
        </div>

        {/* 3. KONTEN TAMPILAN ADAPTIF BERDASARKAN PERAN */}
        {session.role === 'orangtua' ? (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-[#2C1A0E] uppercase tracking-wide">📈 Ruang Pantau Wali Murid</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-[#D6CFC4] rounded-2xl text-center shadow-sm">
                <span className="text-2xl">📝</span>
                <h4 className="text-[11px] font-bold text-[#6B5C4E] uppercase tracking-wider mt-1">Rata-rata Kuis Anak</h4>
                <div className="text-3xl font-black text-[#7A8C5C] mt-1">
                  {stats.total_misi_selesai > 0 ? `${stats.rata_skor} / 100` : 'Belum Ada Kuis'}
                </div>
              </div>
              <div className="p-5 bg-white border border-[#D6CFC4] rounded-2xl text-center shadow-sm">
                <span className="text-2xl">🏅</span>
                <h4 className="text-[11px] font-bold text-[#6B5C4E] uppercase tracking-wider mt-1">Misi Berhasil Diselesaikan</h4>
                <div className="text-3xl font-black text-[#2C1A0E] mt-1">{stats.total_misi_selesai} Materi</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Indikator Bar Pengalaman Level Up */}
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

            {/* Lemari Koleksi Medali/Lencana */}
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
        )}

        {/* Info Tambahan Mode Guest */}
        {session.isGuest && (
          <div className="p-3.5 bg-[#FDE8DC] border border-[#C4621D]/20 text-[#C4621D] text-xs font-bold rounded-xl text-center shadow-inner">
            🔒 Riwayat kuis permanen dinonaktifkan di mode Guest. Yuk, daftar akun untuk simpan lencanamu!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;