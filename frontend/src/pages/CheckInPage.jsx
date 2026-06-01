// src/pages/CheckInPage.jsx
import React, { useState, useEffect } from 'react';

const CheckInPage = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // --- State Pengikat Data Interaktif ---
  const [checkInGoal, setCheckInGoal] = useState(localStorage.getItem('user_daily_goal') || '');
  const [feeling, setFeeling] = useState('😐'); 
  const [difficulty, setDifficulty] = useState(5);
  const [userQuestion, setUserQuestion] = useState('');

  // Sinkronisasi slider index (0 sampai 4) berdasarkan emoji aktif
  const emojiList = [
    { emoji: '😭', label: 'Sedih' },
    { emoji: '😟', label: 'Bingung' },
    { emoji: '😐', label: 'Biasa' },
    { emoji: '🙂', label: 'Senang' },
    { emoji: '🤩', label: 'Semangat' }
  ];

  // 🪐 15 TOPIK RESMI - DISELARASKAN DENGAN OBJECT KEYS DI TOPIKPAGE.JSX
  const goalLabels = { 
    adaptasi_makhluk_hidup: '🐾 Adaptasi Makhluk Hidup',
    peredaran_darah: '❤️ Peredaran Darah Manusia',
    peristiwa_alam: '🌋 Peristiwa Alam & Dampaknya',
    sumber_daya_alam: '🌾 Sumber Daya Alam & Kegunaannya',
    alat_pencernaan: '🍔 Alat Pencernaan & Makanan',
    benda_sifatnya: '📦 Benda & Sifat-Sifatnya',
    bumi_peristiwa_alam: '🪐 Bumi & Peristiwa Alam',
    air: '💧 Air & Siklus Hidrologi',
    alat_tubuh_manusia_hewan: '🦴 Alat Tubuh Manusia & Hewan',
    tumbuhan_hijau: '🌿 Tumbuhan Hijau & Fotosintesis',
    gaya_gerak_energi: '⚡ Gaya, Gerak, dan Energi',
    cahaya_sifatnya: '🔦 Cahaya & Sifat-Sifatnya',
    alat_pernapasan: '🌬️ Alat Pernapasan Manusia & Hewan',
    organ_tubuh_manusia_hewan: '🧬 Organ Tubuh Manusia & Hewan',
    sistem_pernapasan: '🫁 Sistem Pernapasan Manusia'
  };

  const [sliderValue, setSliderValue] = useState(2); 

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);
    setFeeling(emojiList[val].emoji);
  };

  const handleEmojiClick = (emoji, index) => {
    setFeeling(emoji);
    setSliderValue(index);
  };

  const nextStep = async () => {
    if (step === totalSteps) {
      try {
        const storageId = localStorage.getItem('student_id');
        const userId = storageId ? parseInt(storageId, 10) : 1;

        // Menyelaraskan teks judul materi berdasarkan 15 ID pilihan resmi
        const namaMateriPilihan = goalLabels[checkInGoal] || 'Materi Sains';

        const response = await fetch('http://localhost:5000/api/checkin/daily', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            user_id: userId,
            materi_dipelajari: namaMateriPilihan, 
            mood: feeling,                        
            tingkat_kesulitan: difficulty         
          })
        });

        const result = await response.json();
        const tanggalHariIni = new Date().toLocaleDateString('sv-SE');

        if (response.ok && result.success) {
          localStorage.setItem('user_daily_goal', checkInGoal);
          localStorage.setItem('user_feeling', feeling);
          localStorage.setItem('user_difficulty', difficulty);
          localStorage.setItem('user_saved_question', userQuestion);
          localStorage.setItem('tanggal_terakhir_checkin', tanggalHariIni); 

          alert(result.message || "Check-in harian berhasil disimpan ke database! 🚀");
          if (onClose) onClose();
          return;
        }

        if (result && result.message) {
          localStorage.setItem('user_daily_goal', checkInGoal);
          localStorage.setItem('user_feeling', feeling);
          localStorage.setItem('user_difficulty', difficulty);
          localStorage.setItem('user_saved_question', userQuestion);
          localStorage.setItem('tanggal_terakhir_checkin', tanggalHariIni); 

          alert(`Info Jurnal: ${result.message}`);
          if (onClose) onClose();
          return;
        }

        throw new Error("Respons server tidak dikenali.");

      } catch (err) {
        console.error("❌ Eror fatal pada Fetch Check-In:", err.message);
        alert("Waduh, gagal terhubung ke server port 5000. Pastikan backend Express kelompokmu sudah dinyalakan!");
      }
    } else {
      setStep((s) => Math.min(s + 1, totalSteps));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-2.5 animate-fadeIn pt-1">
            <h2 className="text-xl font-black text-[#2C1A0E] mb-1 leading-snug">Apa tujuan belajarmu hari ini?</h2>
            
            {/* AREA CONTAINER SCROLLBAR: Membungkus 15 list materi hasil sinkronisasi */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {[
                { id: 'adaptasi_makhluk_hidup', label: 'Adaptasi Makhluk Hidup', icon: '🐾' },
                { id: 'peredaran_darah', label: 'Peredaran Darah', icon: '❤️' },
                { id: 'peristiwa_alam', label: 'Peristiwa Alam', icon: '🌋' },
                { id: 'sumber_daya_alam', label: 'Sumber Daya Alam & Kegunaannya', icon: '🌾' },
                { id: 'alat_pencernaan', label: 'Alat Pencernaan & Makanan', icon: '🍔' },
                { id: 'benda_sifatnya', label: 'Benda & Sifatnya', icon: '📦' },
                { id: 'bumi_peristiwa_alam', label: 'Bumi & Peristiwa Alam', icon: '🪐' },
                { id: 'air', label: 'Air & Siklus Hidrologi', icon: '💧' },
                { id: 'alat_tubuh_manusia_hewan', label: 'Alat Tubuh Manusia & Hewan', icon: 'Bone' },
                { id: 'tumbuhan_hijau', label: 'Tumbuhan Hijau (Fotosintesis)', icon: '🌿' },
                { id: 'gaya_gerak_energi', label: 'Gaya, Gerak, dan Energi', icon: '⚡' },
                { id: 'cahaya_sifatnya', label: 'Cahaya & Sifat-Sifatnya', icon: '🔦' },
                { id: 'alat_pernapasan', label: 'Alat Pernapasan Manusia/Hewan', icon: '🌬️' },
                { id: 'organ_tubuh_manusia_hewan', label: 'Organ Tubuh Manusia & Hewan', icon: '🧬' },
                { id: 'sistem_pernapasan', label: 'Sistem Pernapasan Hidung-Paru', icon: '🫁' }
              ].map((item) => (
                <button 
                  key={item.id} 
                  type="button"
                  onClick={() => setCheckInGoal(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 border rounded-2xl transition-all font-bold text-xs sm:text-sm ${checkInGoal === item.id ? 'border-[#7A8C5C] bg-[#7A8C5C]/10 ring-2 ring-[#7A8C5C]/5' : 'bg-white border-[#D6CFC4] hover:border-[#7A8C5C]/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon === 'Bone' ? '🦴' : item.icon}</span>
                    <span className="text-[#2C1A0E] text-left">{item.label}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${checkInGoal === item.id ? 'border-[#7A8C5C]' : 'border-[#D6CFC4]'}`}>
                    {checkInGoal === item.id && <div className="w-2 bg-[#7A8C5C] rounded-full h-2"></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col items-center gap-6 animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-black text-[#2C1A0E] text-center leading-snug">Bagaimana perasaanmu tentang sains saat ini?</h2>
            
            <div className="flex justify-between w-full px-2 mt-6">
              {emojiList.map((item, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => handleEmojiClick(item.emoji, i)}
                  className="flex flex-col items-center gap-1 group outline-none"
                >
                  <span className={`text-4xl transition-all transform duration-200 ${feeling === item.emoji ? 'grayscale-0 scale-125 drop-shadow-md' : 'grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`}>
                    {item.emoji}
                  </span>
                  <span className={`text-[10px] font-bold ${feeling === item.emoji ? 'text-[#7A8C5C] font-extrabold' : 'text-[#6B5C4E]'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="w-full px-4 mt-8 relative flex flex-col items-center">
              <div className="w-full h-12 border-t-4 border-[#D6CFC4]/60 rounded-[100%] absolute top-1 pointer-events-none"></div>
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-6 appearance-none bg-transparent cursor-pointer relative z-10 focus:outline-none"
              />
            </div>
          </div>
        );

      case 3:
        const difficultyNotes = {
          1: "Sangat Gampang, Prof!", 2: "Mudah Sekali!", 3: "Bisa Aku Atasi", 
          4: "Normal Saja", 5: "Lumayan Menantang, Prof!", 6: "Cukup Sulit", 7: "Butuh Bantuan Penuh"
        };
        const targetTopikNama = goalLabels[checkInGoal] || 'Materi Sains';
        return (
          <div className="flex flex-col items-center gap-6 animate-fadeIn text-center">
            <h2 className="text-xl sm:text-2xl font-black text-[#2C1A0E] leading-snug">Seberapa sulit materi <span className="text-[#7A8C5C]">{targetTopikNama}</span> bagimu?</h2>
            <div className="text-7xl font-black text-[#7A8C5C] my-2 bg-[#7A8C5C]/5 w-24 h-24 rounded-full flex items-center justify-center border border-[#7A8C5C]/20 shadow-inner">
              {difficulty}
            </div>
            <div className="flex gap-2 w-full justify-between overflow-x-auto pb-3 pt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button 
                  type="button"
                  key={num} 
                  onClick={() => setDifficulty(num)}
                  className={`w-11 h-11 shrink-0 rounded-full font-black text-sm transition-all border-2 ${num === difficulty ? 'bg-[#C4621D] text-white border-[#C4621D] shadow-md scale-105' : 'bg-white text-[#6B5C4E] border-[#D6CFC4] hover:border-[#7A8C5C]'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-[#6B5C4E] text-sm font-bold italic mt-2">
              "{difficultyNotes[difficulty]}"
            </p>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-black text-[#2C1A0E] leading-snug">Tuliskan pertanyaanmu untuk Profesor Cerdas:</h2>
            <textarea 
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Prof, bolehkah jelaskan lebih detail tentang materi yang aku pilih tadi?..."
              className="w-full h-40 p-4 bg-white border border-[#D6CFC4] rounded-2xl outline-none focus:border-[#7A8C5C] focus:ring-2 focus:ring-[#7A8C5C]/20 text-[#2C1A0E] text-sm font-medium resize-none shadow-inner"
            ></textarea>
            <div className="p-3.5 bg-[#FDE8DC] rounded-xl flex gap-2.5 items-start border border-[#C4621D]/10">
              <span className="text-[#C4621D] text-sm">💡</span>
              <p className="text-[11px] text-[#C4621D] font-bold leading-relaxed">Tips: Gunakan kata tanya Apa, Mengapa, atau Bagaimana agar jawaban Profesor lewat Chatbot nanti lebih jelas.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !checkInGoal) return true;
    if (step === 2 && !feeling) return true;
    if (step === 4 && !userQuestion.trim()) return true;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-[#2C1A0E]/40 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-6 font-['Nunito']">
      <div className="bg-[#FAF7F2] w-full max-w-md h-full sm:h-[720px] sm:rounded-[40px] shadow-2xl border border-[#D6CFC4] flex flex-col overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="bg-[#7A8C5C] pt-10 pb-8 px-6 rounded-b-[36px] flex items-center justify-between relative shadow-md shrink-0">
          <button 
            type="button"
            onClick={prevStep} 
            className={`w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white transition-all active:scale-90 ${step === 1 ? 'invisible opacity-0' : 'visible opacity-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          <div className="absolute left-1/2 -translate-x-1/2 top-3">
            <div className="w-10 h-1.5 bg-white/20 rounded-full"></div>
          </div>

          <div className="text-white font-black text-xs tracking-widest uppercase">Jurnal Check-In</div>
          
          <button 
            type="button"
            onClick={onClose} 
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Progress Bar Line */}
        <div className="px-6 mt-5 shrink-0">
          <div className="w-full bg-[#D6CFC4]/30 h-2 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-[#7A8C5C] h-full transition-all duration-300 ease-out rounded-full" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Area Form Kerja */}
        <div className="flex-1 px-6 py-5 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Navigasi Aksi Bawah */}
        <div className="p-6 bg-[#FAF7F2] border-t border-[#D6CFC4]/30 shrink-0">
          <button 
            type="button"
            disabled={isNextDisabled()}
            onClick={nextStep}
            className={`w-full text-[#FAF7F2] font-black py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${isNextDisabled() ? 'bg-[#D6CFC4] text-[#6B5C4E]/50 cursor-not-allowed shadow-none' : 'bg-[#2C1A0E] hover:bg-[#3B2314]'}`}
          >
            <span>{step === totalSteps ? 'Selesaikan Misi 🏁' : 'Lanjut'}</span>
            {step !== totalSteps && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
            )}
          </button>
          
          <div className="flex justify-center gap-2 mt-5">
            {[...Array(totalSteps)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${step === i + 1 ? 'w-5 bg-[#7A8C5C]' : 'w-1.5 bg-[#D6CFC4]'}`}
              ></div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckInPage;