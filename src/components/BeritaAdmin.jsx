import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Plus, Image as ImageIcon, Loader2 } from "lucide-react";

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

      // ✅ MENAMBAHKAN views: 0 SECARA OTOMATIS
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
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">📰 Kelola Berita</h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 max-w-3xl">
        <h2 className="font-semibold text-lg mb-6">Tambah Berita Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-600">Judul</label>
            <input type="text" className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Deskripsi Singkat</label>
            <textarea className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" rows="2" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Isi Berita</label>
            <textarea className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" rows="5" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>

          {/* INPUT GAMBAR */}
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Gambar Berita</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <ImageIcon size={32} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">{selectedFile ? selectedFile.name : "Klik untuk upload gambar"}</p>
            </div>
            {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 h-32 w-full object-cover rounded-lg border shadow-sm" />}
          </div>

          <button type="submit" disabled={uploading} className="bg-blue-600 text-black px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition hover:bg-blue-700 w-full disabled:bg-gray-400 disabled:cursor-not-allowed">
            {uploading ? (
              <>
                <Loader2 className="animate-spin" /> Mengupload...
              </>
            ) : (
              <>
                <Plus size={16} /> Simpan Berita
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4">Gambar</th>
              <th className="p-4">Judul</th>
              <th className="p-4 text-center">Views</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <img src={item.image_url || "https://placehold.co/100"} className="w-14 h-14 rounded-lg object-cover" />
                  </td>
                  <td className="p-4 font-medium">{item.title}</td>
                  <td className="p-4 text-center text-gray-500">{item.views || 0}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 bg-red-50 p-2 rounded-lg">
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
  );
}
