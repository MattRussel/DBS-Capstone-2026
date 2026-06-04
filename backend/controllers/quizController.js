// backend/controllers/quizController.js
// backend/controllers/quizController.js
import * as quizService from '../services/quizService.js';

export const getNewQuizQuestions = async (req, res) => {
  try {
    const { topik } = req.body;

    if (!topik) {
      return res.status(400).json({ 
        success: false, 
        message: "Parameter topik wajib dilampirkan, Ilmuwan Cilik!" 
      });
    }

    console.log(`🎲 [Quiz Controller] Menembak generator kuis lokal untuk topik: ${topik}`);
    
    // 1. Ambil data mentah dari quizService.js
    const quizData = await quizService.generateQuizSOAL(topik);

    // 2. Ambil isi array soalnya (baik dari properti .content maupun .quiz_questions)
    const arraySoalMurni = quizData.content || quizData.quiz_questions || quizData.data || [];

    console.log("📦 [DEBUG CONTROLLER] Jumlah soal yang berhasil diekstrak:", arraySoalMurni.length);

    // 3. 🟢 SINKRONISASI MUTLAK FRONTEND:
    // Bungkus ke dalam properti 'data' agar lolos validasi Array.isArray(result.data) di QuizPage.jsx!
    return res.status(200).json({
      success: true,
      type: "QUIZ_DATA",
      data: arraySoalMurni
    });

  } catch (error) {
    console.error("❌ [Quiz Controller Error] Gagal di getNewQuizQuestions:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Waduh, Profesor gagal meracik lembar kuis sains otomatis harian." 
    });
  }
};

/**
 * 💾 Menangani setoran nilai kuis akhir anak (Live Supabase Cloud)
 * URL target dari Router: POST /api/quiz/score
 */
export const saveQuizScoreResult = async (req, res) => {
  try {
    const { user_id, topik_ipa, skor_total, jawaban_benar } = req.body;

    if (user_id === undefined || !topik_ipa || skor_total === undefined || jawaban_benar === undefined) {
      return res.status(400).json({ success: false, message: "Data setoran nilai tidak lengkap!" });
    }

    // Mengamankan tipe data parameter sebelum masuk ke kueri repositori Supabase
    const cleanUserId = parseInt(user_id, 10);
    const cleanSkorTotal = parseInt(skor_total, 10);
    const cleanJawabanBenar = parseInt(jawaban_benar, 10);

    if (isNaN(cleanUserId) || isNaN(cleanSkorTotal) || isNaN(cleanJawabanBenar)) {
      return res.status(400).json({ success: false, message: "Format data nilai kuis harus berupa angka murni!" });
    }

    // Meneruskan variabel steril ke service layer
    await quizService.storeUserScore(cleanUserId, topik_ipa, cleanSkorTotal, cleanJawabanBenar);
    
    return res.status(200).json({
      success: true,
      message: "Hore! Skor petualangan sains kamu sukses dicatat di Supabase Cloud! 🚀🏆"
    });

  } catch (error) {
    console.error("❌ Error di saveQuizScoreResult Controller:", error.message);
    return res.status(500).json({ success: false, message: "Gagal menyimpan skor kuis ke database Supabase." });
  }
};

/**
 * 📜 Menangani penarikan riwayat nilai kuis untuk Ruang Pantau Orang Tua
 * URL target dari Router: GET /api/quiz/results/:studentId
 */
export const getQuizResults = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'ID Pelajar wajib dicantumkan.' });
    }

    // Proteksi konversi ID rute parameter GET
    const cleanStudentId = parseInt(studentId, 10);
    if (isNaN(cleanStudentId)) {
      return res.status(400).json({ success: false, message: 'ID Pelajar tidak valid untuk ditarik.' });
    }

    // Mengambil history log nilai dari service layer
    const scores = await quizService.getStudentQuizHistory(cleanStudentId);

    // Mengirimkan array murni langsung agar bisa dipetakan langsung oleh Axios di ParentPage
    return res.status(200).json(scores);
  } catch (error) {
    console.error("❌ [Quiz Controller Error] Gagal fetch data skor kuis:", error.message);
    return res.status(500).json({ success: false, message: 'Gagal memuat evaluasi kuis di database.' });
  }
};