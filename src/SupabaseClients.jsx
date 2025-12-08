// src/SupabaseClients.jsx
import { createClient } from "@supabase/supabase-js";

// Ambil nilai dari environment variables
// Pastikan Anda telah mengatur file .env.local di root proyek Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pastikan Environment Variables sudah dimuat (untuk Vite/Create React App)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL atau Anon Key tidak ditemukan di environment variables.");
}

// Inisialisasi Klien Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
