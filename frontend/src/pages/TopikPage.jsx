import React, { useState } from 'react';

const TopikPage = () => {
  // Set default tab ke topik pertama yang ada di dataset resmi
  const [activeTab, setActiveTab] = useState('adaptasi_makhluk_hidup');

  // 📋 Rangkuman Materi Edukasi IPA SD disesuaikan dengan 15 Topik Resmi dataclean_revisi.csv
  const materiSains = {
    adaptasi_makhluk_hidup: { 
      judul: "🐾 Adaptasi Makhluk Hidup", 
      tag: "adaptasi makhluk hidup",
      isi: "Adaptasi adalah kemampuan makhluk hidup untuk menyesuaikan diri dengan lingkungannya agar bisa bertahan hidup. Contohnya cecak memutuskan ekornya (autotomi), kaktus memiliki daun berbentuk duri untuk mengurangi penguapan, dan bunglon mengubah warna kulitnya (kamuflase)." 
    },
    peredaran_darah: { 
      judul: "❤️ Peredaran Darah", 
      tag: "peredaran darah",
      isi: "Sistem peredaran darah manusia berfungsi mengalirkan oksigen dan nutrisi ke seluruh tubuh. Organ utamanya adalah jantung (memompa darah) and pembuluh darah. Darah bersih kaya oksigen mengalir dari paru-paru ke seluruh tubuh, sedangkan darah kotor membawa karbondioksida kembali ke jantung." 
    },
    peristiwa_alam: { 
      judul: "🌋 Peristiwa Alam", 
      tag: "peristiwa alam",
      isi: "Peristiwa alam adalah kejadian yang terjadi karena faktor alam dan dapat memengaruhi kehidupan makhluk hidup. Contohnya meliputi gempa bumi, gunung meletus, banjir, tanah longsor, dan angin puting beliung. Beberapa di antaranya terjadi murni karena pergerakan bumi, namun ada yang dipicu kelalaian manusia." 
    },
    sumber_daya_alam: { 
      judul: "🌾 Sumber Daya Alam & Kegunaannya", 
      tag: "sumber daya alam dan kegunaannya",
      isi: "Sumber daya alam (SDA) adalah segala sesuatu di alam yang dapat dimanfaatkan manusia. SDA dikelompokkan menjadi SDA yang dapat diperbarui (air, hewan, tumbuhan) dan tidak dapat diperbarui (minyak bumi, batubara, logam). Penggunaannya harus bijak agar tidak cepat habis." 
    },
    alat_pencernaan: { 
      judul: "🍔 Alat Pencernaan & Makanan", 
      tag: "alat pencernaan dan makanan",
      isi: "Sistem pencernaan mengolah makanan menjadi energi dan nutrisi yang diserap tubuh. Alurnya dimulai dari mulut (pencernaan mekanik & kimiawi), kerongkongan, lambung (menghancurkan makanan dengan asam lambung), usus halus (penyerapan sari makanan), usus besar (penyerapan air), hingga anus." 
    },
    benda_sifatnya: { 
      judul: "📦 Benda & Sifatnya", 
      tag: "benda dan sifatnya",
      isi: "Benda di sekitar kita memiliki wujud dan sifat yang berbeda. Benda padat memiliki bentuk dan volume tetap. Benda cair bentuknya berubah mengikuti wadahnya dan mengalir ke tempat rendah. Benda gas bentuk dan volumenya berubah mengikuti bentuk ruangan yang diisinya." 
    },
    bumi_peristiwa_alam: { 
      judul: "🪐 Bumi & Peristiwa Alam", 
      tag: "bumi dan peristiwa alam",
      isi: "Materi ini membahas struktur bumi serta fenomena alam yang terjadi akibat gerakan bumi. Rotasi bumi (perputaran bumi pada porosnya) menyebabkan terjadinya siang dan malam. Sedangkan revolusi bumi (bumi mengelilingi matahari) menyebabkan perubahan musim dan perbedaan rasi bintang." 
    },
    air: { 
      judul: "💧 Air", 
      tag: "air",
      isi: "Air merupakan komponen vital bagi kehidupan. Air di bumi tidak pernah habis karena mengalami siklus hidrologi. Prosesnya dimulai dari penguapan air laut oleh panas matahari (evaporasi), pembentukan awan (kondensasi), hingga jatuh kembali ke bumi dalam bentuk hujan (presipitasi)." 
    },
    alat_tubuh_manusia_hewan: { 
      judul: "🦴 Alat Tubuh Manusia & Hewan", 
      tag: "alat tubuh manusia dan hewan",
      isi: "Membahas tentang struktur alat gerak dan perlindungan tubuh. Manusia dan hewan vertebrata memiliki rangka dalam (endoskeleton) yang tersusun atas tulang dan digerakkan oleh otot selaku alat gerak aktif. Alat tubuh ini juga berfungsi melindungi organ dalam yang lunak seperti otak dan paru-paru." 
    },
    tumbuhan_hijau: { 
      judul: "🌿 Tumbuhan Hijau", 
      tag: "tumbuhan hijau",
      isi: "Tumbuhan hijau disebut makhluk hidup autotrof karena bisa membuat makanannya sendiri melalui fotosintesis. Proses memasak ini terjadi di daun menggunakan bantuan klorofil (zat hijau daun), air dari akar, karbondioksida dari udara, dan energi cahaya matahari untuk menghasilkan karbohidrat serta oksigen." 
    },
    gaya_gerak_energi: { 
      judul: "⚡ Gaya, Gerak, dan Energi", 
      tag: "gaya, gerak, dan energi",
      isi: "Gaya adalah tarikan atau dorongan yang memengaruhi posisi atau bentuk benda. Energi adalah kemampuan untuk melakukan usaha. Energi tidak dapat diciptakan atau dimusnahkan, tetapi dapat diubah bentuknya (Hukum Kekekalan Energi), contohnya energi listrik menjadi energi gerak pada kipas angin." 
    },
    cahaya_sifatnya: { 
      judul: "🔦 Cahaya & Sifat-Sifatnya", 
      tag: "cahaya dan sifat-sifatnya",
      isi: "Cahaya adalah gelombang elektromagnetik yang bisa ditangkap oleh indra penglihatan (mata). Sifat-sifat utama cahaya antara lain: dapat merambat lurus, dapat menembus benda bening, dapat dipantulkan saat mengenai permukaan cermin, serta dapat dibiaskan (dibelokkan) saat melewati dua medium berbeda." 
    },
    alat_pernapasan: { 
      judul: "🌬️ Alat Pernapasan Manusia & Hewan", 
      tag: "alat pernapasan manusia dan hewan",
      isi: "Membahas organ spesifik untuk bernapas (mengambil oksigen dan membuang karbondioksida). Manusia bernapas menggunakan paru-paru. Hewan memiliki alat beragam: ikan menggunakan insang, serangga menggunakan trakea, cacing tanah menggunakan permukaan kulit basah, dan katak dewasa menggunakan paru-paru serta kulit." 
    },
    organ_tubuh_manusia_hewan: { 
      judul: "🧬 Organ Tubuh Manusia & Hewan", 
      tag: "organ tubuh manusia dan hewan",
      isi: "Membahas kumpulan jaringan organ yang bekerja sama membentuk sistem organ dalam menunjang fungsi kehidupan. Ini mencakup kinerja organ koordinasi seperti otak dan saraf, organ ekskresi seperti ginjal (menyaring darah) dan hati, serta bagaimana organ-organ tersebut menjaga keseimbangan tubuh." 
    },
    sistem_pernapasan: { 
      judul: "🫁 Sistem Pernapasan", 
      tag: "sistem pernapasan",
      isi: "Sistem pernapasan berfokus pada alur keluar masuknya udara pada manusia. Udara masuk melalui hidung (disaring oleh rambut hidung), melewati tenggorokan (trakea), bronkus, hingga sampai ke alveolus di dalam paru-paru. Di alveolus inilah terjadi pertukaran gas oksigen dengan karbondioksida secara difusi." 
    }
  };

  return (
    <div className="flex-1 bg-[#F5F0E8] overflow-y-auto font-['Nunito'] text-[#2C1A0E] p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Kepala Judul Halaman */}
        <header className="p-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2C1A0E]">📚 Ensiklopedia Topik IPA</h1>
          <p className="text-xs sm:text-sm text-[#6B5C4E] mt-1 font-semibold">
            Pilih materi resmi di bawah ini untuk membaca rangkuman ilmu pengetahuan alam yang seru!
          </p>
        </header>

        {/* Layout Konten Utama */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Menu Navigasi Samping */}
          <div className="w-full md:w-72 flex flex-row md:flex-col gap-2 overflow-y-visible overflow-x-auto md:overflow-x-visible shrink-0 pb-3 md:pb-0 scrollbar-none snap-x">
            {Object.keys(materiSains).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-4 py-3 rounded-2xl font-black text-xs text-left whitespace-nowrap md:whitespace-normal snap-center transition-all duration-200 border shadow-sm ${
                  activeTab === key 
                    ? 'bg-[#7A8C5C] text-[#FAF7F2] border-[#7A8C5C] scale-[1.01] ring-2 ring-[#7A8C5C]/20' 
                    : 'bg-white text-[#6B5C4E] border-[#D6CFC4] hover:border-[#7A8C5C]/50 hover:bg-[#FAF7F2]/40'
                }`}
              >
                {materiSains[key].judul}
              </button>
            ))}
          </div>

          {/* Box Display Teks Rangkuman Bacaan */}
          <div className="flex-1 bg-[#FAF7F2] border border-[#D6CFC4] p-6 sm:p-8 rounded-[40px] shadow-sm space-y-4 flex flex-col justify-start min-h-[350px] transition-all duration-300">
            
            <h2 className="text-xl sm:text-2xl font-black text-[#2C1A0E] tracking-tight">
              {materiSains[activeTab].judul}
            </h2>
            
            <div className="w-full h-0.5 bg-[#D6CFC4]/30 my-1"></div>
            
            <p className="text-sm sm:text-base text-[#6B5C4E] leading-relaxed font-semibold text-justify pt-1">
              {materiSains[activeTab].isi}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopikPage;