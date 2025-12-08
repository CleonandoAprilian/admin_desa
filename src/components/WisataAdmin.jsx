import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Loader2 } from "lucide-react";

export default function PotensiAdmin() {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    operating_hours: "",
    address: "",
    contact: "",
    rating: "4.8",
  });

  // ✅ GANTI dari imageFile ke imageUrl
  const [imageUrl, setImageUrl] = useState("");

  const fetchData = async () => {
    const { data } = await supabase.from("potensi").select("*").order("id", { ascending: false });

    setData(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const payload = {
        ...form,
        image_url: imageUrl, // ✅ langsung simpan URL
      };

      const { error } = await supabase.from("potensi").insert([payload]);
      if (error) throw error;

      alert("Data berhasil ditambahkan!");

      setForm({
        name: "",
        description: "",
        operating_hours: "",
        address: "",
        contact: "",
        rating: "4.8",
      });

      setImageUrl("");
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus data ini?")) {
      await supabase.from("potensi").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Potensi Wisata Desa</h1>

      {/* FORM INPUT */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Nama Tempat Wisata" className="border p-3 rounded-lg" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <input type="text" placeholder="Jam Buka" className="border p-3 rounded-lg" value={form.operating_hours} onChange={(e) => setForm({ ...form, operating_hours: e.target.value })} />

          <input type="text" placeholder="Lokasi" className="border p-3 rounded-lg" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <input type="text" placeholder="Kontak Pengelola" className="border p-3 rounded-lg" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />

          <div className="flex gap-4">
            <input type="number" step="0.1" placeholder="Rate" className="border p-3 rounded-lg w-24" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />

            {/* ✅ INPUT URL GAMBAR */}
            <input type="text" placeholder="Link Gambar (URL)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="border p-3 rounded-lg flex-1 bg-gray-50" />
          </div>

          <textarea placeholder="Deskripsi Wisata" className="border p-3 rounded-lg md:col-span-2" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <button type="submit" disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg md:col-span-2 font-bold flex justify-center gap-2">
            {uploading ? <Loader2 className="animate-spin" /> : "Simpan Data Wisata"}
          </button>
        </form>
      </div>

      {/* DATA LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 items-center">
            <img src={item.image_url} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />

            <div className="flex-1">
              <h4 className="font-bold text-lg">{item.name}</h4>
              <p className="text-sm text-gray-500">{item.address}</p>
            </div>

            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
              <Trash size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
