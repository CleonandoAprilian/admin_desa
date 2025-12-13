import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Image as ImageIcon, Loader2, Pencil, X, BookOpen, Eye } from "lucide-react";

export default function PanduanAdmin() {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    stepsText: "",
    reqText: "",
    image_url: "",
  });

  const fetchData = async () => {
    const { data, error } = await supabase.from("panduan").select("*").order("created_at", { ascending: false });
    if (error) console.error("Error fetching:", error);
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
      const fileName = `panduan-${Date.now()}-${file.name.replace(/\s/g, "-")}`;
      const { error } = await supabase.storage.from("images").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      throw new Error("Gagal upload gambar");
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", content: "", stepsText: "", reqText: "", image_url: "" });
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingId(null);
  };

  const handleEdit = (item) => {
    console.log("Data yang mau diedit:", item);
    setEditingId(item.id);

    let stepsString = "";
    if (Array.isArray(item.steps)) {
      stepsString = item.steps.join("\n");
    } else if (typeof item.steps === "string") {
      stepsString = item.steps;
    }

    let reqString = "";
    if (Array.isArray(item.requirements)) {
      reqString = item.requirements.join("\n");
    } else if (typeof item.requirements === "string") {
      reqString = item.requirements;
    }

    setForm({
      title: item.title || "",
      description: item.description || "",
      content: item.content || "",
      stepsText: stepsString,
      reqText: reqString,
      image_url: item.image_url || "",
    });

    setPreviewUrl(item.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const stepsArray = form.stepsText ? form.stepsText.split("\n").filter((line) => line.trim() !== "") : [];
      const reqArray = form.reqText ? form.reqText.split("\n").filter((line) => line.trim() !== "") : [];

      let finalImageUrl = form.image_url;
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      const payload = {
        title: form.title,
        description: form.description,
        content: form.content,
        image_url: finalImageUrl,
        steps: stepsArray,
        requirements: reqArray,
      };

      if (!editingId) {
        payload.views = 0;
      }

      if (editingId) {
        const { error } = await supabase.from("panduan").update(payload).eq("id", editingId);
        if (error) throw error;
        alert("✅ Panduan berhasil diperbarui!");
      } else {
        const { error } = await supabase.from("panduan").insert([payload]);
        if (error) throw error;
        alert("✅ Panduan berhasil disimpan!");
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
    if (confirm("Hapus panduan ini?")) {
      await supabase.from("panduan").delete().eq("id", id);
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
              <div className="p-3 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Panduan Layanan</h1>
                <p className="text-yellow-200 text-sm">Kelola panduan administrasi desa</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-white">{data.length}</p>
              <p className="text-yellow-200 text-sm">Total Panduan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl mb-8">
        <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {editingId ? <Pencil size={20} className="text-yellow-400" /> : <BookOpen size={20} className="text-yellow-400" />}
            {editingId ? "Edit Panduan" : "Tambah Panduan Baru"}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Judul Panduan</label>
            <input 
              type="text" 
              className="w-full border-2 border-white/30 bg-white/90 rounded-xl p-3 focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all" 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              required 
              placeholder="Contoh: Cara Membuat KTP"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Deskripsi Singkat</label>
            <textarea 
              rows="2" 
              className="w-full border-2 border-white/30 bg-white/90 rounded-xl p-3 focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              placeholder="Ringkasan panduan..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Konten Penjelasan</label>
            <textarea 
              rows="3" 
              className="w-full border-2 border-white/30 bg-white/90 rounded-xl p-3 focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all" 
              value={form.content} 
              onChange={(e) => setForm({ ...form, content: e.target.value })} 
              placeholder="Penjelasan detail tentang panduan..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-blue-200 block mb-2">
                Langkah-Langkah <span className="text-xs text-blue-300">(1 baris = 1 langkah)</span>
              </label>
              <textarea 
                className="w-full border-2 border-white/30 bg-white/90 p-3 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all" 
                rows="5" 
                value={form.stepsText} 
                onChange={(e) => setForm({ ...form, stepsText: e.target.value })} 
                placeholder="Langkah 1: ...&#10;Langkah 2: ...&#10;Langkah 3: ..."
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-blue-200 block mb-2">
                Persyaratan <span className="text-xs text-blue-300">(1 baris = 1 syarat)</span>
              </label>
              <textarea 
                className="w-full border-2 border-white/30 bg-white/90 p-3 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all" 
                rows="5" 
                value={form.reqText} 
                onChange={(e) => setForm({ ...form, reqText: e.target.value })} 
                placeholder="KTP Asli&#10;Kartu Keluarga&#10;Pas Foto 3x4"
              />
            </div>
          </div>

          {/* Upload Image */}
          <div>
            <label className="text-sm font-semibold text-blue-200 block mb-2">Gambar Panduan</label>
            <div className="border-2 border-dashed border-white/30 bg-white/5 rounded-xl p-4 text-center relative cursor-pointer hover:bg-white/10 transition-all">
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <div className="flex flex-col items-center">
                <ImageIcon className="text-blue-200 mb-1" size={32} />
                <span className="text-sm text-blue-200">
                  {selectedFile ? selectedFile.name : editingId ? "Ganti Gambar (Opsional)" : "Upload Gambar Panduan"}
                </span>
              </div>
            </div>
            {previewUrl && (
              <img 
                src={previewUrl} 
                className="h-32 w-full object-cover rounded-xl border-2 border-white/30 mt-4 shadow-lg" 
                alt="Preview" 
              />
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`${
              editingId 
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-500/30" 
                : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-yellow-500/30"
            } text-white px-5 py-3 rounded-xl w-full font-bold transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50`}
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : editingId ? (
              <>
                <Pencil size={18} /> Update Panduan
              </>
            ) : (
              <>
                <BookOpen size={18} /> Simpan Panduan
              </>
            )}
          </button>
        </form>
      </div>

      {/* List Panduan */}
      <div className="grid gap-4">
        {data.map((item) => (
          <div 
            key={item.id} 
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-5 flex justify-between items-center hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4">
              <img 
                src={item.image_url || "https://placehold.co/100"} 
                className="w-16 h-16 object-cover rounded-xl bg-white/5 border border-white/20" 
                alt={item.title} 
              />
              <div>
                <strong className="text-white text-lg block">{item.title}</strong>
                <span className="text-xs text-blue-200 flex items-center gap-1 mt-1">
                  <Eye size={12} />
                  Views: {item.views || 0}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(item)} 
                className="text-yellow-400 hover:bg-yellow-500/10 p-3 rounded-lg transition-colors"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)} 
                className="text-red-400 hover:bg-red-500/10 p-3 rounded-lg transition-colors"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}