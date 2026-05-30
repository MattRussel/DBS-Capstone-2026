// backend/repositories/userRepository.js
import supabase from '../config/db.js'; // Pastikan file db.js kamu memang ada di folder config!

/**
 * 🔍 Cari user berdasarkan username atau email
 * Digunakan untuk validasi agar tidak ada data ganda saat registrasi
 */
export const findUserByUsernameOrEmail = async (username, email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle(); // Mengembalikan 1 objek data, atau null jika tidak ketemu

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ [User Repository] Gagal mencari user (regis):", error.message);
    throw error;
  }
};

/**
 * 🔑 Cari user khusus berdasarkan username saja (Untuk proses Login)
 */
export const findUserByUsername = async (username) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle(); // Mengembalikan 1 data objek user untuk dicocokkan password-nya di service

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ [User Repository] Gagal mencari user (login):", error.message);
    throw error;
  }
};

/**
 * 💾 Simpan data user baru saat registrasi ke Supabase
 */
export const createUser = async (userData) => {
  try {
    const { username, email, passwordHash, role, parentId, namaLengkap } = userData;

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password_hash: passwordHash, // Menyesuaikan nama kolom snake_case di DB Supabase
          role: role || 'anak',
          parent_id: parentId ? parseInt(parentId, 10) : null,
          nama_lengkap: namaLengkap || 'Siswa Cerdas'
        }
      ])
      .select() // 🌟 PENTING: Wajib dipanggil di Supabase agar mengembalikan data yang baru masuk
      .single();

    if (error) throw error;
    return data; // Mengembalikan objek user yang sukses terdaftar (termasuk ID otomatis dari DB)
  } catch (error) {
    console.error("❌ [User Repository] Gagal menyimpan user baru:", error.message);
    throw error;
  }
};