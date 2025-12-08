import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../SupabaseClients"; // <-- PATH SUDAH DIKOREKSI

function AdminDashboard() {
  const [penduduk, setPenduduk] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [error, setError] = useState(null);

  // State untuk Form Input (Initial state harus match kolom tabel)
  const [formInput, setFormInput] = useState({
    nik: "",
    nama_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    agama: "",
    status_perkawinan: "",
    dusun: "",
    pendidikan: "",
  });

  // --- READ (Membaca Data) menggunakan useCallback ---
  const fetchPenduduk = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("penduduk").select("*").order("created_at", { ascending: false });

    if (error) {
      setError("Gagal memuat data: " + error.message);
    } else {
      setPenduduk(data);
    }
    setLoading(false);
  }, []);

  // Panggil fetchPenduduk hanya saat komponen dimuat
  useEffect(() => {
    fetchPenduduk();
  }, [fetchPenduduk]); // Dependency array berisi fetchPenduduk

  // Handle perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prev) => ({ ...prev, [name]: value }));
  };

  // Reset Form
  const resetForm = () => {
    setFormInput({
      nik: "",
      nama_lengkap: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      jenis_kelamin: "",
      agama: "",
      status_perkawinan: "",
      dusun: "",
      pendidikan: "",
    });
    setIsEditing(false);
    setCurrentData(null);
  };

  // --- CREATE/UPDATE (Menambah/Mengubah Data) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isEditing && currentData) {
      // UPDATE
      const { error } = await supabase.from("penduduk").update(formInput).eq("id", currentData.id);

      if (error) {
        setError("Gagal mengupdate data: " + error.message);
      } else {
        // Mengganti alert() dengan UI Message yang lebih baik
        // alert("Data berhasil diupdate!");
      }
    } else {
      // CREATE
      const { error } = await supabase.from("penduduk").insert([formInput]);

      if (error) {
        setError("Gagal menambah data: " + error.message);
      } else {
        // alert("Data berhasil ditambahkan!");
      }
    }

    resetForm();
    setLoading(false);
    fetchPenduduk(); // Muat ulang data
  };

  // --- DELETE (Menghapus Data) ---
  const handleDelete = async (id) => {
    // Mengganti window.confirm() dengan simulasi karena alert/confirm dilarang
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    setLoading(true);
    const { error } = await supabase.from("penduduk").delete().eq("id", id);

    if (error) {
      setError("Gagal menghapus data: " + error.message);
    } else {
      // alert("Data berhasil dihapus!");
    }
    setLoading(false);
    fetchPenduduk(); // Muat ulang data
  };

  // Fungsi untuk mode Edit
  const handleEditClick = (item) => {
    setIsEditing(true);
    setCurrentData(item);
    // Isi form dengan data item yang akan diedit
    setFormInput({
      nik: item.nik,
      nama_lengkap: item.nama_lengkap,
      tempat_lahir: item.tempat_lahir,
      tanggal_lahir: item.tanggal_lahir,
      jenis_kelamin: item.jenis_kelamin,
      agama: item.agama,
      status_perkawinan: item.status_perkawinan,
      dusun: item.dusun,
      pendidikan: item.pendidikan,
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard Admin Penduduk 🏘️</h1>
      {loading && <p style={{ color: "blue" }}>Memuat data...</p>}
      {error && <p style={{ color: "red", border: "1px solid red", padding: "10px" }}>Error: {error}. Harap cek RLS Supabase Anda.</p>}

      {/* Form Tambah/Edit */}
      <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "5px", marginTop: "30px" }}>{isEditing ? "Edit Data" : "Tambah Data Baru"}</h2>
      <form onSubmit={handleSubmit} style={formContainerStyle}>
        {/* Input Fields */}
        <input name="nik" value={formInput.nik} onChange={handleInputChange} placeholder="NIK" required style={inputStyle} readOnly={isEditing} />
        <input name="nama_lengkap" value={formInput.nama_lengkap} onChange={handleInputChange} placeholder="Nama Lengkap" required style={inputStyle} />
        <input name="jenis_kelamin" value={formInput.jenis_kelamin} onChange={handleInputChange} placeholder="Jenis Kelamin" style={inputStyle} />
        <input name="tempat_lahir" value={formInput.tempat_lahir} onChange={handleInputChange} placeholder="Tempat Lahir" style={inputStyle} />
        <input name="tanggal_lahir" value={formInput.tanggal_lahir} onChange={handleInputChange} placeholder="Tgl Lahir (YYYY-MM-DD)" style={inputStyle} />
        <input name="status_perkawinan" value={formInput.status_perkawinan} onChange={handleInputChange} placeholder="Status Kawin" style={inputStyle} />
        <input name="agama" value={formInput.agama} onChange={handleInputChange} placeholder="Agama" style={inputStyle} />
        <input name="dusun" value={formInput.dusun} onChange={handleInputChange} placeholder="Dusun" style={inputStyle} />
        <input name="pendidikan" value={formInput.pendidikan} onChange={handleInputChange} placeholder="Pendidikan" style={inputStyle} />

        {/* Buttons */}
        <div style={{ gridColumn: "span 3", marginTop: "10px" }}>
          <button type="submit" disabled={loading} style={submitButtonStyle}>
            {loading ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Data"}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} style={cancelButtonStyle}>
              Batal Edit
            </button>
          )}
        </div>
      </form>

      {/* Tabel Tampilan Data */}
      <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "5px", marginTop: "30px" }}>Data Penduduk ({penduduk.length} total)</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={tableHeaderStyle}>NIK</th>
              <th style={tableHeaderStyle}>Nama</th>
              <th style={tableHeaderStyle}>JK</th>
              <th style={tableHeaderStyle}>Dusun</th>
              <th style={tableHeaderStyle}>Pendidikan</th>
              <th style={tableHeaderStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {penduduk.map((item) => (
              <tr key={item.id}>
                <td style={tableCellStyle}>{item.nik}</td>
                <td style={tableCellStyle}>{item.nama_lengkap}</td>
                <td style={tableCellStyle}>{item.jenis_kelamin}</td>
                <td style={tableCellStyle}>{item.dusun}</td>
                <td style={tableCellStyle}>{item.pendidikan}</td>
                <td style={tableCellStyle}>
                  <button onClick={() => handleEditClick(item)} style={editButtonStyle}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={deleteButtonStyle}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styling (Dibuat sebagai objek JS agar mudah diakses)
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "15px",
  minWidth: "600px",
};
const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
  backgroundColor: "#e9ecef",
};
const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  fontSize: "0.9em",
};
const formContainerStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  marginBottom: "20px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "10px",
  borderRadius: "6px",
};
const inputStyle = {
  padding: "10px",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #ddd",
  borderRadius: "4px",
};
const submitButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "10px",
};
const cancelButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const editButtonStyle = {
  marginRight: "5px",
  padding: "5px 10px",
  backgroundColor: "#ffc107",
  color: "black",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const deleteButtonStyle = {
  padding: "5px 10px",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default AdminDashboard;
