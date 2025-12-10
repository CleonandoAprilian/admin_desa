import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Image as ImageIcon, Loader2 } from "lucide-react";

export default function ProdukAdmin() {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    operating_hours: "",
    address: "",
    contact: "",
    rating: "5.0",
  });

  const fetchData = async () => {
    const { data } = await supabase.from("produk").select("*").order("id", { ascending: false });
    setData(data || []);
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
    // eslint-disable-next-line no-useless-catch
    try {
      const fileName = `produk-${Date.now()}-${file.name.replace(/\s/g, "-")}`;
      const { error } = await supabase.storage.from("images").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = "";
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const payload = { ...form, image_url: imageUrl };

      const { error } = await supabase.from("produk").insert([payload]);
      if (error) throw error;

      alert("✅ Produk berhasil disimpan!");
      setForm({ name: "", description: "", operating_hours: "", address: "", contact: "", rating: "5.0" });
      setSelectedFile(null);
      setPreviewUrl("");
      fetchData();
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setUploading(false);
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

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 max-w-5xl">
        <h2 className="font-semibold text-lg mb-6">Tambah Produk Baru</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="text" className="border p-3 rounded-lg" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="text" className="border p-3 rounded-lg" placeholder="Jam Operasional" value={form.operating_hours} onChange={(e) => setForm({ ...form, operating_hours: e.target.value })} />
          <input type="text" className="border p-3 rounded-lg" placeholder="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input type="text" className="border p-3 rounded-lg" placeholder="Kontak (WA)" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <input type="number" step="0.1" className="border p-3 rounded-lg" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />

          {/* UPLOAD IMAGE */}
          <div className="md:col-span-2">
            <div className="border border-dashed border-gray-300 p-4 rounded-lg relative hover:bg-gray-50 text-center">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <p className="text-gray-500 flex justify-center items-center gap-2">
                <ImageIcon size={18} /> {selectedFile ? selectedFile.name : "Upload Foto Produk"}
              </p>
            </div>
            {previewUrl && <img src={previewUrl} className="mt-4 h-40 w-full object-cover rounded-xl border" />}
          </div>

          <textarea className="md:col-span-2 border p-3 rounded-lg" rows="3" placeholder="Deskripsi Produk" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <button type="submit" disabled={uploading} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg md:col-span-2 font-bold transition flex justify-center">
            {uploading ? <Loader2 className="animate-spin" /> : "Simpan Produk"}
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
            <img src={item.image_url || "https://placehold.co/200"} className="h-52 w-full object-cover" />
            <div className="p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold">{item.name}</h3>
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
