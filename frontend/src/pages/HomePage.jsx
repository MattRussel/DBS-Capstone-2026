// src/pages/HomePage.jsx
import React from 'react';
import ChatbotAnimasi from '../component/ChatbotAnimasi'; 

const HomePage = ({ setActivePage }) => {
  // 8 Topik Populer yang Diselaraskan dengan dataclean_revisi.csv
  const topikPopuler = [
    { id: "adaptasi_makhluk_hidup", label: "🐾 Adaptasi Makhluk Hidup" },
    { id: "tumbuhan_hijau", label: "🌿 Tumbuhan Hijau" },
    { id: "gaya_gerak_energi", label: "⚡ Gaya, Gerak, dan Energi" },
    { id: "sistem_pernapasan", label: "🫁 Sistem Pernapasan" },
    { id: "peredaran_darah", label: "❤️ Peredaran Darah" },
    { id: "cahaya_sifatnya", label: "🔦 Cahaya & Sifat-Sifatnya" },
    { id: "benda_sifatnya", label: "📦 Benda & Sifatnya" },
    { id: "air", label: "💧 Air & Siklus Hidrologi" }
  ];

  // Fungsi pembantu untuk memicu klik tombol "Mode Orang Tua" yang ada di Sidebar App.jsx
  const pemicuSandiOrangTua = () => {
    const semuaTombol = document.querySelectorAll('button');
    const tombolOrangTua = Array.from(semuaTombol).find(btn => btn.textContent.includes('Mode Orang Tua'));
    if (tombolOrangTua) {
      tombolOrangTua.click();
    } else {
      setActivePage('parent');
    }
  };

  return (
    // Menggunakan Global Background Cream Tim: #F5F0E8
    <div className="flex-1 bg-[#F5F0E8] overflow-y-auto font-['Nunito'] text-[#2C1A0E]">
      
      {/* 1. HERO SECTION (WARNA AKSEN UTAMA TIM: OLIVE GREEN #7A8C5C) */}
      <div className="bg-[#7A8C5C] text-[#FAF7F2] p-6 sm:p-10 rounded-b-[40px] shadow-md relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Sisi Teks */}
          <div className="max-w-4xl flex-1">
            <span className="inline-block bg-[#FAF7F2] text-[#7A8C5C] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 shadow-sm">
              ✨ Yuk Belajar Sains Hari Ini!
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mb-3 text-[#FAF7F2]">Halo Ilmuwan Cilik! 🚀</h1>
            <p className="text-[#FAF7F2]/90 text-xs sm:text-sm max-w-2xl leading-relaxed mb-6">
              Punya pertanyaan seru tentang IPA? Tanya langsung ke chatbot kami dan jelajahi dunia sains yang penuh keajaiban bersama SainsCerdas!
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setActivePage('chatbot')} className="bg-[#2C1A0E] text-[#FAF7F2] font-black text-xs px-5 py-3 rounded-full shadow-md hover:bg-[#3B2314] transition-all">
                💬 Tanya Sekarang
              </button>
              <button onClick={() => setActivePage('topik')} className="bg-[#FAF7F2] text-[#7A8C5C] font-black text-xs px-5 py-3 rounded-full shadow-md hover:bg-white transition-all">
                🔬 Jelajahi Topik
              </button>
            </div>
          </div>

          {/* Sisi Animasi Robot */}
          <ChatbotAnimasi />

        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-10">

        {/* 2. TOPIK IPA POPULER */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h3 className="font-black text-lg text-[#2C1A0E]">🧬 Topik IPA Populer</h3>
            <button onClick={() => setActivePage('topik')} className="text-xs font-bold text-[#C4621D] hover:underline">Lihat Semua →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {topikPopuler.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage('topik')}
                className="p-4 bg-[#FAF7F2] border border-[#D6CFC4] rounded-2xl font-bold text-xs text-left text-[#2C1A0E] shadow-sm hover:border-[#7A8C5C] hover:bg-white transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. BANNER PINTAS RUANG PANTAU ORANG TUA (DARK BROWN #2C1A0E) */}
        <div className="bg-[#2C1A0E] rounded-[35px] p-6 sm:p-8 text-[#FAF7F2] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group border border-[#D6CFC4]/10">
          <div className="space-y-3 max-w-2xl z-10 text-center md:text-left">
            <div className="bg-[#7A8C5C] text-[#FAF7F2] text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-sm w-max uppercase tracking-wider">
              👨‍👩‍👦 Khusus Ayah & Bunda
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#FAF7F2] tracking-tight">
              Pantau Jurnal Riset Belajar Si Kecil 📊
            </h2>
            <p className="text-xs font-medium text-[#FAF7F2]/80 leading-relaxed max-w-xl">
              Akses Ruang Pantau Khusus Orang Tua untuk melihat deteksi keamanan kata tidak sopan, mood harian anak, serta materi sains apa saja yang telah berhasil mereka kuasai secara *real-time*.
            </p>
          </div>
          
          <button 
            onClick={pemicuSandiOrangTua}
            className="w-full md:w-auto bg-[#FAF7F2] text-[#2C1A0E] font-black text-xs px-6 py-3.5 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all z-10 shrink-0 border border-[#D6CFC4]/20"
          >
            🔒 Buka Ruang Pantau
          </button>

          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#7A8C5C]/10 rounded-full mix-blend-screen transition-transform duration-500 group-hover:scale-110"></div>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#FAF7F2]/5 rounded-full mix-blend-screen"></div>
        </div>

        {/* 4. 🟢 VERSI BARU: BAHASA SEDERHANA RAMAH ORANG AWAM & ANAK-ANAK */}
        <div className="pt-2 text-center space-y-5">
          <div>
            <h3 className="font-black text-lg text-[#2C1A0E]">🌟 Kenapa Seru Belajar di SainsCerdas?</h3>
            <p className="text-xs text-[#6B5C4E]">Tempat belajar sains terbaik yang aman untuk anak dan transparan bagi orang tua!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kolom 1: Chatbot */}
            <div className="bg-[#FAF7F2] p-5 border border-[#D6CFC4] rounded-2xl text-center shadow-sm space-y-2 flex flex-col items-center justify-start">
              <span className="text-3xl block p-2 bg-[#7A8C5C]/10 rounded-xl w-max">🤖</span>
              <h4 className="font-black text-xs text-[#2C1A0E] pt-1">Ngobrol Asyik Bareng Profesor</h4>
              <p className="text-[11px] text-[#6B5C4E] leading-relaxed">
                Anak bisa menanyakan apa saja tentang pelajaran IPA SD! Profesor Cerdas akan menjawab lewat penjelasan yang seru, penuh emoji lucu, dan sangat mudah dipahami tanpa perlu menghafal mati.
              </p>
            </div>
            
            {/* Kolom 2: Jurnal Riwayat */}
            <div className="bg-[#FAF7F2] p-5 border border-[#D6CFC4] rounded-2xl text-center shadow-sm space-y-2 flex flex-col items-center justify-start">
              <span className="text-3xl block p-2 bg-[#7A8C5C]/10 rounded-xl w-max">📖</span>
              <h4 className="font-black text-xs text-[#2C1A0E] pt-1">Buku Catatan Digital Otomatis</h4>
              <p className="text-[11px] text-[#6B5C4E] leading-relaxed">
                Semua pertanyaan dan materi yang sudah dibaca anak tidak akan hilang! Sistem langsung menyimpannya dengan rapi supaya anak bisa membuka dan membacanya kembali kapan saja untuk belajar ulasan.
              </p>
            </div>

            {/* Kolom 3: Ruang Pantau */}
            <div className="bg-[#FAF7F2] p-5 border border-[#D6CFC4] rounded-2xl text-center shadow-sm space-y-2 flex flex-col items-center justify-start">
              <span className="text-3xl block p-2 bg-[#7A8C5C]/10 rounded-xl w-max">🛡️</span>
              <h4 className="font-black text-xs text-[#2C1A0E] pt-1">Ruang Internet Aman & Sopan</h4>
              <p className="text-[11px] text-[#6B5C4E] leading-relaxed">
                Aplikasi ini menjaga anak agar selalu berbicara sopan. Jika anak tidak sengaja mengetik kata kurang baik, Profesor akan mengingatkan mereka dengan ramah, dan laporannya tersimpan khusus untuk orang tua.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;