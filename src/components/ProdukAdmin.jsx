import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Image as ImageIcon, Loader2, Pencil, X } from "lucide-react";

export default function ProdukAdmin() {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // State untuk mode Edit (menyimpan ID produk yang sedang diedit)
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    content: "", // Field baru: Konten
    operating_hours: "",
    address: "",
    contact: "",
    rating: "5.0",
    image_url: "", // Menyimpan URL gambar lama jika tidak diubah saat edit
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

  // Fungsi untuk reset form ke kondisi awal
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      content: "",
      operating_hours: "",
      address: "",
      contact: "",
      rating: "5.0",
      image_url: "",
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingId(null);
  };

  // Fungsi untuk mengaktifkan mode Edit
  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      content: item.content || "", // Handle jika data lama belum punya konten
      operating_hours: item.operating_hours,
      address: item.address,
      contact: item.contact,
      rating: item.rating,
      image_url: item.image_url,
    });
    setPreviewUrl(item.image_url);
    // Scroll ke atas agar user melihat form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = form.image_url; // Pakai gambar lama secara default

      // Jika ada file baru dipilih, upload gambar baru
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const payload = {
        name: form.name,
        description: form.description,
        content: form.content, // Kirim data konten
        operating_hours: form.operating_hours,
        address: form.address,
        contact: form.contact,
        rating: form.rating,
        image_url: imageUrl,
      };

      if (editingId) {
        // --- LOGIKA UPDATE ---
        const { error } = await supabase.from("produk").update(payload).eq("id", editingId);
        if (error) throw error;
        alert("✅ Produk berhasil diperbarui!");
      } else {
        // --- LOGIKA INSERT (BARU) ---
        const { error } = await supabase.from("produk").insert([payload]);
        if (error) throw error;
        alert("✅ Produk berhasil disimpan!");
      }

      resetForm();
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

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 max-w-5xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-lg">{editingId ? "✏️ Edit Produk" : "➕ Tambah Produk Baru"}</h2>
          {editingId && (
            <button onClick={resetForm} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg flex items-center gap-1 text-sm">
              <X size={16} /> Batal Edit
            </button>
          )}
        </div>

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
                <ImageIcon size={18} /> {selectedFile ? selectedFile.name : editingId ? "Ganti Foto (Opsional)" : "Upload Foto Produk"}
              </p>
            </div>
            {previewUrl && <img src={previewUrl} className="mt-4 h-40 w-full object-cover rounded-xl border" alt="Preview" />}
          </div>

          <textarea className="md:col-span-2 border p-3 rounded-lg" rows="2" placeholder="Deskripsi Singkat" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          {/* FIELD BARU: KONTEN */}
          <textarea className="md:col-span-2 border p-3 rounded-lg" rows="5" placeholder="Konten Lengkap / Cerita Produk..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />

          <button type="submit" disabled={uploading} className={`${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white py-3 rounded-lg md:col-span-2 font-bold transition flex justify-center`}>
            {uploading ? <Loader2 className="animate-spin" /> : editingId ? "Update Produk" : "Simpan Produk"}
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
            <img src={item.image_url || "https://placehold.co/200"} className="h-52 w-full object-cover" alt={item.name} />
            <div className="p-5 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm mt-1 mb-2 text-yellow-600 font-medium">⭐ {item.rating}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                {/* TOMBOL EDIT */}
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg flex items-center gap-1 transition">
                  <Pencil size={18} />
                </button>
                {/* TOMBOL DELETE */}
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
