import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Plus, Image as ImageIcon, Loader2, Newspaper, Eye } from "lucide-react";

export default function BeritaAdmin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalImageUrl = form.image_url;
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      const payload = {
        ...form,
        image_url: finalImageUrl,
        views: 0,
      };

      const { error } = await supabase.from("berita").insert([payload]);
      if (error) throw error;

      alert("✅ Berita berhasil disimpan!");
      setForm({ title: "", description: "", content: "", image_url: "" });
      setSelectedFile(null);
      setPreviewUrl("");
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

      {/* Form Tambah Berita */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl mb-8">
        <h2 className="text-xl font-semibold text-white border-b border-white/20 pb-3 mb-6 flex items-center gap-2">
          <Plus size={20} className="text-green-400" />
          Tambah Berita Baru
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Judul Berita</label>
            <input 
              type="text" 
              className="w-full border-2 border-white/30 bg-white/90 rounded-xl p-3 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all" 
              required 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              placeholder="Masukkan judul berita..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Deskripsi Singkat</label>
            <textarea 
              className="w-full border-2 border-white/30 bg-white/90 rounded-xl p-3 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all" 
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
              className="w-full border-2 border-white/30 bg-white/90 rounded-xl p-3 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all" 
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
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <ImageIcon size={32} className="text-blue-200 mb-2" />
              <p className="text-sm text-blue-200">
                {selectedFile ? selectedFile.name : "Klik untuk upload gambar"}
              </p>
            </div>
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="mt-4 h-40 w-full object-cover rounded-xl border-2 border-white/30 shadow-lg" 
              />
            )}
          </div>

          <button 
            type="submit" 
            disabled={uploading} 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all w-full font-bold shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" /> Mengupload...
              </>
            ) : (
              <>
                <Plus size={20} /> Simpan Berita
              </>
            )}
          </button>
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
                      <img 
                        src={item.image_url || "https://placehold.co/100"} 
                        className="w-16 h-16 rounded-xl object-cover border border-white/20" 
                        alt={item.title}
                      />
                    </td>
                    <td className="p-4 text-white font-medium">{item.title}</td>
                    <td className="p-4 text-center text-blue-200">{item.views || 0}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                      >
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