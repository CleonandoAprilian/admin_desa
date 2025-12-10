import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../SupabaseClients";
import { Plus, Edit, Trash, Loader2, XCircle } from "lucide-react"; // Import ikon tambahan

function AdminDashboard() {
  const [penduduk, setPenduduk] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [error, setError] = useState(null);

  // State untuk Form Input
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

  // --- READ (Membaca Data) ---
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

  useEffect(() => {
    fetchPenduduk();
  }, [fetchPenduduk]);

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

  // --- CREATE/UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSubmit = { ...formInput };

    if (isEditing && currentData) {
      // UPDATE
      // Hapus NIK dari payload jika NIK tidak boleh diubah
      delete dataToSubmit.nik;
      const { error } = await supabase.from("penduduk").update(dataToSubmit).eq("id", currentData.id);

      if (error) {
        setError("Gagal mengupdate data: " + error.message);
      } else {
        alert("Data berhasil diupdate!");
      }
    } else {
      // CREATE
      const { error } = await supabase.from("penduduk").insert([dataToSubmit]);

      if (error) {
        setError("Gagal menambah data: " + error.message);
      } else {
        alert("Data berhasil ditambahkan!");
      }
    }

    resetForm();
    setLoading(false);
    fetchPenduduk();
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    setLoading(true);
    const { error } = await supabase.from("penduduk").delete().eq("id", id);

    if (error) {
      setError("Gagal menghapus data: " + error.message);
    } else {
      alert("Data berhasil dihapus!");
    }
    setLoading(false);
    fetchPenduduk();
  };

  // Fungsi untuk mode Edit
  const handleEditClick = (item) => {
    setIsEditing(true);
    setCurrentData(item);
    // Isi form dengan data item yang akan diedit
    setFormInput({
      nik: item.nik || "",
      nama_lengkap: item.nama_lengkap || "",
      tempat_lahir: item.tempat_lahir || "",
      tanggal_lahir: item.tanggal_lahir || "",
      jenis_kelamin: item.jenis_kelamin || "",
      agama: item.agama || "",
      status_perkawinan: item.status_perkawinan || "",
      dusun: item.dusun || "",
      pendidikan: item.pendidikan || "",
    });
    // Scroll ke atas (ke form)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 items-center gap-2">Dashboard Admin Penduduk 🏘️</h1>

      {/* Notifikasi Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>**Error:** {error}. Harap cek RLS Supabase, izin tabel, atau koneksi Anda.</p>
        </div>
      )}

      {/* 1. Form Tambah/Edit Data (Card) */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
          {isEditing ? <Edit size={20} className="text-yellow-500" /> : <Plus size={20} className="text-blue-500" />}
          {isEditing ? `Edit Data: ${currentData?.nama_lengkap}` : "Tambah Data Penduduk Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Input NIK (Read-only saat Edit) */}
          <input
            name="nik"
            value={formInput.nik}
            onChange={handleInputChange}
            placeholder="NIK (Nomor Induk Kependudukan)"
            required
            className={`p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${isEditing ? "bg-gray-200 cursor-not-allowed" : "bg-white border-gray-300"}`}
            readOnly={isEditing}
            title={isEditing ? "NIK tidak dapat diubah saat mode Edit" : "NIK"}
            disabled={loading}
          />

          {/* Input Nama Lengkap */}
          <input
            name="nama_lengkap"
            value={formInput.nama_lengkap}
            onChange={handleInputChange}
            placeholder="Nama Lengkap"
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={loading}
          />

          {/* Input Tempat Lahir */}
          <input
            name="tempat_lahir"
            value={formInput.tempat_lahir}
            onChange={handleInputChange}
            placeholder="Tempat Lahir"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={loading}
          />

          {/* Input Tanggal Lahir (Gunakan type="date" jika ingin input tanggal) */}
          <input
            name="tanggal_lahir"
            value={formInput.tanggal_lahir}
            onChange={handleInputChange}
            placeholder="Tgl Lahir (YYYY-MM-DD)"
            type="date"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={loading}
          />

          {/* Input Jenis Kelamin, Agama, Status Kawin, Dusun, Pendidikan */}
          {/* Ini lebih baik menggunakan <select> untuk konsistensi data */}
          <select name="jenis_kelamin" value={formInput.jenis_kelamin} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" disabled={loading}>
            <option value="">-- Jenis Kelamin --</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          <input name="agama" value={formInput.agama} onChange={handleInputChange} placeholder="Agama" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" disabled={loading} />

          <input
            name="status_perkawinan"
            value={formInput.status_perkawinan}
            onChange={handleInputChange}
            placeholder="Status Perkawinan"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={loading}
          />

          <input name="dusun" value={formInput.dusun} onChange={handleInputChange} placeholder="Dusun" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" disabled={loading} />

          <input
            name="pendidikan"
            value={formInput.pendidikan}
            onChange={handleInputChange}
            placeholder="Pendidikan Terakhir"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={loading}
          />

          {/* Buttons */}
          <div className="lg:col-span-4 flex gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors shadow-md disabled:opacity-50 ${isEditing ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Menyimpan...
                </>
              ) : isEditing ? (
                <>
                  <Edit size={20} /> Simpan Perubahan
                </>
              ) : (
                <>
                  <Plus size={20} /> Tambah Data
                </>
              )}
            </button>

            {isEditing && (
              <button type="button" onClick={resetForm} className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors shadow-md disabled:opacity-50">
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 2. Tabel Tampilan Data (Card) */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">
          Data Penduduk Aktif <span className="font-normal text-sm text-gray-500">({penduduk.length} total)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">NIK</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JK</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dusun</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendidikan</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2" size={20} /> Memuat data...
                  </td>
                </tr>
              ) : penduduk.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    Tidak ada data penduduk yang ditemukan.
                  </td>
                </tr>
              ) : (
                penduduk.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{item.nik}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item.nama_lengkap}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.jenis_kelamin}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.dusun}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.pendidikan}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button onClick={() => handleEditClick(item)} className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-50 transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors ml-2">
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
