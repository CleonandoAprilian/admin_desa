import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Plus, Image as ImageIcon, Loader2, Newspaper, Eye, Pencil, X } from "lucide-react";

export default function BeritaAdmin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // State untuk form dan file
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
  });

  // State khusus Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("berita").select("*").order("created_at", { ascending: false });
    setData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
      const { error } = await supabase.storage.from("images").upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload Error:", error);
      throw new Error("Gagal mengupload gambar");
    }
  };

  // Fungsi untuk mengisi form saat tombol edit ditekan
  const handleEdit = (item) => {
    setForm({
      title: item.title,
      description: item.description,
      content: item.content,
      image_url: item.image_url,
    });
    setPreviewUrl(item.image_url);
    setIsEditing(true);
    setEditId(item.id);

    // Scroll ke atas agar user melihat form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fungsi untuk membatalkan edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({ title: "", description: "", content: "", image_url: "" });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalImageUrl = form.image_url;

      // Jika ada file baru dipilih, upload dulu
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      const payload = {
        title: form.title,
        description: form.description,
        content: form.content,
        image_url: finalImageUrl,
      };

      if (isEditing) {
        // --- LOGIKA UPDATE ---
        const { error } = await supabase.from("berita").update(payload).eq("id", editId);

        if (error) throw error;
        alert("✅ Berita berhasil diperbarui!");
      } else {
        // --- LOGIKA INSERT (BARU) ---
        const { error } = await supabase.from("berita").insert([{ ...payload, views: 0 }]);

        if (error) throw error;
        alert("✅ Berita berhasil disimpan!");
      }

      // Reset Form
      handleCancelEdit();
      fetchData();
    } catch (err) {
      alert("❌ Gagal menyimpan: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus berita ini?")) return;
    await supabase.from("berita").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Berita Desa</h1>
                <p className="text-green-200 text-sm">Kelola berita dan informasi desa</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-white">{data.length}</p>
              <p className="text-green-200 text-sm">Total Berita</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Tambah/Edit Berita */}
      <div className={`backdrop-blur-xl rounded-2xl p-6 border shadow-2xl mb-8 transition-colors duration-300 ${isEditing ? "bg-blue-900/40 border-blue-500/30" : "bg-white/10 border-white/20"}`}>
        <h2 className="text-xl font-semibold text-white border-b border-white/20 pb-3 mb-6 flex items-center gap-2">
          {isEditing ? (
            <>
              <Pencil size={20} className="text-blue-400" />
              Edit Berita
            </>
          ) : (
            <>
              <Plus size={20} className="text-green-400" />
              Tambah Berita Baru
            </>
          )}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Judul Berita</label>
            <input
              type="text"
              className="w-full border-2 border-white/30 bg-white/90 rounded-xl p-3 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-800"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Masukkan judul berita..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Deskripsi Singkat</label>
            <textarea
              className="w-full border-2 border-white/30 bg-white/90 rounded-xl p-3 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-800"
              rows="2"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ringkasan berita..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Isi Berita Lengkap</label>
            <textarea
              className="w-full border-2 border-white/30 bg-white/90 rounded-xl p-3 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-800"
              rows="6"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Tulis isi berita lengkap di sini..."
            />
          </div>

          {/* Upload Gambar */}
          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Gambar Berita</label>
            <div className="border-2 border-dashed border-white/30 bg-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <ImageIcon size={32} className="text-blue-200 mb-2" />
              <p className="text-sm text-blue-200">{selectedFile ? selectedFile.name : isEditing && form.image_url ? "Ganti gambar (Opsional)" : "Klik untuk upload gambar"}</p>
            </div>
            {previewUrl && (
              <div className="relative mt-4 w-full h-40 group">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-xl border-2 border-white/30 shadow-lg" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {isEditing && (
              <button type="button" onClick={handleCancelEdit} className="bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/50 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold">
                <X size={20} /> Batal
              </button>
            )}

            <button
              type="submit"
              disabled={uploading}
              className={`flex-1 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isEditing
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/30"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" /> {isEditing ? "Memperbarui..." : "Mengupload..."}
                </>
              ) : (
                <>
                  {isEditing ? <Pencil size={20} /> : <Plus size={20} />}
                  {isEditing ? "Update Berita" : "Simpan Berita"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Data Berita */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">
            Daftar Berita <span className="text-sm font-normal text-blue-200">({data.length} total)</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="p-4 text-left text-xs font-semibold text-blue-200 uppercase">Gambar</th>
                <th className="p-4 text-left text-xs font-semibold text-blue-200 uppercase">Judul</th>
                <th className="p-4 text-center text-xs font-semibold text-blue-200 uppercase">
                  <Eye size={16} className="inline mr-1" />
                  Views
                </th>
                <th className="p-4 text-center text-xs font-semibold text-blue-200 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-white">
                    <Loader2 className="animate-spin inline mr-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-blue-200">
                    Belum ada berita yang ditambahkan
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <img src={item.image_url || "https://placehold.co/100"} className="w-16 h-16 rounded-xl object-cover border border-white/20" alt={item.title} />
                    </td>
                    <td className="p-4 text-white font-medium">
                      <div className="font-bold">{item.title}</div>
                      <div className="text-xs text-blue-200 truncate w-48">{item.description}</div>
                    </td>
                    <td className="p-4 text-center text-blue-200">{item.views || 0}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol Edit */}
                        <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 rounded-lg transition-colors" title="Edit">
                          <Pencil size={18} />
                        </button>

                        {/* Tombol Hapus */}
                        <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Hapus">
                          <Trash size={18} />
                        </button>
                      </div>
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
