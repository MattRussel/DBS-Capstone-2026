// backend/controllers/chatbotController.js
import * as chatbotService from '../services/chatbotService.js';

export const processChatbotRequest = async (req, res) => {
  const { user_id, pesan, topik, isQuizMode } = req.body;

  // 🛡️ VALIDASI PENGUNCI API
  if (!user_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gagal! ID Pengguna wajib dicantumkan.' 
    });
  }

  if (!pesan || !pesan.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gagal! Pesan obrolan tidak boleh kosong.' 
    });
  }

  try {
    // 🟢 PROTEKSI DATA: Paksa ID Pengguna menjadi Integer (Angka Murni) 
    const cleanUserId = parseInt(user_id, 10);

    // Menembak langsung ke service untuk diteruskan ke Python FastAPI RAG / Supabase Cloud
    const hasil = await chatbotService.handleChatOrQuizLogic(cleanUserId, pesan, topik, isQuizMode);
    
    // 🛡️ TAMENG PENYELARAS MODERASI (MODIFICATION LAYER):
    // Jika teks di dalam service mendeteksi simbol '⚠️' dari Python
    if (hasil.data && hasil.data.text && hasil.data.text.includes('⚠️')) {
      console.log("🛡️ [CONTROLLER DETECT] Menyuntikkan teks warning kata kotor ke dalam objek hasil secara aman!");
      
      // Suntikkan properti 'answer' ke dalam objek 'hasil' tanpa merusak struktur aslinya
      hasil.answer = hasil.data.text; 
    } else {
      // Untuk chat normal, pastikan properti 'answer' juga terisi di luar agar frontend tidak bingung
      hasil.answer = hasil.data ? hasil.data.text : hasil.answer;
    }

    // 🟢 TETAP MEMAKAI FORMAT ASLI KELOMPOK (100% AMAN DARI CRASH FRONTEND)
    return res.status(200).json({
      success: true,
      type: hasil.type, 
      data: hasil 
    });

  } catch (error) {
    console.error("❌ [Chatbot Controller Error]:", error.message);

    // 🟢 SENSOR EROR KASAR (ANTI-POPUP DATABASE)
    let pesanErorRamah = "Waduh, Profesor sedang merapikan buku di perpustakaan laboratorium. Coba kirim pesan lagi sebentar ya! 🔬✨";

    if (
      error.message.toLowerCase().includes("fetch") || 
      error.message.toLowerCase().includes("ngrok") || 
      error.message.toLowerCase().includes("failed")
    ) {
      pesanErorRamah = "Wah, pemancar sinyal laboratorium Profesor sedang terganggu angin kencang. Coba tanyakan hal lain atau ulangi sebentar lagi ya, Ilmuwan Hebat! 🛰️🤖";
    }

    return res.status(500).json({ 
      success: false, 
      message: pesanErorRamah 
    });
  }
};

// Tambahkan di bagian paling bawah backend/controllers/chatbotController.js

// 🟢 FUNGSI BARU: Mengambil riwayat chat berdasarkan Student ID/User ID untuk ParentPage
export const getChatHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gagal! Parameter studentId (ID Pelajar) wajib dicantumkan.' 
      });
    }

    // Paksa konversi ke integer agar aman dari bug tipe data relasional
    const cleanStudentId = parseInt(studentId, 10);

    // Panggil layer service untuk mengambil data dari repositori
    const history = await chatbotService.getStudentChatHistory(cleanStudentId);

    // Kembalikan array murni hasil database langsung ke frontend agar dibaca sempurna oleh Axios
    return res.status(200).json(history);

  } catch (error) {
    console.error("❌ [Chatbot Controller Error] Gagal mengambil riwayat chat:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal memuat berkas riwayat obrolan dari database.' 
    });
  }
};