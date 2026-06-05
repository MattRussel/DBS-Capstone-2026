// backend/services/chatbotService.js
import * as chatbotRepository from '../repositories/chatbotRepository.js';

// 🔗 URL API Publik Ngrok Tim AI Engineer 
const AI_ENGINEER_API_URL = 'https://groin-multitude-earphone.ngrok-free.dev';

/**
 * 💬 LOGIKA CHATBOT REGULER (POST /chat) - TWO-STEP MODERATION & RAG INTEGRATION
 */
export const handleChatOrLogic = async (user_id, pesan, topik) => {
  try {
    const cleanBaseUrl = AI_ENGINEER_API_URL.replace(/\/$/, '');
    console.log(`📡 [STEP 1] Menembak Gerbang /moderation untuk verifikasi teks: "${pesan}"`);

    // 🛡️ LALU LINTAS 1: Panggil rute /moderation milik Python untuk cek blacklist kata kotor
    const modResponse = await fetch(`${cleanBaseUrl}/moderation`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json', 
        'ngrok-skip-browser-warning': 'true' 
      },
      body: JSON.stringify({
        text: String(pesan),
        session_id: String(user_id)
      })
    });

    if (!modResponse.ok) {
      throw new Error(`API Moderasi Python merespons dengan status: ${modResponse.status}`);
    }

    const modResultRaw = await modResponse.json();
    console.log("📡 [MODERATION RAW DATA]:", JSON.stringify(modResultRaw));

    // 🟢 JARING PENGAMAN EKSTRAKSI: Ambil status baik dari root langsung maupun jika dibungkus objek .data/.moderation
    const infoModerasi = modResultRaw.data || modResultRaw.moderation || modResultRaw;
    const statusMod = String(infoModerasi.status || '').toLowerCase();

    // 🛑 JIKA TERDETEKSI KATA KOTOR: Potong alur dan kirim peringatan secara instan
    if (statusMod === "warning" || statusMod === "cooldown") {
      console.warn(`⚠️ [TAMENG AKTIF] Terdeteksi Pelanggaran! Status: ${statusMod} | Strikes: ${infoModerasi.strikes || 1}`);

      // Ambil pesan teguran asli dinamis dari Python ("Yuk jaga kata-kata", "Istirahat dulu", dll)
      const teksTeguran = infoModerasi.message || "Yuk, gunakan bahasa yang lebih sopan di laboratorium ya 😊";
      const formatTeguranFinal = teksTeguran.includes('⚠️') ? teksTeguran : `⚠️ ${teksTeguran}`;

      // 💾 Simpan log pelanggaran kata kotor ke database Supabase Cloud
      console.log("⏳ [Supabase Insert] Menyimpan berkas pelanggaran ke chatbot_history...");
      await chatbotRepository.saveChatMessage(user_id, pesan, formatTeguranFinal, {
        topik: "Sistem Peringatan",
        subtopik: statusMod,
        konteks: "Peringatan Kata Kasar",
        jenis_pertanyaan: "Moderasi",
        kompleksitas: "0.00%" // Nilai keyakinan di-set ke 0.00% untuk penanda non-sains
      });

      return {
        type: "CHAT_TEXT",
        data: {
          text: formatTeguranFinal,
          predicted_topic: "Sistem Peringatan", // Mengaktifkan layout warna oranye berkedip di frontend React
          tf_confidence: "0.0%",
          similarity_score: "0.00%"
        }
      };
    }

    // ---------------------------------------------------------------------------
    // 🧠 LALU LINTAS 2: JALUR AMAN (SAFE) -> Teruskan ke RAG Model Sains Python
    // ---------------------------------------------------------------------------
    console.log(`📡 [STEP 2] Pesan dinyatakan aman. Menembak rute /chat untuk mencari data sains...`);
    const aiResponse = await fetch(`${cleanBaseUrl}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json', 
        'ngrok-skip-browser-warning': 'true' 
      },
      body: JSON.stringify({
        message: String(pesan), 
        session_id: String(user_id),
        history: []
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`API Chatbot RAG merespons dengan status: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const balasanAI = aiData.answer || "Halo Ilmuwan Cilik! Profesor siap membantu.";

    // Kondisi fallback jika jawaban melosot ke luar materi sains utama
    let namaTopikFinal = aiData.predicted_topic || topik || "Tidak Ada Topik";
    if (balasanAI.includes("belum ada di pengetahuan saya") || namaTopikFinal === "Tidak terdeteksi" || namaTopikFinal === "Umum") {
      namaTopikFinal = "Tidak Ada Topik";
    }

    // Parsing data numerik presentase ke string visual
    let numConfidence = typeof aiData.tf_confidence === 'number' ? aiData.tf_confidence : parseFloat(aiData.tf_confidence || 0);
    if (numConfidence < 1 && numConfidence > 0) numConfidence = numConfidence * 100;
    const formattedConfidence = namaTopikFinal === "Tidak Ada Topik" ? "0.0%" : `${numConfidence.toFixed(1)}%`;

    let numSimilarity = typeof aiData.similarity_score === 'number' ? aiData.similarity_score : parseFloat(aiData.similarity_score || 0);
    if (numSimilarity < 1 && numSimilarity > 0) numSimilarity = numSimilarity * 100;
    const formattedSimilarity = (numSimilarity === 0 || namaTopikFinal === "Tidak Ada Topik") ? "0.00%" : `${numSimilarity.toFixed(2)}%`;

    // Simpan log obrolan bersih sukses ke database Supabase Cloud
    console.log("⏳ [Supabase Insert] Menyimpan log obrolan sukses ke chatbot_history...");
    await chatbotRepository.saveChatMessage(user_id, pesan, balasanAI, {
      topik: namaTopikFinal,
      subtopik: aiData.subtopik || null,
      konteks: aiData.question_matched || "normal",
      jenis_pertanyaan: namaTopikFinal === "Tidak Ada Topik" ? "Luar Konteks" : (aiData.category || "Sains"),
      kompleksitas: formattedSimilarity
    });

    return {
      type: "CHAT_TEXT",
      data: {
        text: balasanAI,
        predicted_topic: namaTopikFinal,
        tf_confidence: formattedConfidence,          
        similarity_score: formattedSimilarity       
      }
    };

  } catch (error) {
    console.error("❌ [Chatbot Service Error Fallback]:", error.message);
    return {
      type: "CHAT_TEXT",
      data: {
        text: `Halo Ilmuwan Cilik! 👋 Profesor Cerdas sedang merapikan laboratorium jurnal sains dulu. Yuk, coba ketik pertanyaan sains lainnya! 🚀🔬`,
        predicted_topic: "Tidak Ada Topik",
        tf_confidence: "0.0%",
        similarity_score: "0.00%"
      }
    };
  }
};

/**
 * 📜 Mengambil Riwayat Obrolan Anak Detail untuk Orang Tua
 */
export const getStudentChatHistory = async (userId) => {
  if (!userId) {
    throw new Error('ID Pengguna tidak valid untuk memuat riwayat.');
  }
  return await chatbotRepository.getChatHistoryByUserId(userId);
};