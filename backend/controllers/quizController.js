// backend/controllers/quizController.js
import * as quizService from '../services/quizService.js';

// Menangani pengambilan daftar soal kuis baru
export const getNewQuizQuestions = async (req, res) => {
  try {
    const { topik } = req.body;

    if (!topik) {
      return res.status(400).json({ success: false, message: "Parameter topik wajib dilampirkan!" });
    }

    const quizData = await quizService.generateQuizSOAL(topik);
    return res.status(200).json(quizData);

  } catch (error) {
    console.error("❌ Error di getNewQuizQuestions Controller:", error.message);
    return res.status(500).json({ success: false, message: "Gagal memproses pembuatan soal kuis." });
  }
};

// Menangani setoran nilai kuis akhir anak
export const saveQuizScoreResult = async (req, res) => {
  try {
    const { user_id, topik_ipa, skor_total, jawaban_benar } = req.body;

    if (!user_id || !topik_ipa || skor_total === undefined || jawaban_benar === undefined) {
      return res.status(400).json({ success: false, message: "Data setoran nilai tidak lengkap!" });
    }

    await quizService.storeUserScore(user_id, topik_ipa, skor_total, jawaban_benar);
    
    return res.status(200).json({
      success: true,
      // Diubah ke Supabase Cloud sesuai isi file quizRepository.js kelompokmu
      message: "Hore! Skor petualangan sains kamu sukses dicatat di Supabase Cloud! 🚀🏆"
    });

  } catch (error) {
    console.error("❌ Error di saveQuizScoreResult Controller:", error.message);
    return res.status(500).json({ success: false, message: "Gagal menyimpan skor kuis ke database." });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'ID Pelajar wajib dicantumkan.' });
    }

    // Panggil fungsi penarik history di service layer
    const scores = await quizService.getStudentQuizHistory(studentId);

    // Kirimkan array murni langsung ke frontend agar dibaca sempurna oleh Axios di ParentPage
    return res.status(200).json(scores);
  } catch (error) {
    console.error("❌ [Quiz Controller Error] Gagal fetch data skor kuis:", error.message);
    return res.status(500).json({ success: false, message: 'Gagal memuat evaluasi kuis di database.' });
  }
};