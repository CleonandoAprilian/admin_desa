import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Plus, Image as ImageIcon } from "lucide-react";

export default function BeritaAdmin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
  });

  // ================= FETCH DATA =================
  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("berita").select("*").order("created_at", { ascending: false });

    setData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("berita").insert([form]);
      if (error) throw error;

      alert("✅ Berita berhasil disimpan!");
      setForm({ title: "", description: "", content: "", image_url: "" });
      fetchData();
    } catch (err) {
      alert("❌ Gagal menyimpan: " + err.message);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus berita ini?")) return;

    await supabase.from("berita").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">📰 Kelola Berita</h1>

      {/* FORM INPUT */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 max-w-3xl">
        <h2 className="font-semibold text-lg mb-6">Tambah Berita Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-600">Judul</label>
            <input
              type="text"
              placeholder="Masukkan judul berita"
              className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Deskripsi Singkat</label>
            <textarea
              placeholder="Deskripsi singkat berita"
              className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Isi Berita</label>
            <textarea
              placeholder="Isi lengkap berita..."
              className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">URL Gambar</label>

            <div className="relative">
              <ImageIcon size={18} className="absolute left-3 top-3 text-gray-400" />

              <input
                type="url"
                placeholder="https://example.com/gambar.jpg"
                className="w-full border rounded-lg pl-10 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>

            {/* Preview */}
            {form.image_url && <img src={form.image_url} alt="Preview" className="mt-3 h-32 rounded-lg object-cover border" />}
          </div>

          <button type="submit" className="bg-blue-600 text-black px-5 py-3 rounded-lg flex items-center gap-2 transition">
            <Plus size={16} />
            Simpan Berita
          </button>
        </form>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4">Gambar</th>
              <th className="p-4">Judul</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-500">
                  Loading data...
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">
                    <img src={item.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  </td>
                  <td className="p-4 font-medium text-gray-800">{item.title}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
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
