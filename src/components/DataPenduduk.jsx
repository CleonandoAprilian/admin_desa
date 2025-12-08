// src/components/DataPenduduk.js

import React, { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";

function DataPenduduk() {
  const [penduduk, setPenduduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPenduduk();
  }, []);

  async function fetchPenduduk() {
    setLoading(true);

    // Perintah Supabase untuk SELECT * (Ambil semua) dari tabel 'penduduk'
    const { data, error } = await supabase
      .from("penduduk")
      .select("*") // Mengambil semua kolom
      .order("nama_lengkap", { ascending: true }); // Mengurutkan berdasarkan nama

    if (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat data penduduk.");
    } else {
      setPenduduk(data);
    }
    setLoading(false);
  }

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <h3>Daftar {penduduk.length} Penduduk</h3>
      <ul>
        {penduduk.map((item) => (
          <li key={item.id}>
            **{item.nama_lengkap}** (NIK: {item.nik}) - Dusun {item.dusun}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DataPenduduk;
