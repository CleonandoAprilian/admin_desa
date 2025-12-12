import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Loader2, Image as ImageIcon, Pencil, X } from "lucide-react";

export default function PotensiAdmin() {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // State untuk mode Edit
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    content: "", // Field baru
    operating_hours: "",
    address: "",
    contact: "",
    rating: "4.8",
    image_url: "",
  });

  const fetchData = async () => {
    const { data } = await supabase.from("potensi").select("*").order("id", { ascending: false });
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
      const fileName = `wisata-${Date.now()}-${file.name.replace(/\s/g, "-")}`;
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
      rating: "4.8",
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
      let imageUrl = form.image_url; // Gunakan gambar lama defaultnya

      // Jika user upload file baru
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
        // --- UPDATE ---
        const { error } = await supabase.from("potensi").update(payload).eq("id", editingId);
        if (error) throw error;
        alert("✅ Data berhasil diperbarui!");
      } else {
        // --- INSERT ---
        const { error } = await supabase.from("potensi").insert([payload]);
        if (error) throw error;
        alert("✅ Data berhasil ditambahkan!");
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
    if (confirm("Hapus data ini?")) {
      await supabase.from("potensi").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Potensi Wisata Desa</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-xl text-gray-700">{editingId ? "✏️ Edit Wisata" : "➕ Tambah Wisata Baru"}</h2>
          {editingId && (
            <button onClick={resetForm} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg flex items-center gap-1 text-sm font-medium">
              <X size={16} /> Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Nama Tempat Wisata" className="border p-3 rounded-lg" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="text" placeholder="Jam Buka" className="border p-3 rounded-lg" value={form.operating_hours} onChange={(e) => setForm({ ...form, operating_hours: e.target.value })} />
          <input type="text" placeholder="Lokasi" className="border p-3 rounded-lg" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input type="text" placeholder="Kontak Pengelola" className="border p-3 rounded-lg" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <input type="number" step="0.1" placeholder="Rate" className="border p-3 rounded-lg" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />

          {/* INPUT IMAGE */}
          <div className="md:col-span-2">
            <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer relative hover:bg-gray-50 transition">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <p className="text-gray-500 flex justify-center items-center gap-2">
                <ImageIcon size={18} /> {selectedFile ? selectedFile.name : editingId ? "Ganti Foto (Opsional)" : "Klik untuk Upload Foto Wisata"}
              </p>
            </div>
            {previewUrl && <img src={previewUrl} className="mt-4 h-40 w-full object-cover rounded-lg border" alt="Preview" />}
          </div>

          <textarea placeholder="Deskripsi Singkat" className="border p-3 rounded-lg md:col-span-2" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          {/* INPUT CONTENT BARU */}
          <textarea placeholder="Konten Lengkap / Artikel Wisata..." className="border p-3 rounded-lg md:col-span-2" rows="5" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />

          <button type="submit" disabled={uploading} className={`${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white py-3 rounded-lg md:col-span-2 font-bold flex justify-center gap-2 transition`}>
            {uploading ? <Loader2 className="animate-spin" /> : editingId ? "Update Data Wisata" : "Simpan Data Wisata"}
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 items-start">
            <img src={item.image_url || "https://placehold.co/100"} className="w-24 h-24 object-cover rounded-lg bg-gray-100 flex-shrink-0" alt={item.name} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-gray-800 truncate pr-2">{item.name}</h4>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex-shrink-0">⭐ {item.rating}</span>
              </div>
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-500 mt-1 mb-2">{item.address}</p>

                <div className="flex gap-2 mt-3 justify-end">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
