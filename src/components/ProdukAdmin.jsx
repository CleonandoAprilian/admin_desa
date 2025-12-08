import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Image as ImageIcon } from "lucide-react";

export default function ProdukAdmin() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    operating_hours: "",
    address: "",
    contact: "",
    rating: "5.0",
    image_url: "",
  });

  const fetchData = async () => {
    const { data } = await supabase.from("produk").select("*").order("id", { ascending: false });

    setData(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...form };

      const { error } = await supabase.from("produk").insert([payload]);
      if (error) throw error;

      alert("✅ Produk berhasil disimpan!");
      setForm({
        name: "",
        description: "",
        operating_hours: "",
        address: "",
        contact: "",
        rating: "5.0",
        image_url: "",
      });
      fetchData();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus produk ini?")) {
      await supabase.from("produk").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">🛍️ Kelola Produk UMKM</h1>

      {/* FORM */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 max-w-5xl">
        <h2 className="font-semibold text-lg mb-6">Tambah Produk Baru</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-semibold">Nama Produk / Usaha</label>
            <input type="text" className="w-full mt-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div>
            <label className="text-sm font-semibold">Jam Operasional</label>
            <input
              type="text"
              className="w-full mt-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              value={form.operating_hours}
              onChange={(e) => setForm({ ...form, operating_hours: e.target.value })}
              placeholder="08.00 - 17.00"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Alamat</label>
            <input type="text" className="w-full mt-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-semibold">Kontak (WA)</label>
            <input type="text" className="w-full mt-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-semibold">Rating</label>
            <input type="number" step="0.1" className="w-full mt-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          </div>

          {/* URL IMAGE */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold mb-1 block">URL Gambar Produk</label>

            <div className="relative">
              <ImageIcon size={18} className="absolute top-3 left-3 text-gray-400" />
              <input
                type="url"
                placeholder="https://contoh.com/gambar.jpg"
                className="w-full border rounded-lg pl-10 p-3 outline-none focus:ring-2 focus:ring-green-500"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>

            {form.image_url && <img src={form.image_url} alt="Preview" className="mt-4 h-40 w-full object-cover rounded-xl border" />}
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Deskripsi Produk</label>
            <textarea className="w-full mt-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg md:col-span-2 font-bold transition">
            Simpan Produk
          </button>
        </form>
      </div>

      {/* LIST PRODUK */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
            <img src={item.image_url} alt="" className="h-52 w-full object-cover" />

            <div className="p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.operating_hours}</p>
                <p className="text-sm">{item.address}</p>
                <p className="text-sm mt-1">📞 {item.contact}</p>
                <p className="text-sm mt-1">⭐ {item.rating}</p>
              </div>

              <button onClick={() => handleDelete(item.id)} className="mt-4 text-red-600 hover:bg-red-100 p-2 rounded-lg self-end">
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
