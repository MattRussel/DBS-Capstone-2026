import * as checkinService from '../services/checkinService.js';

export const handleCheckIn = async (req, res) => {
  try {
    // 🟢 PERBAIKAN 1: Tangkap seluruh properti jurnal interaktif dari req.body yang dikirim oleh React
    const { user_id, materi_dipelajari, mood, tingkat_kesulitan } = req.body; 

    // Validasi data utama wajib terisi agar tidak memicu error NULL di database Supabase
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'ID Pengguna (student_id) tidak terbaca.' });
    }

    if (!materi_dipelajari || !mood || !tingkat_kesulitan) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gagal! Materi yang dipelajari, kondisi perasaan (mood), dan tingkat kesulitan wajib diisi.' 
      });
    }

    // 🟢 PERBAIKAN 2: Teruskan semua parameter jurnal baru ini ke dalam checkinService layer
    const result = await checkinService.executeDailyCheckIn(user_id, materi_dipelajari, mood, tingkat_kesulitan);
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 🌟 FUNGSI BARU: Mengecek apakah user sudah check-in hari ini (Untuk konsumsi Profile Page & Beranda)
export const getStatusCheckIn = async (req, res) => {
  try {
    // Karena ini rekues GET, ID user dibaca dari URL query params (?user_id=30001)
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID Pengguna tidak terbaca.' });
    }

    // Panggil fungsi pengecekan di service layer (mengecek stempel tanggal hari ini di DB)
    const sudahAbsen = await checkinService.checkIfAlreadyCheckedIn(userId); 

    return res.status(200).json({ 
      success: true, 
      sudah_checkin: sudahAbsen // Mengembalikan nilai true atau false murni dari database
    });

  } catch (error) {
    console.error("❌ Eror internal checkin status:", error.message);
    return res.status(500).json({ success: false, message: 'Gagal memeriksa status absensi di database.' });
  }
};