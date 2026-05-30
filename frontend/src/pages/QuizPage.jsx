import React, { useState } from 'react';

const QuizPage = () => {
  
  // ====================================================================
  // 1. STATE MANAGEMENT (KONTROL ALUR APLIKASI)
  // ====================================================================
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State Jalannya Kuis Dinamis
  const [currentQuestions, setCurrentQuestions] = useState([]); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0); 

  const userId = localStorage.getItem('student_id') || 1;

  // 📋 MASTER DATA: 15 Topik Resmi Lengkap Sesuai Kurikulum SainsCerdas
  const infoMateriKuis = {
    adaptasi: {
      tag: "adaptasi makhluk hidup",
      judul: "🐾 Adaptasi Makhluk Hidup",
      deskripsi: "Uji pemahamanmu seputar cara unik hewan dan tumbuhan menyesuaikan diri dengan lingkungan tempat tinggalnya."
    },
    darah: {
      tag: "peredaran darah",
      judul: "❤️ Peredaran Darah",
      deskripsi: "Jelajahi alur pompa darah bersih dan kotor yang dialirkan oleh jantung ke seluruh organ tubuh manusia."
    },
    peristiwa_alam: {
      tag: "peristiwa alam",
      judul: "🌋 Peristiwa Alam",
      deskripsi: "Belajar tentang fenomena gempa bumi, gunung meletus, banjir, serta dampaknya bagi makhluk hidup."
    },
    sda: {
      tag: "sumber daya alam dan kegunaannya",
      judul: "🌾 Sumber Daya Alam & Kegunaannya",
      deskripsi: "Pahami perbedaan materi alam yang dapat diperbarui maupun yang tidak dapat diperbarui di bumi."
    },
    pencernaan: {
      tag: "alat pencernaan dan makanan",
      judul: "🍔 Alat Pencernaan & Makanan",
      deskripsi: "Uji pengetahuanmu tentang bagaimana lambung dan usus mengolah makanan sehat menjadi energi tubuh."
    },
    benda: {
      tag: "benda dan sifatnya",
      judul: "📦 Benda & Sifatnya",
      deskripsi: "Pelajari karakteristik unik yang membedakan wujud benda padat, benda cair, hingga benda gas."
    },
    bumi_alam: {
      tag: "bumi dan peristiwa alam",
      judul: "🪐 Bumi & Peristiwa Alam",
      deskripsi: "Temukan rahasia rotasi dan revolusi bumi yang menyebabkan adanya pergantian siang, malam, dan musim."
    },
    air: {
      tag: "air",
      judul: "💧 Air & Siklus Hidrologi",
      deskripsi: "Uji pemahamanmu mengenai evaporasi, kondensasi, dan bagaimana air bersih terus berputar di bumi."
    },
    alat_tubuh: {
      tag: "alat tubuh manusia dan hewan",
      judul: "🦴 Alat Tubuh Manusia & Hewan",
      deskripsi: "Pelajari sistem rangka tulang dan fungsi otot sebagai penggerak utama tubuh makhluk hidup."
    },
    tumbuhan: {
      tag: "tumbuhan hijau",
      judul: "🌿 Tumbuhan Hijau",
      deskripsi: "Jelajahi rahasia klorofil, fotosintesis, dan bagaimana tumbuhan hijau membuat makanannya sendiri."
    },
    gaya: {
      tag: "gaya, gerak, dan energi",
      judul: "⚡ Gaya, Gerak, & Energi",
      deskripsi: "Belajar tentang tarikan, dorongan, gaya gravitasi, magnet, serta hukum kekekalan perubahan energi."
    },
    cahaya: {
      tag: "cahaya dan sifat-sifatnya",
      judul: "🔦 Cahaya & Sifat-Sifatnya",
      deskripsi: "Uji pemahamanmu tentang sifat cahaya yang merambat lurus, dapat dipantulkan, hingga dapat dibiaskan."
    },
    alat_napas: {
      tag: "alat pernapasan manusia dan hewan",
      judul: "🌬️ Alat Pernapasan Makhluk Hidup",
      deskripsi: "Mengenal organ insang, trakea, paru-paru, dan kulit basah yang dipakai bernapas oleh hewan."
    },
    organ: {
      tag: "organ tubuh manusia dan hewan",
      judul: "🧬 Organ Tubuh Manusia & Hewan",
      deskripsi: "Pahami cara kerja ginjal, hati, otak, dan organ koordinasi dalam menjaga keseimbangan tubuh."
    },
    sistem_napas: {
      tag: "sistem pernapasan",
      judul: "🫁 Sistem Pernapasan Manusia",
      deskripsi: "Uji alur masuknya oksigen mulai dari hidung, tenggorokan, bronkus, hingga ke alveolus paru-paru."
    }
  };

  // ====================================================================
  // 2. FUNGSI UTAMA (LOGIKA REKUES API, SKORING, & CLEANUP)
  // ====================================================================
  
  const handleKembaliKePapanMisi = () => {
    setSelectedTopic(null);
    setCurrentQuestions([]); 
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsFinished(false);
    setError(null);
  };

  // ✨ FITUR BARU: Handler klik opsi jawaban yang sebelumnya terlewat
  const handleOptionClick = (option) => {
    setSelectedAnswer(option);
  };

  const handleStartQuiz = async (topicKey) => {
    setSelectedTopic(topicKey);
    setLoading(true);
    setError(null);
    setCurrentQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsFinished(false);
    setScore(0);
    setCorrectAnswersCount(0);

    try {
      console.log(`📡 Mengambil data kuis via Backend Express untuk topik: ${infoMateriKuis[topicKey].tag}`);
      
      const response = await fetch('http://localhost:5000/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          topik: infoMateriKuis[topicKey].tag, 
          isQuizMode: true, 
          pesan: "" 
        })
      });

      if (!response.ok) {
        throw new Error(`Server merespons dengan status: ${response.status}`);
      }

      const result = await response.json();

      // Membongkar array kuis yang dibungkus di dalam properti .data dari Express controller
      if (result.type === "QUIZ_DATA" && Array.isArray(result.data)) {
        setCurrentQuestions(result.data); 
      } else {
        throw new Error("Struktur paket soal kuis dari server tidak valid.");
      }
    } catch (err) {
      console.error("❌ Error Fetch Kuis:", err.message);
      setError("Waduh, gagal mengambil soal petualangan sains dari server! Hubungkan server kamu dan coba lagi ya 🚀");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!currentQuestions || currentQuestions.length === 0) return;

    let updatedCorrectCount = correctAnswersCount;
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    const correctLetter = currentQuestion?.jawaban_benar || currentQuestion?.jawaban || "A";
    const isCorrect = selectedAnswer && (
      selectedAnswer.startsWith(correctLetter) || 
      selectedAnswer === correctLetter
    );

    if (isCorrect) {
      updatedCorrectCount += 1;
      setCorrectAnswersCount(updatedCorrectCount);
    }

    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      const finalScore = (updatedCorrectCount / currentQuestions.length) * 100;
      setScore(finalScore);
      setIsFinished(true);

      try {
        // 🟢 SINKRONISASI: Diarahkan ke server backend lokal Express kelompokmu yang terhubung Supabase
        await fetch('http://localhost:5000/api/quiz/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId, 10),
            topik_ipa: infoMateriKuis[selectedTopic].tag,
            skor_total: Math.round(finalScore),
            jawaban_benar: updatedCorrectCount
          })
        });
        console.log("💾 Nilai sukses tersimpan di database Supabase lewat backend Express!");
      } catch (err) {
        console.error("⚠️ Gagal menyimpan skor kuis ke database:", err.message);
      }
    }
  };

  // ====================================================================
  // 3. RENDERING KONDISIONAL SCREEN (VIEW LAYAR)
  // ====================================================================

  // SCREEN A: SEDANG LOADING DATA
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F0E8] p-6 min-h-screen font-['Nunito']">
        <div className="text-center animate-pulse">
          <span className="text-5xl animate-bounce inline-block mb-4">🔬</span>
          <h2 className="text-xl font-black text-[#2C1A0E]">Profesor Sedang Meracik Soal...</h2>
          <p className="text-[#6B5C4E] text-xs font-bold mt-1">Mengambil data sains terpercaya dari cluster database kelompok 🚀</p>
        </div>
      </div>
    );
  }

  // SCREEN B: TERJADI EROR KONEKSI
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F0E8] p-6 min-h-screen font-['Nunito']">
        <div className="bg-[#FAF7F2] border border-[#D6CFC4] p-8 rounded-[40px] text-center max-w-sm shadow-md">
          <span className="text-5xl">⚠️</span>
          <h3 className="text-lg font-black text-amber-700 mt-4">Koneksi Terganggu</h3>
          <p className="text-xs text-[#6B5C4E] my-3 leading-relaxed font-semibold">{error}</p>
          <button onClick={handleKembaliKePapanMisi} className="w-full bg-[#2C1A0E] text-[#FAF7F2] font-black py-3 rounded-full text-xs shadow-sm hover:bg-[#3B2314] transition-colors">
            Kembali ke Papan Misi
          </button>
        </div>
      </div>
    );
  }

  // SCREEN C: DATA KUIS SELESAI (HALAMAN SKOR AKHIR)
  if (isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F0E8] p-6 min-h-screen font-['Nunito']">
        <div className="bg-[#FAF7F2] border border-[#D6CFC4] p-8 rounded-[40px] text-center max-w-sm shadow-md space-y-4">
          <div>
            <span className="text-5xl">🏆</span>
            <h2 className="text-2xl font-black text-[#2C1A0E] mt-3">Misi Selesai!</h2>
            <p className="text-[#6B5C4E] text-xs font-bold mt-1.5 leading-relaxed">
              Selamat! Nilai akumulasi kuis kamu untuk topik <span className="font-black text-[#7A8C5C] uppercase">{infoMateriKuis[selectedTopic]?.judul}</span> adalah:
            </p>
          </div>
          <div className="text-5xl font-black text-[#7A8C5C] bg-white border border-[#D6CFC4] py-4 rounded-3xl shadow-inner w-max mx-auto px-8">
            {Math.round(score)}
          </div>
          <div className="flex gap-2 w-full pt-2">
            <button onClick={handleKembaliKePapanMisi} className="flex-1 bg-[#D6CFC4] text-[#2C1A0E] font-black px-4 py-3 rounded-full text-xs hover:bg-[#c4b9aa] transition-colors">Papan Misi</button>
            <button onClick={() => handleStartQuiz(selectedTopic)} className="flex-1 bg-[#2C1A0E] text-[#FAF7F2] font-black px-4 py-3 rounded-full text-xs hover:bg-[#3B2314] transition-colors">Ulangi Kuis</button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN D: MENU UTAMA (AUTOMATIC GENERATION UTK 15 KARTU TOPIK MISI)
  if (!selectedTopic) {
    return (
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-[#F5F0E8] min-h-screen font-['Nunito']">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-black text-[#2C1A0E] mb-2">Papan Misi Kuis Sains 🎯</h1>
            <p className="text-[#6B5C4E] text-xs sm:text-sm font-semibold">Pilih satu dari 15 topik materi resmi di bawah ini yang ingin kamu taklukkan hari ini!</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Object.keys(infoMateriKuis).map((key) => (
              <div key={key} className="bg-[#FAF7F2] border border-[#D6CFC4] p-5 sm:p-6 rounded-[32px] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <h3 className="font-black text-lg text-[#2C1A0E] mb-1">{infoMateriKuis[key].judul}</h3>
                  <p className="text-xs text-[#6B5C4E] font-medium leading-relaxed mb-6">{infoMateriKuis[key].deskripsi}</p>
                </div>
                <button 
                  onClick={() => handleStartQuiz(key)} 
                  className="w-full bg-[#7A8C5C] text-white font-black py-2.5 rounded-full text-xs shadow-sm hover:bg-[#68784c] transition-colors"
                >
                  Mulai Kuis
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SCREEN E: JALANNYA LEMBAR SOAL KUIS
  if (currentQuestions.length === 0) return null;

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  
  const opsiPilihan = Array.isArray(currentQuestion?.opsi) 
    ? currentQuestion.opsi 
    : (Array.isArray(currentQuestion?.pilihan) ? currentQuestion.pilihan : []);

  return (
    <div className="flex-1 p-4 sm:p-8 bg-[#F5F0E8] overflow-y-auto flex items-center justify-center min-h-screen font-['Nunito']">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#D6CFC4] shadow-sm p-6 space-y-6">
        
        <div className="flex justify-between items-center">
          <div className="bg-[#C4621D]/10 text-[#C4621D] px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1">
            {infoMateriKuis[selectedTopic]?.judul || "🔬 Misi Sains"}
          </div>
          <div className="bg-sky-50 text-sky-700 font-black px-3 py-1 rounded-xl text-xs flex items-center gap-1">⏱️ 00:45</div>
        </div>

        <div className="flex justify-between text-xs font-black text-[#6B5C4E]">
          <span>Soal {currentQuestionIndex + 1} dari {currentQuestions.length}</span>
          <span>{Math.round(progressPercent)}% selesai</span>
        </div>

        <div className="w-full h-2.5 bg-[#EAE3D5] rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="bg-sky-50/50 border border-sky-100 rounded-[32px] p-6 text-center shadow-inner">
          <span className="text-[10px] font-black uppercase text-sky-600 tracking-wider">Pertanyaan {currentQuestionIndex + 1}</span>
          <h2 className="text-base sm:text-lg font-black text-[#2C1A0E] mt-1.5 leading-relaxed">
            {currentQuestion?.soal || currentQuestion?.pertanyaan || "Memuat deskripsi pertanyaan..."}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {opsiPilihan.map((option, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={`p-4 rounded-2xl font-bold text-xs sm:text-sm text-center border transition-all duration-150 ${
                selectedAnswer === option 
                  ? 'bg-[#7A8C5C] border-[#7A8C5C] text-white ring-4 ring-[#7A8C5C]/10 font-black' 
                  : 'bg-[#FAF7F2] border-[#D6CFC4] text-[#2C1A0E] hover:border-[#7A8C5C]/40 hover:bg-[#FAF7F2]/30'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[#D6CFC4]/60">
          <button onClick={handleKembaliKePapanMisi} className="text-xs font-black text-[#6B5C4E] bg-slate-100 px-4 py-2.5 rounded-full hover:bg-slate-200 transition-colors">
            Batalkan Kuis
          </button>
          <button
            type="button"
            disabled={!selectedAnswer}
            onClick={handleNext}
            className={`px-5 py-2.5 text-xs font-black rounded-full shadow-sm transition-all duration-200 ${
              selectedAnswer 
                ? 'bg-sky-500 text-white hover:bg-sky-600' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {currentQuestionIndex + 1 === currentQuestions.length ? 'Selesaikan Misi 🏁' : 'Soal Berikutnya →'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuizPage;