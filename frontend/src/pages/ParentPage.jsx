// src/pages/ParentPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParentPage = () => {
  // --- STATE MANAGEMENT DARI DATABASE & LOCAL ---
  const [checkInLogs, setCheckInLogs] = useState([]);
  const [toxicWarnings, setToxicWarnings] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Mengambil data profil anak dari localStorage hasil login
  const studentId = localStorage.getItem('student_id') || 1;
  const studentName = localStorage.getItem('student_name') || 'Anak';
  
  // 📡 CONFIG URL API BACKEND EXPRESS KELOMPOKMU
  const BACKEND_API_URL = 'http://localhost:5000';

  // 🟢 PERBAIKAN 1: Menyelaraskan Pemetaan 15 Topik Resmi Sesuai TopikPage & CheckInPage
  const goalLabels = { 
    adaptasi_makhluk_hidup: '🐾 Adaptasi Makhluk Hidup',
    peredaran_darah: '❤️ Peredaran Darah Manusia',
    peristiwa_alam: '🌋 Peristiwa Alam & Dampaknya',
    sumber_daya_alam: '🌾 Sumber Daya Alam & Kegunaannya',
    alat_pencernaan: '🍔 Alat Pencernaan & Makanan',
    benda_sifatnya: '📦 Benda & Sifat-Sifatnya',
    bumi_peristiwa_alam: '🪐 Bumi & Peristiwa Alam',
    air: '💧 Air & Siklus Hidrologi',
    alat_tubuh_manusia_hewan: '🦴 Alat Tubuh Manusia & Hewan',
    tumbuhan_hijau: '🌿 Tumbuhan Hijau & Fotosintesis',
    gaya_gerak_energi: '⚡ Gaya, Gerak, dan Energi',
    cahaya_sifatnya: '🔦 Cahaya & Sifat-Sifatnya',
    alat_pernapasan: '🌬️ Alat Pernapasan Manusia & Hewan',
    organ_tubuh_manusia_hewan: '🧬 Organ Tubuh Manusia & Hewan',
    sistem_pernapasan: '🫁 Sistem Pernapasan Manusia'
  };

  useEffect(() => {
    const fetchParentDashboardData = async () => {
      setLoading(true);
      setErrorMsg('');
      
      try {
        console.log(`📡 Menarik data Ruang Pantau dari Supabase untuk User ID: ${studentId}...`);

        // 🟢 PERBAIKAN 2: Alur Ambil Data Kehadiran Utama dari Database Supabase (Anti-Loss)
        let dbCheckIns = [];
        try {
          const checkInRes = await axios.get(`${BACKEND_API_URL}/api/checkin/history/${studentId}`);
          if (Array.isArray(checkInRes.data)) {
            dbCheckIns = checkInRes.data;
          }
        } catch (e) {
          console.warn("⏳ Jalur API database kosong atau server terputus.");
        }

        // Ambil penanda lokal untuk deteksi hari ini
        const lokalTanggal = localStorage.getItem('tanggal_terakhir_checkin');
        const lokalGoal = localStorage.getItem('user_daily_goal') || 'adaptasi_makhluk_hidup';
        const lokalFeeling = localStorage.getItem('user_feeling') || '😐';
        const lokalDifficulty = localStorage.getItem('user_difficulty') || '5';

        // Petakan data murni Supabase. Jika kolom bernilai kosong, berikan fallback teks yang aman
        let mappedLogs = dbCheckIns.map(log => {
          // Cari tahu apakah properti berisi ID mentah atau teks panjang
          const isiMateri = log.materi_dipelajari || '';
          const namaMateriFinal = goalLabels[isiMateri] || isiMateri || '🌿 Materi Sains Umum';

          return {
            id: log.id,
            tanggal_checkin: log.tanggal_checkin,
            streak_count: log.streak_count || 1,
            materi_dipelajari: namaMateriFinal,
            kondisi_perasaan: log.mood || '😀',
            tingkat_kesulitan: log.tingkat_kesulitan || '4'
          };
        });

        // Proteksi Tambahan: Jika DB kosong karena lag, tapi lokal mencatat sudah absen hari ini, tampilkan data lokal
        if (mappedLogs.length === 0 && lokalTanggal) {
          mappedLogs = [{
            id: 'TEMP-1',
            tanggal_checkin: lokalTanggal,
            streak_count: localStorage.getItem('streak_count') || 1,
            materi_dipelajari: goalLabels[lokalGoal] || '🌿 Materi Sains Utama',
            kondisi_perasaan: lokalFeeling,
            tingkat_kesulitan: lokalDifficulty
          }];
        }

        setCheckInLogs(mappedLogs);

        // 🟢 2. Ambil Data Hasil Kuis (quiz_scores)
        try {
          const quizRes = await axios.get(`${BACKEND_API_URL}/api/quiz/results/${studentId}`);
          if (Array.isArray(quizRes.data)) {
            setQuizResults(quizRes.data);
          }
        } catch (e) {
          console.warn("⏳ Jalur /api/quiz/results belum siap atau data kosong.");
        }

        // 🟢 3. Ambil Data Chatbot untuk Sensor Kata Kotor (chatbot_history)
        try {
          const chatbotRes = await axios.get(`${BACKEND_API_URL}/api/chatbot/history/${studentId}`);
          if (Array.isArray(chatbotRes.data)) {
            const filteredWarnings = chatbotRes.data.filter(chat => 
              chat.konteks && (
                chat.konteks.toLowerCase().includes("peringatan") || 
                chat.konteks.toLowerCase().includes("kasar") || 
                chat.konteks.toLowerCase().includes("warning")
              )
            );
            setToxicWarnings(filteredWarnings);
          }
        } catch (e) {
          console.warn("⏳ Jalur /api/chatbot/history belum siap atau data kosong.");
        }

      } catch (err) {
        console.error("❌ Gagal memuat data dari database Supabase:", err.message);
        setErrorMsg('Gagal terhubung ke server Node.js. Silakan pastikan server Express kelompokmu sudah dijalankan.');
      } finally {
        setLoading(false);
      }
    };

    fetchParentDashboardData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F0E8] h-full font-['Nunito'] min-h-[60vh]">
        <span className="text-4xl animate-spin">🔬</span>
        <p className="text-sm font-black text-[#2C1A0E] mt-3">Profesor sedang mengunduh berkas laporan dari Supabase...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F0E8] h-full font-['Nunito'] px-6 text-center min-h-[60vh]">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm font-black text-red-600 mt-2">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="mt-4 bg-[#2C1A0E] text-white px-5 py-2.5 rounded-full text-xs font-black shadow-md hover:bg-[#3B2314] transition-all">Coba Lagi</button>
      </div>
    );
  }

  const totalStrikes = toxicWarnings.length;

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-[#F5F0E8] font-['Nunito'] space-y-10 animate-fadeIn h-full">
      
      {/* --- HEADER DASHBOARD --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D6CFC4] pb-5 gap-4 sm:gap-0">
        <div>
          <h2 className="text-3xl font-black text-[#2C1A0E]">📊 Ruang Pantau Orang Tua</h2>
          <p className="text-sm font-bold text-[#6B5C4E] mt-1">Memantau perkembangan riset sains cilik dari peneliti: <b className="text-[#7A8C5C]">{studentName}</b></p>
        </div>
        <div className="bg-[#7A8C5C] text-[#FAF7F2] text-xs font-black px-4 py-2.5 rounded-2xl shadow-sm w-max tracking-wide">
          🟢 Sesi Pemantauan Aktif
        </div>
      </div>

      {/* --- KARTU RINGKASAN UTAMA (KPI CARDS) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#D6CFC4] p-6 rounded-[30px] shadow-sm flex items-center gap-4">
          <span className="text-4xl">📅</span>
          <div>
            <h4 className="text-xs font-black text-[#6B5C4E] uppercase tracking-wider">Total Check-In</h4>
            <p className="text-2xl font-black text-[#2C1A0E] mt-0.5">{checkInLogs.length} Hari</p>
          </div>
        </div>

        <div className={`border p-6 rounded-[30px] shadow-sm flex items-center gap-4 transition-all ${totalStrikes > 0 ? 'bg-[#FDE8DC] border-red-300 animate-pulse' : 'bg-white border-[#D6CFC4]'}`}>
          <span className="text-4xl">⚠️</span>
          <div>
            <h4 className="text-xs font-black text-[#6B5C4E] uppercase tracking-wider">Peringatan Kata Kotor</h4>
            <p className={`text-2xl font-black mt-1 ${totalStrikes > 0 ? 'text-red-600' : 'text-[#2C1A0E]'}`}>{totalStrikes} Pelanggaran</p>
          </div>
        </div>

        <div className="bg-white border border-[#D6CFC4] p-6 rounded-[30px] shadow-sm flex items-center gap-4">
          <span className="text-4xl">🏆</span>
          <div>
            <h4 className="text-xs font-black text-[#6B5C4E] uppercase tracking-wider">Rata-Rata Kuis</h4>
            <p className="text-2xl font-black text-[#7A8C5C] mt-0.5">
              {quizResults.length > 0 
                ? `${(quizResults.reduce((acc, curr) => acc + (curr.skor_total || 0), 0) / quizResults.length).toFixed(1)}%` 
                : '0.0%'}
            </p>
          </div>
        </div>
      </div>

      {/* --- LAYOUT GRID KONTEN UTAMA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 🚨 BLOK A: LOG DETEKSI KATA KOTOR */}
        <div className="bg-white border border-[#D6CFC4] p-6 rounded-[35px] shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
            <h3 className="font-black text-lg text-[#2C1A0E] flex items-center gap-2"><span>🛡️</span> Deteksi Kata Tidak Sopan</h3>
            <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">chatbot_history</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-2 scrollbar-thin">
            {toxicWarnings.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <span className="text-3xl">🌱</span>
                <p className="text-xs font-bold text-[#6B5C4E] px-4 leading-relaxed">Hebat! Belum ada catatan kata tidak sopan yang diketik anak di laboratorium sains Profesor. Belajar tetap aman! ✨</p>
              </div>
            ) : (
              toxicWarnings.map((warning) => (
                <div key={warning.id} className="p-4 bg-[#FAF7F2] border border-red-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#6B5C4E] font-black">
                      {warning.created_at ? new Date(warning.created_at).toLocaleString('id-ID') : 'Waktu tidak tercatat'}
                    </span>
                    <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-md border border-red-200">Terdeteksi</span>
                  </div>
                  <p className="text-sm font-bold text-[#2C1A0E]">Input anak: <span className="bg-red-600 text-white px-2 py-0.5 rounded-md font-mono">"{warning.message}"</span></p>
                  <p className="text-xs font-semibold text-[#6B5C4E] italic bg-white/60 p-2 rounded-xl border border-[#D6CFC4]/40">📢 Respon Peringatan: "{warning.bot_response}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🎯 BLOK B: LEMBAR NILAI KUIS SAINS */}
        <div className="bg-white border border-[#D6CFC4] p-6 rounded-[35px] shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
            <h3 className="font-black text-lg text-[#2C1A0E] flex items-center gap-2"><span>🎯</span> Evaluasi Skor Kuis Mandiri</h3>
            <span className="text-[10px] bg-[#7A8C5C] text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">quiz_scores</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-2 scrollbar-thin">
            {quizResults.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <span className="text-3xl">🎯</span>
                <p className="text-xs font-bold text-[#6B5C4E] px-4 leading-relaxed">Anak belum menyelesaikan kuis sains mandiri Profesor. Yuk ajak anak menguji kemampuannya di menu Misi Kuis! 🚀</p>
              </div>
            ) : (
              quizResults.map((quiz) => (
                <div key={quiz.id} className="p-4 bg-[#FAF7F2] border border-[#D6CFC4] rounded-2xl flex items-center justify-between gap-2 shadow-xs hover:bg-white transition-colors duration-150">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-[#2C1A0E]">{quiz.topik_ipa || 'Materi Sains'}</p>
                    <p className="text-[11px] font-bold text-[#6B5C4E]">
                      {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString('id-ID') : ''} • Benar: {quiz.jawaban_benar || '0'} Soal
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      (quiz.skor_total || 0) >= 80 ? 'bg-green-100 text-green-700' : (quiz.skor_total || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      Skor: {quiz.skor_total || 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* --- 📅 BLOK C: TABEL KEHADIRAN (RIWAYAT TANGGAL TETAP UTUH & SINKRON) --- */}
      <div className="bg-white border border-[#D6CFC4] p-6 rounded-[35px] shadow-sm space-y-4 w-full">
        <div className="border-b border-[#EAE4D9] pb-3">
          <h3 className="font-black text-lg text-[#2C1A0E] flex items-center gap-2"><span>📅</span> Catatan Jurnal Detail Kehadiran Harian (daily_checkins)</h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#D6CFC4] shadow-xs">
          <table className="w-full text-left border-collapse bg-[#FAF7F2]/40">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#D6CFC4] text-xs font-black text-[#6B5C4E] uppercase tracking-wider">
                <th className="p-4">Tanggal Masuk Lab</th>
                <th className="p-4">Target Materi Yang Dipelajari</th>
                <th className="p-4 text-center">Perasaan Anak</th>
                <th className="p-4 text-center">Tingkat Kesulitan</th>
                <th className="p-4 text-right">Streak Absen</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-[#2C1A0E] divide-y divide-[#D6CFC4]/40">
              {checkInLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-xs font-bold text-[#6B5C4E]">
                    Belum ada riwayat absensi jurnal belajar harian dari anak Anda.
                  </td>
                </tr>
              ) : (
                checkInLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-white transition-colors duration-100">
                    {/* 🟢 PERBAIKAN 3: Tanggal Per Check-In Tetap Tampil Utuh Berdasarkan Kolom Database */}
                    <td className="p-4 font-black text-xs whitespace-nowrap">
                      {log.tanggal_checkin ? new Date(log.tanggal_checkin).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </td>
                    <td className="p-4 text-xs font-extrabold text-[#2C1A0E]">
                      <span className="bg-[#E8F0E0] text-[#556B2F] px-3 py-1 rounded-xl border border-[#7A8C5C]/20 block w-max">
                        {log.materi_dipelajari}
                      </span>
                    </td>
                    <td className="p-4 text-center text-xl">
                      {log.kondisi_perasaan}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs bg-amber-50 text-amber-800 font-black px-2.5 py-1 rounded-lg border border-amber-200">
                        ⭐ {log.tingkat_kesulitan !== '-' ? `${log.tingkat_kesulitan} / 7` : '4 / 7'}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[#7A8C5C] font-black">{log.streak_count} Hari 🔥</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ParentPage;