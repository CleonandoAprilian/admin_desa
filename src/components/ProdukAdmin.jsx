import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Image as ImageIcon, Loader2, Pencil, X, ShoppingBag, Star } from "lucide-react";

export default function ProdukAdmin() {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    content: "",
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
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

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      content: item.content || "",
      operating_hours: item.operating_hours,
      address: item.address,
      contact: item.contact,
      rating: item.rating,
      image_url: item.image_url,
    });
    setPreviewUrl(item.image_url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = form.image_url;

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const payload = {
        name: form.name,
        description: form.description,
        content: form.content,
        operating_hours: form.operating_hours,
        address: form.address,
        contact: form.contact,
        rating: form.rating,
        image_url: imageUrl,
      };

      if (editingId) {
        const { error } = await supabase.from("produk").update(payload).eq("id", editingId);
        if (error) throw error;
        alert("✅ Produk berhasil diperbarui!");
      } else {
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Produk UMKM</h1>
                <p className="text-purple-200 text-sm">Kelola produk unggulan desa</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-white">{data.length}</p>
              <p className="text-purple-200 text-sm">Total Produk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl mb-8">
        <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {editingId ? <Pencil size={20} className="text-yellow-400" /> : <ShoppingBag size={20} className="text-purple-400" />}
            {editingId ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          {editingId && (
            <button 
              onClick={resetForm} 
              className="text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <X size={16} /> Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            className="border-2 border-white/30 bg-white/90 p-3 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
            placeholder="Nama Produk" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            required 
          />
          
          <input 
            type="text" 
            className="border-2 border-white/30 bg-white/90 p-3 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
            placeholder="Jam Operasional" 
            value={form.operating_hours} 
            onChange={(e) => setForm({ ...form, operating_hours: e.target.value })} 
          />
          
          <input 
            type="text" 
            className="border-2 border-white/30 bg-white/90 p-3 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
            placeholder="Alamat" 
            value={form.address} 
            onChange={(e) => setForm({ ...form, address: e.target.value })} 
          />
          
          <input 
            type="text" 
            className="border-2 border-white/30 bg-white/90 p-3 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
            placeholder="Kontak (WA)" 
            value={form.contact} 
            onChange={(e) => setForm({ ...form, contact: e.target.value })} 
          />
          
          <input 
            type="number" 
            step="0.1" 
            className="border-2 border-white/30 bg-white/90 p-3 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
            placeholder="Rating (1-5)" 
            value={form.rating} 
            onChange={(e) => setForm({ ...form, rating: e.target.value })} 
          />

          {/* Upload Image */}
          <div className="md:col-span-2">
            <div className="border-2 border-dashed border-white/30 bg-white/5 p-4 rounded-xl relative hover:bg-white/10 text-center cursor-pointer transition-all">
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <p className="text-blue-200 flex justify-center items-center gap-2">
                <ImageIcon size={18} /> 
                {selectedFile ? selectedFile.name : editingId ? "Ganti Foto (Opsional)" : "Upload Foto Produk"}
              </p>
            </div>
            {previewUrl && (
              <img 
                src={previewUrl} 
                className="mt-4 h-40 w-full object-cover rounded-xl border-2 border-white/30 shadow-lg" 
                alt="Preview" 
              />
            )}
          </div>

          <textarea 
            className="md:col-span-2 border-2 border-white/30 bg-white/90 p-3 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
            rows="2" 
            placeholder="Deskripsi Singkat" 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
          />

          <textarea 
            className="md:col-span-2 border-2 border-white/30 bg-white/90 p-3 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
            rows="5" 
            placeholder="Konten Lengkap / Cerita Produk..." 
            value={form.content} 
            onChange={(e) => setForm({ ...form, content: e.target.value })} 
          />

          <button 
            type="submit" 
            disabled={uploading} 
            className={`md:col-span-2 ${
              editingId 
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-500/30" 
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/30"
            } text-white py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50`}
          >
            {uploading ? (
              <Loader2 className="animate-spin" />
            ) : editingId ? (
              <>
                <Pencil size={18} /> Update Produk
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> Simpan Produk
              </>
            )}
          </button>
        </form>
      </div>

      {/* Grid Produk */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div 
            key={item.id} 
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden hover:scale-105 transition-transform"
          >
            <img 
              src={item.image_url || "https://placehold.co/400x300"} 
              className="h-48 w-full object-cover" 
              alt={item.name} 
            />
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-lg font-medium">
                  <Star size={12} fill="currentColor" />
                  {item.rating}
                </span>
              </div>
              <p className="text-blue-200 text-sm mb-4 line-clamp-2">{item.description}</p>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/20">
                <button 
                  onClick={() => handleEdit(item)} 
                  className="text-yellow-400 hover:bg-yellow-500/10 p-2 rounded-lg transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                >
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