import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Image as ImageIcon } from "lucide-react";

export default function PanduanAdmin() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    stepsText: "",
    reqText: "",
    image_url: "",
  });

  const fetchData = async () => {
    const { data } = await supabase.from("panduan").select("*").order("created_at", { ascending: false });

    setData(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // TEXT ➜ ARRAY
      const stepsArray = form.stepsText.split("\n").filter((line) => line.trim() !== "");

      const reqArray = form.reqText.split("\n").filter((line) => line.trim() !== "");

      const payload = {
        title: form.title,
        description: form.description,
        content: form.content,
        image_url: form.image_url,
        steps: stepsArray,
        requirements: reqArray,
      };

      const { error } = await supabase.from("panduan").insert([payload]);
      if (error) throw error;

      alert("✅ Panduan berhasil disimpan!");
      setForm({
        title: "",
        description: "",
        content: "",
        stepsText: "",
        reqText: "",
        image_url: "",
      });

      fetchData();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus panduan ini?")) {
      await supabase.from("panduan").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">📘 Kelola Panduan Layanan</h1>

      {/* FORM INPUT */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 max-w-4xl">
        <h2 className="font-semibold text-lg mb-6">Tambah Panduan Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-600">Judul Panduan</label>
            <input type="text" className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Deskripsi Singkat</label>
            <textarea rows="2" className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Isi Penjelasan</label>
            <textarea rows="3" className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>

          {/* STEPS & REQUIREMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-sm mb-1 block">Langkah-langkah (1 baris 1 langkah)</label>
              <textarea
                className="w-full border p-3 rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                rows="5"
                value={form.stepsText}
                onChange={(e) => setForm({ ...form, stepsText: e.target.value })}
                placeholder={`Contoh:
Datang ke RT
Isi formulir
Serahkan berkas`}
              />
            </div>

            <div>
              <label className="font-semibold text-sm mb-1 block">Persyaratan Dokumen</label>
              <textarea
                className="w-full border p-3 rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                rows="5"
                value={form.reqText}
                onChange={(e) => setForm({ ...form, reqText: e.target.value })}
                placeholder={`Contoh:
KTP
KK
Surat pengantar`}
              />
            </div>
          </div>

          {/* INPUT IMAGE URL */}
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">URL Gambar</label>
            <div className="relative">
              <ImageIcon size={18} className="absolute top-3 left-3 text-gray-400" />
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="w-full border rounded-lg pl-10 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>

            {/* Preview */}
            {form.image_url && <img src={form.image_url} alt="Preview" className="mt-3 h-32 w-full object-cover rounded-lg border" />}
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-black px-5 py-3 rounded-lg w-full transition font-semibold">
            Simpan Panduan
          </button>
        </form>
      </div>

      {/* LIST DATA */}
      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-xl shadow-md flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={item.image_url} alt="" className="w-14 h-14 object-cover rounded-lg" />
              <strong className="text-gray-800 text-lg">{item.title}</strong>
            </div>

            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-100 p-3 rounded-lg transition">
              <Trash size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
