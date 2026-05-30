// backend/database/db.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 🌐 Ambil absolut path untuk file .env (Mundur 1 langkah dari folder database)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("⏳ [Supabase] Sedang menginisialisasi jembatan koneksi database...");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// 🧪 Validasi awal untuk memastikan variabel di file .env sudah terisi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ [Supabase] Inisialisasi Gagal! Kredensial SUPABASE_URL atau SUPABASE_ANON_KEY tidak ditemukan di file .env.");
  process.exit(1); // Menghentikan server jika konfigurasi salah agar tidak crash di tengah jalan
}

// 🛠️ Membuat instance client Supabase untuk digunakan di seluruh backend
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("🎉 [Supabase] Database client berhasil diinisialisasi dan siap digunakan!");

export default supabase;