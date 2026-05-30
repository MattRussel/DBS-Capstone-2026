import * as checkinService from '../services/checkinService.js';

export const handleCheckIn = async (req, res) => {
  try {
    const userId = req.body.user_id; 
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID Pengguna (student_id) tidak terbaca.' });
    }
    const result = await checkinService.executeDailyCheckIn(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 🌟 FUNGSI BARU: Mengecek apakah user sudah check-in hari ini (Untuk konsumsi Profile Page)
export const getStatusCheckIn = async (req, res) => {
  try {
    // Karena ini rekues GET, ID user dibaca dari URL query params (?user_id=30001)
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID Pengguna tidak terbaca.' });
    }

    // Panggil fungsi pengecekan di service layer (atau langsung hit pool database)
    // Di sini kita asumsikan service layer kamu punya fungsi verifikasi tanggal
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