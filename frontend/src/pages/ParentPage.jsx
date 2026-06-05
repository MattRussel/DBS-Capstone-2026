// src/pages/ParentPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParentPage = () => {
  // --- STATE MANAGEMENT DARI DATABASE & LOCAL ---
  const [checkInLogs, setCheckInLogs] = useState([]);
  const [toxicWarnings, setToxicWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Mengambil data profil anak dari localStorage hasil pendaftaran/masuk (Default ke ID 6)
  const studentId = localStorage.getItem('student_id') || 6;
  const studentName = localStorage.getItem('student_name') || 'Anak';
  
  // 📡 CONFIG URL API BACKEND EXPRESS KELOMPOKMU
  const BACKEND_API_URL = 'http://localhost:5000';

  // Menyederhanakan label materi pelacak jurnal kehadiran harian
  const goalLabels = { 
    'adaptasi makhluk hidup': '🐾 Adaptasi Makhluk Hidup',
    'adaptasi_makhluk_hidup': '🐾 Adaptasi Makhluk Hidup',
    'peredaran darah': '❤️ Peredaran Darah Manusia',
    'peredaran_darah': '❤️ Peredaran Darah Manusia',
    'peristiwa alam': '🌋 Peristiwa Alam & Dampaknya',
    'peristiwa_alam': '🌋 Peristiwa Alam & Dampaknya',
    'sumber daya alam dan kegunaannya': '🌾 Sumber Daya Alam & Kegunaannya',
    'sumber_daya_alam_dan_kegunaannya': '🌾 Sumber Daya Alam & Kegunaannya',
    'sumber_daya_alam': '🌾 Sumber Daya Alam & Kegunaannya',
    'alat pencernaan dan makanan': '🍔 Alat Pencernaan & Makanan',
    'alat_pencernaan_dan_makanan': '🍔 Alat Pencernaan & Makanan',
    'alat_pencernaan': '🍔 Alat Pencernaan & Makanan',
    'benda dan sifatnya': '📦 Benda & Sifat-Sifatnya',
    'benda_dan_sifatnya': '📦 Benda & Sifat-Sifatnya',
    'benda_sifatnya': '📦 Benda & Sifat-Sifatnya',
    'bumi dan peristiwa alam': '🪐 Bumi & Peristiwa Alam',
    'bumi_dan_peristiwa_alam': '🪐 Bumi & Peristiwa Alam',
    'bumi_peristiwa_alam': '🪐 Bumi & Peristiwa Alam',
    'air': '💧 Air & Siklus Hidrologi',
    'alat tubuh manusia dan hewan': '🦴 Alat Tubuh Manusia & Hewan',
    'alat_body_manusia_dan_hewan': '🦴 Alat Tubuh Manusia & Hewan',
    'tumbuhan hijau': '🌿 Tumbuhan Hijau & Fotosintesis',
    'tumbuhan_hijau': '🌿 Tumbuhan Hijau & Fotosintesis',
    'gaya, gerak, dan energi': '⚡ Gaya, Gerak, dan Energi',
    'gaya_gerak_energi': '⚡ Gaya, Gerak, dan Energi',
    'cahaya dan sifat-sifatnya': '🔦 Cahaya & Sifat-Sifatnya',
    'cahaya_sifatnya': '🔦 Cahaya & Sifat-Sifatnya',
    'alat pernapasan manusia dan hewan': '🌬️ Alat Pernapasan Manusia & Hewan',
    'alat_pernapasan': '🌬️ Alat Pernapasan Manusia & Hewan',
    'organ tubuh manusia dan hewan': '🧬 Organ Tubuh Manusia & Hewan',
    'sistem pernapasan': '𫠓 Sistem Pernapasan Manusia',
    'sistem_pernapasan': '𫠓 Sistem Pernapasan Manusia'
  };

  useEffect(() => {
    const fetchParentDashboardData = async () => {
      setLoading(true);
      setErrorMsg('');
      
      try {
        console.log(`📡 Menarik data Ruang Pantau dari Supabase untuk User ID: ${studentId}...`);

        // 1. Ambil Data Kehadiran Utama (daily_checkins) dari Database Supabase
        let dbCheckIns = [];
        try {
          const checkInRes = await axios.get(`${BACKEND_API_URL}/api/checkin/history/${studentId}`);
          if (Array.isArray(checkInRes.data)) {
            dbCheckIns = checkInRes.data;
          }
        } catch (e) {
          console.warn("⏳ Jalur API database checkin kosong atau server terputus.");
        }

        const lokalTanggal = localStorage.getItem(`sainscerdas_tanggal_checkin_user_${studentId}`);
        const lokalGoal = localStorage.getItem(`sainscerdas_goal_user_${studentId}`) || 'adaptasi makhluk hidup';
        const lokalFeeling = localStorage.getItem(`sainscerdas_feeling_user_${studentId}`) || '😐';
        const lokalDifficulty = localStorage.getItem(`sainscerdas_difficulty_user_${studentId}`) || '5';
        const lokalStreak = localStorage.getItem(`sainscerdas_streak_user_${studentId}`) || 1;

        let mappedLogs = dbCheckIns.map(log => {
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

        const apakahHariIniSudahAdaDiDB = mappedLogs.some(log => log.tanggal_checkin === lokalTanggal);

        if (lokalTanggal && !apakahHariIniSudahAdaDiDB) {
          const dataHariIni = {
            id: 'TEMP-TODAY',
            tanggal_checkin: lokalTanggal,
            streak_count: lokalStreak,
            materi_dipelajari: goalLabels[lokalGoal] || '🌿 Materi Sains Utama',
            kondisi_perasaan: lokalFeeling,
            tingkat_kesulitan: lokalDifficulty
          };
          mappedLogs = [dataHariIni, ...mappedLogs];
        }

        setCheckInLogs(mappedLogs);

        // 2. 🟢 AMBIL LANGSUNG DATA LOG PELANGGARAN HASIL COCOK DATASET KATA KASAR
        try {
          const chatbotRes = await axios.get(`${BACKEND_API_URL}/api/chatbot/history/${studentId}`);
          if (Array.isArray(chatbotRes.data)) {
            console.log("📡 Sinkronisasi otomatis data kecocokan kata kasar dari database...");
            
            // Menyaring data murni pelanggaran berdasarkan penanda topik / konteks moderasi dari Express
            const filteredWarnings = chatbotRes.data.filter(chat => {
              const konteksTeks = String(chat.konteks || '').toLowerCase();
              const topikTeks = String(chat.topik || '').toLowerCase();
              const jenisTeks = String(chat.jenis_pertanyaan || '').toLowerCase();
              const responTeks = String(chat.bot_response || chat.bot_reply_text || '').toLowerCase();
              
              return (
                konteksTeks.includes("peringatan") || 
                konteksTeks.includes("kasar") || 
                konteksTeks.includes("warning") ||
                konteksTeks.includes("moderasi") ||
                topikTeks.includes("peringatan") ||
                topikTeks.includes("moderasi") ||
                jenisTeks.includes("moderasi") ||
                responTeks.includes("⚠️") ||
                responTeks.includes("sopan") ||
                responTeks.includes("kata-katanya") ||
                responTeks.includes("istirahat dulu")
              );
            });
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-[#D6CFC4] p-6 rounded-[30px] shadow-sm flex items-center gap-4">
          <span className="text-4xl">📅</span>
          <div>
            <h4 className="text-xs font-black text-[#6B5C4E] uppercase tracking-wider">Total Check-In</h4>
            <p className="text-2xl font-black text-[#2C1A0E] mt-0.5">{checkInLogs.length} Hari</p>
          </div>
        </div>

        <div className={`border p-6 rounded-[30px] shadow-sm flex items-center gap-4 transition-all flex-1 min-w-0 ${totalStrikes > 0 ? 'bg-[#FDE8DC] border-red-300 animate-pulse' : 'bg-white border-[#D6CFC4]'}`}>
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl border border-amber-100">
            ⚠️
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-[#6B5C4E] uppercase tracking-wider mb-0.5">Peringatan Kata Kotor</h4>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={`text-2xl sm:text-3xl font-black leading-none ${totalStrikes > 0 ? 'text-red-600' : 'text-[#2C1A0E]'}`}>
                {totalStrikes}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#6B5C4E] truncate">
                Pelanggaran Terdeteksi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- BLOK DETEKSI KATA KOTOR --- */}
      <div className="bg-white border border-[#D6CFC4] p-6 rounded-[35px] shadow-sm flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
          <h3 className="font-black text-lg text-[#2C1A0E] flex items-center gap-2"><span>🛡️</span> Deteksi Kata Tidak Sopan</h3>
          <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">chatbot_history</span>
        </div>

        <div className="overflow-y-auto space-y-3 max-h-[300px] pr-2 scrollbar-thin">
          {toxicWarnings.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <span className="text-3xl">🌱</span>
              <p className="text-xs font-bold text-[#6B5C4E] px-4 leading-relaxed">Hebat! Belum ada catatan kata tidak sopan yang diketik anak di laboratorium sains Profesor. Belajar tetap aman! ✨</p>
            </div>
          ) : (
            toxicWarnings.map((warning) => {
              const waktuMentah = warning.created_at || warning.timestamp || warning.tanggal || warning.created_time;
              
              const waktuFinal = waktuMentah 
                ? new Date(waktuMentah).toLocaleString('id-ID', { 
                    day: 'numeric', 
                    month: 'numeric', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) 
                : new Date().toLocaleString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

              const balasanFinal = warning.bot_response || warning.bot_reply_text || warning.answer || 'Yuk gunakan bahasa yang lebih sopan ya 😊';

              return (
                <div key={warning.id || Math.random()} className="p-4 bg-[#FAF7F2] border border-red-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#6B5C4E] font-black">
                      📅 {waktuFinal} WIB
                    </span>
                    <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-md border border-red-200">Terdeteksi</span>
                  </div>
                  {/* Menampilkan secara otomatis teks kata kotor apa pun hasil tangkapan CSV tim AI */}
                  <p className="text-sm font-bold text-[#2C1A0E]">Input anak: <span className="bg-red-600 text-white px-2 py-0.5 rounded-md font-mono">"{warning.message}"</span></p>
                  <p className="text-xs font-semibold text-[#6B5C4E] italic bg-white/60 p-2 rounded-xl border border-[#D6CFC4]/40">📢 Respon Peringatan: "{balasanFinal}"</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- 📅 TABEL KEHADIRAN DAILY CHECK-IN --- */}
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