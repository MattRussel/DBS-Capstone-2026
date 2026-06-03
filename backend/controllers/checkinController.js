// backend/controllers/checkinController.js
import * as checkinService from '../services/checkinService.js';

export const handleCheckIn = async (req, res) => {
  try {
    const { user_id, materi_dipelajari, mood, tingkat_kesulitan } = req.body; 

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'ID Pengguna (student_id) tidak terbaca.' });
    }

    if (!materi_dipelajari || !mood || !tingkat_kesulitan) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gagal! Materi yang dipelajari, kondisi perasaan (mood), dan tingkat kesulitan wajib diisi.' 
      });
    }

    const result = await checkinService.executeDailyCheckIn(user_id, materi_dipelajari, mood, tingkat_kesulitan);
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getStatusCheckIn = async (req, res) => {
  try {
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID Pengguna tidak terbaca.' });
    }

    const sudahAbsen = await checkinService.checkIfAlreadyCheckedIn(userId); 

    return res.status(200).json({ 
      success: true, 
      sudah_checkin: sudahAbsen 
    });

  } catch (error) {
    console.error("❌ Eror internal checkin status:", error.message);
    return res.status(500).json({ success: false, message: 'Gagal memeriksa status absensi di database.' });
  }
};

// 🌟 FUNGSI BARU PENYELAMAT LIST ORANG TUA: Menarik seluruh riwayat check-in anak dari Supabase
export const getCheckInHistory = async (req, res) => {
  try {
    // Membaca ID Student dari parameter URL (:studentId) sesuai fetch di ParentPage
    const studentId = req.params.studentId;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'ID Pelajar wajib dicantumkan.' });
    }

    // Tembak fungsi penarik history di service layer
    // (Pastikan fungsi getHistoryByUserId / sejenisnya sudah ada di checkinService.js kalian)
    const historyData = await checkinService.getHistoryByUserId(studentId);

    // Kirimkan array murni langsung ke frontend agar dibaca sempurna oleh Axios
    return res.status(200).json(historyData);

  } catch (error) {
    console.error("❌ Eror internal mengambil list history checkin:", error.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil riwayat jurnal di database.' });
  }
};