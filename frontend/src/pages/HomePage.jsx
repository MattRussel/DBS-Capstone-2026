import React from 'react';

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

  return (
    // Menggunakan Global Background Cream Tim: #F5F0E8
    <div className="flex-1 bg-[#F5F0E8] overflow-y-auto font-['Nunito'] text-[#2C1A0E]">
      
      {/* 1. HERO SECTION (WARNA AKSEN UTAMA TIM: OLIVE GREEN #7A8C5C) */}
      <div className="bg-[#7A8C5C] text-[#FAF7F2] p-6 sm:p-10 rounded-b-[40px] shadow-md relative overflow-hidden">
        <div className="max-w-4xl">
          <span className="inline-block bg-[#FAF7F2] text-[#7A8C5C] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 shadow-sm">
            ✨ Yuk Belajar Sains Hari Ini!
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 text-[#FAF7F2]">Halo Ilmuwan Cilik! 🚀</h1>
          <p className="text-[#FAF7F2]/90 text-xs sm:text-sm max-w-2xl leading-relaxed mb-6">
            Punya pertanyaan seru tentang IPA? Tanya langsung ke chatbot kami dan jelajahi dunia sains yang penuh keajaiban bersama SainsCerdas!
          </p>
          <div className="flex flex-wrap gap-3">
            {/* Tombol Primary Dark Brown */}
            <button onClick={() => setActivePage('chatbot')} className="bg-[#2C1A0E] text-[#FAF7F2] font-black text-xs px-5 py-3 rounded-full shadow-md hover:bg-[#3B2314] transition-all">
              💬 Tanya Sekarang
            </button>
            {/* Tombol Secondary Off-White */}
            <button onClick={() => setActivePage('topik')} className="bg-[#FAF7F2] text-[#7A8C5C] font-black text-xs px-5 py-3 rounded-full shadow-md hover:bg-white transition-all">
              🔬 Jelajahi Topik
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">

        {/* 2. TOPIK IPA POPULER (GRID KARTU OFF-WHITE #FAF7F2 YANG SUDAH SINKRON) */}
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

        {/* 3. BANNER KUIS HARIAN (GRADASI WARNA ORANGE/AMBER TIM: #C4621D) */}
        <div className="bg-gradient-to-r from-[#C4621D] to-[#D4702A] rounded-[32px] p-6 text-[#FAF7F2] shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <div className="bg-[#FAF7F2] text-[#C4621D] text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-sm w-max">
              🔹 Kuis Harian
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#FAF7F2]">Uji Pengetahuan Sainsmu! ⭐</h2>
            <p className="text-xs font-semibold opacity-90 leading-relaxed">
              Selesaikan 5 soal singkat dan kumpulkan bintang reward. Siap jadi juara IPA kelas 5?
            </p>
          </div>
          <button 
            onClick={() => setActivePage('quiz')}
            className="mt-5 w-full bg-[#2C1A0E] text-[#FAF7F2] font-black text-xs py-3.5 rounded-full shadow-md hover:bg-[#3B2314] transition-all z-10"
          >
            🎯 Mulai Kuis Sekarang
          </button>
        </div>

        {/* 4. FOOTER ASPEK FITUR */}
        <div className="pt-4 text-center space-y-4">
          <div>
            <h3 className="font-black text-lg text-[#2C1A0E]">🌟 Kenapa Belajar di SainsCerdas?</h3>
            <p className="text-xs text-[#6B5C4E]">Belajar IPA jadi mudah, seru, dan penuh petualangan!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FAF7F2] p-5 border border-[#D6CFC4] rounded-2xl text-center shadow-sm space-y-2">
              <span className="text-2xl block">🤖</span>
              <h4 className="font-black text-xs text-[#2C1A0E]">Chatbot Ramah Anak</h4>
              <p className="text-[11px] text-[#6B5C4E] leading-relaxed">Tanya apapun tentang IPA dan dapatkan jawaban mudah dipahami dengan bahasa yang asyik.</p>
            </div>
            <div className="bg-[#FAF7F2] p-5 border border-[#D6CFC4] rounded-2xl text-center shadow-sm space-y-2">
              <span className="text-2xl block">🏆</span>
              <h4 className="font-black text-xs text-[#2C1A0E]">Kuis Seru Berhadiah</h4>
              <p className="text-[11px] text-[#6B5C4E] leading-relaxed">Uji pemahamanmu dengan kuis singkat dan kumpulkan bintang reward sebanyak-banyaknya!</p>
            </div>
            <div className="bg-[#FAF7F2] p-5 border border-[#D6CFC4] rounded-2xl text-center shadow-sm space-y-2">
              <span className="text-2xl block">📖</span>
              <h4 className="font-black text-xs text-[#2C1A0E]">Riwayat Tersimpan</h4>
              <p className="text-[11px] text-[#6B5C4E] leading-relaxed">Lihat kembali semua percakapan dan pelajaran yang sudah kamu pelajari kapan saja.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;