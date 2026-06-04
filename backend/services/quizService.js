// backend/services/quizService.js
import * as quizRepository from '../repositories/quizRepository.js';

// 🔗 URL API Publik milik Tim AI Engineer kelompokmu via Ngrok
const AI_ENGINEER_API_URL = 'https://groin-multitude-earphone.ngrok-free.dev';

/**
 * 📡 MENEMBAK API RESMI PYTHON /generate-quiz (MURNI 100% AMAN DARI TRAILING SLASH)
 */
export const generateQuizSOAL = async (topik) => {
  try {
    const baseUrl = AI_ENGINEER_API_URL.replace(/\/+$/, '');
    const targetUrl = `${baseUrl}/generate-quiz`;
    
    console.log(`📡 Menembak endpoint Python Resmi: ${targetUrl}`);

    const aiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Mengamankan interseptor Ngrok gratisan
      },
      body: JSON.stringify({ topik: topik.trim(), jumlah_soal: 3 })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`🔴 FastAPI Error di Server Python: ${errorText}`);
      throw new Error(`API Python merespons ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    // 🟢 PERBAIKAN UTAMA: Bungkus ke properti 'content' agar dibaca 100% pas oleh QuizPage.jsx!
    return { 
      type: "QUIZ_DATA", 
      content: aiData.quiz_questions || [] 
    };

  } catch (error) {
    console.error("❌ Eror di Quiz Service (Mengaktifkan Soal Cadangan):", error.message);
    
    // Fallback soal cadangan darurat agar UI anak tidak hang/crash putih
    return {
      type: "QUIZ_DATA",
      content: [{
        soal: `Maaf, Profesor sedang meramu bank soal baru untuk topik ${topik}. Coba beberapa saat lagi ya! 🚀🔬`,
        opsi: ["A. Oke, Prof!", "B. Siap!", "C. Baik!", "D. Mengerti!"],
        jawaban_benar: "A"
      }]
    };
  }
};

/**
 * 💾 Meneruskan data penyimpanan skor kuis mandiri anak ke database melalui Repository
 */
export const storeUserScore = async (userId, topikIpa, skorTotal, jawabanBenar) => {
  try {
    return await quizRepository.saveScoreToDb(userId, topikIpa, skorTotal, jawabanBenar);
  } catch (error) {
    console.error("❌ [Quiz Service] Gagal memproses penyimpanan skor:", error.message);
    throw error;
  }
};

/**
 * 📜 Mengambil riwayat kuis siswa untuk kebutuhan Ruang Pantau Orang Tua
 */
export const getStudentQuizHistory = async (userId) => {
  if (!userId) {
    throw new Error("ID Pelajar tidak valid untuk mengambil riwayat kuis.");
  }
  return await quizRepository.getQuizScoresByUserId(userId);
};