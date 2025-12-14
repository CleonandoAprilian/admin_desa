import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../SupabaseClients";
import { Plus, Edit, Trash, Loader2, XCircle, Download, Users } from "lucide-react";
import * as XLSX from "xlsx";

function AdminDashboard() {
  const [penduduk, setPenduduk] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [error, setError] = useState(null);

  // State untuk Form Input
  const [formInput, setFormInput] = useState({
    nik: "",
    no_kk: "",
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
      no_kk: "",
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

    // 1. Copy data dari form
    const dataToSubmit = { ...formInput };

    // 2. PERBAIKAN TANGGAL: Ubah string kosong "" menjadi null
    if (dataToSubmit.tanggal_lahir === "") {
      dataToSubmit.tanggal_lahir = null;
    }

    try {
      if (isEditing && currentData) {
        // --- UPDATE ---
        // Anda mungkin ingin menghapus NIK dan NoKK dari dataToSubmit jika Supabase melarang update kolom Primary Key/Unique.
        // delete dataToSubmit.nik;
        // delete dataToSubmit.no_kk;

        const { error } = await supabase.from("penduduk").update(dataToSubmit).eq("id", currentData.id); // Pastikan update berdasarkan ID

        if (error) throw error;
        alert("Data berhasil diupdate!");
      } else {
        // --- CREATE (Insert) ---

        // 3. PEMBERSIHAN ID: Pastikan tidak ada properti 'id' yang terkirim saat Insert
        delete dataToSubmit.id;

        const { error } = await supabase.from("penduduk").insert([dataToSubmit]);

        if (error) throw error;
        alert("Data berhasil ditambahkan!");
      }

      // Jika sukses:
      resetForm();
      fetchPenduduk();
    } catch (err) {
      // 4. PENANGANAN ERROR 409 (DUPLIKAT NIK/NoKK - jika NoKK juga unik)
      if (err.code === "23505" || err.message.includes("duplicate")) {
        // Asumsi '23505' untuk unique constraint violation
        setError("GAGAL: NIK atau Nomor KK tersebut sudah terdaftar! Mohon periksa kembali.");
      } else {
        setError("Gagal menyimpan: " + err.message);
      }
    } finally {
      setLoading(false);
    }
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
    setFormInput({
      nik: item.nik || "",
      no_kk: item.no_kk || "",
      nama_lengkap: item.nama_lengkap || "",
      tempat_lahir: item.tempat_lahir || "",
      tanggal_lahir: item.tanggal_lahir || "",
      jenis_kelamin: item.jenis_kelamin || "",
      agama: item.agama || "",
      status_perkawinan: item.status_perkawinan || "",
      dusun: item.dusun || "",
      pendidikan: item.pendidikan || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ FUNGSI DOWNLOAD EXCEL
  const handleDownloadExcel = () => {
    if (penduduk.length === 0) {
      alert("Tidak ada data untuk diunduh!");
      return;
    }

    // Format data untuk Excel
    const dataForExcel = penduduk.map((item, index) => ({
      No: index + 1,
      NIK: item.nik,
      NoKK: item.no_kk,
      "Nama Lengkap": item.nama_lengkap,
      "Tempat Lahir": item.tempat_lahir,
      "Tanggal Lahir": item.tanggal_lahir,
      "Jenis Kelamin": item.jenis_kelamin,
      Agama: item.agama,
      "Status Perkawinan": item.status_perkawinan,
      Dusun: item.dusun,
      Pendidikan: item.pendidikan,
    }));

    // Buat worksheet dan workbook
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Penduduk");

    // Set column widths (Disesuaikan dengan penambahan NoKK)
    worksheet["!cols"] = [
      { wch: 5 }, // No
      { wch: 18 }, // NIK
      { wch: 20 }, // Nama
      { wch: 15 }, // Tempat Lahir
      { wch: 15 }, // Tanggal Lahir
      { wch: 15 }, // JK
      { wch: 12 }, // Agama
      { wch: 18 }, // Status
      { wch: 15 }, // Dusun
      { wch: 18 }, // Pendidikan
    ];

    // Download file
    const fileName = `Data_Penduduk_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="min-h-screen">
      {/* Header dengan Statistik */}
      <div className="mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Data Penduduk</h1>
                <p className="text-blue-200 text-sm">Kelola data penduduk Desa Sidoarum</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-white">{penduduk.length}</p>
              <p className="text-blue-200 text-sm">Total Penduduk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifikasi Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm font-medium flex items-start gap-2 animate-shake">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Form Tambah/Edit Data */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl mb-8">
        <h2 className="text-xl font-semibold text-white border-b border-white/20 pb-3 mb-4 flex items-center gap-2">
          {isEditing ? <Edit size={20} className="text-yellow-400" /> : <Plus size={20} className="text-blue-400" />}
          {isEditing ? `Edit Data: ${currentData?.nama_lengkap}` : "Tambah Data Penduduk Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            name="nik"
            value={formInput.nik}
            onChange={handleInputChange}
            placeholder="NIK (Nomor Induk Kependudukan)"
            required
            className={`p-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${isEditing ? "bg-gray-200 cursor-not-allowed border-gray-300" : "bg-white/90 border-white/30"}`}
            readOnly={isEditing}
            disabled={loading}
          />

          {/* ✅ TAMBAHAN: Input NoKK */}
          <input
            name="no_kk"
            value={formInput.no_kk}
            onChange={handleInputChange}
            placeholder="No. KK (Nomor Kartu Keluarga)"
            required
            className={`p-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${isEditing ? "bg-gray-200 cursor-not-allowed border-gray-300" : "bg-white/90 border-white/30"}`}
            disabled={loading}
          />

          <input
            name="nama_lengkap"
            value={formInput.nama_lengkap}
            onChange={handleInputChange}
            placeholder="Nama Lengkap"
            required
            className="p-3 border-2 border-white/30 bg-white/90 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />

          <input
            name="tempat_lahir"
            value={formInput.tempat_lahir}
            onChange={handleInputChange}
            placeholder="Tempat Lahir"
            className="p-3 border-2 border-white/30 bg-white/90 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />

          <input
            name="tanggal_lahir"
            value={formInput.tanggal_lahir}
            onChange={handleInputChange}
            placeholder="Tanggal Lahir"
            type="date"
            className="p-3 border-2 border-white/30 bg-white/90 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />

          <select
            name="jenis_kelamin"
            value={formInput.jenis_kelamin}
            onChange={handleInputChange}
            className="p-3 border-2 border-white/30 bg-white/90 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          >
            <option value="">-- Jenis Kelamin --</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          <input
            name="agama"
            value={formInput.agama}
            onChange={handleInputChange}
            placeholder="Agama"
            className="p-3 border-2 border-white/30 bg-white/90 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />

          <input
            name="status_perkawinan"
            value={formInput.status_perkawinan}
            onChange={handleInputChange}
            placeholder="Status Perkawinan"
            className="p-3 border-2 border-white/30 bg-white/90 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />

          <input
            name="dusun"
            value={formInput.dusun}
            onChange={handleInputChange}
            placeholder="Dusun"
            className="p-3 border-2 border-white/30 bg-white/90 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />

          <input
            name="pendidikan"
            value={formInput.pendidikan}
            onChange={handleInputChange}
            placeholder="Pendidikan Terakhir"
            className="p-3 border-2 border-white/30 bg-white/90 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />

          <div className="lg:col-span-3 flex gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 ${
                isEditing
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-yellow-500/30"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/30"
              }`}
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
              <button type="button" onClick={resetForm} className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold transition-all shadow-lg">
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabel Data */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
          <h2 className="text-xl font-semibold text-white">
            Data Penduduk Aktif <span className="font-normal text-sm text-blue-200">({penduduk.length} total)</span>
          </h2>

          {/* ✅ TOMBOL DOWNLOAD EXCEL */}
          <button
            onClick={handleDownloadExcel}
            disabled={loading || penduduk.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Download Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-200 uppercase tracking-wider">NIK</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-200 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-200 uppercase tracking-wider">JK</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-200 uppercase tracking-wider">Dusun</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-200 uppercase tracking-wider">Pendidikan</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-200 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-white">
                    {" "}
                    <Loader2 className="animate-spin inline-block mr-2" size={20} /> Memuat data...
                  </td>
                </tr>
              ) : penduduk.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-white">
                    {" "}
                    Tidak ada data penduduk yang ditemukan.
                  </td>
                </tr>
              ) : (
                penduduk.map((item) => (
                  <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-white">{item.nik}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{item.nama_lengkap}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-200">{item.jenis_kelamin}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-200">{item.dusun}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-200">{item.pendidikan}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button onClick={() => handleEditClick(item)} className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-500/10 transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors ml-2">
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

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
