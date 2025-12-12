import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Image as ImageIcon, Loader2, Pencil, X } from "lucide-react";

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
    // Pastikan nama tabel benar 'panduan'
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

  // --- PERBAIKAN LOGIKA EDIT DI SINI ---
  const handleEdit = (item) => {
    console.log("Data yang mau diedit:", item); // Cek Console browser (F12) jika masih kosong

    setEditingId(item.id);

    // Konversi Array ke Textarea (handle jika null atau bukan array)
    let stepsString = "";
    if (Array.isArray(item.steps)) {
      stepsString = item.steps.join("\n");
    } else if (typeof item.steps === "string") {
      // Jaga-jaga jika di DB tersimpan sebagai string biasa
      stepsString = item.steps;
    }

    let reqString = "";
    if (Array.isArray(item.requirements)) {
      reqString = item.requirements.join("\n");
    } else if (typeof item.requirements === "string") {
      reqString = item.requirements;
    }

    setForm({
      title: item.title || "", // Pakai || "" untuk mencegah error jika null
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
      // Pecah text menjadi Array per baris
      const stepsArray = form.stepsText ? form.stepsText.split("\n").filter((line) => line.trim() !== "") : [];
      const reqArray = form.reqText ? form.reqText.split("\n").filter((line) => line.trim() !== "") : [];

      let finalImageUrl = form.image_url;
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      // Pastikan nama key object ini SAMA PERSIS dengan nama kolom di Supabase
      const payload = {
        title: form.title,
        description: form.description,
        content: form.content,
        image_url: finalImageUrl,
        steps: stepsArray, // Pastikan kolom DB bernama 'steps' (tipe array/json)
        requirements: reqArray, // Pastikan kolom DB bernama 'requirements' (tipe array/json)
      };

      if (!editingId) {
        payload.views = 0; // Set views 0 hanya untuk data baru
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
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">📘 Kelola Panduan Layanan</h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 ">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-lg">{editingId ? "✏️ Edit Panduan" : "➕ Tambah Panduan Baru"}</h2>
          {editingId && (
            <button onClick={resetForm} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg flex items-center gap-1 text-sm font-medium">
              <X size={16} /> Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Judul Panduan</label>
            <input type="text" className="w-full border rounded-lg p-3 mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Deskripsi Singkat</label>
            <textarea rows="2" className="w-full border rounded-lg p-3 mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Konten Penjelasan</label>
            <textarea rows="3" className="w-full border rounded-lg p-3 mt-1" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Langkah-Langkah (1 baris = 1 langkah)</label>
              <textarea className="w-full border p-3 rounded mt-1" rows="5" value={form.stepsText} onChange={(e) => setForm({ ...form, stepsText: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Persyaratan (1 baris = 1 syarat)</label>
              <textarea className="w-full border p-3 rounded mt-1" rows="5" value={form.reqText} onChange={(e) => setForm({ ...form, reqText: e.target.value })} />
            </div>
          </div>

          {/* INPUT FILE */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative cursor-pointer hover:bg-gray-50 transition">
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center">
              <ImageIcon className="text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">{selectedFile ? selectedFile.name : editingId ? "Ganti Gambar (Opsional)" : "Upload Gambar Panduan"}</span>
            </div>
          </div>
          {previewUrl && <img src={previewUrl} className="h-32 w-full object-cover rounded-lg border mt-2" alt="Preview" />}

          <button
            type="submit"
            disabled={uploading}
            className={`${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white px-5 py-3 rounded-lg w-full font-semibold transition flex justify-center items-center gap-2`}
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : editingId ? "Update Panduan" : "Simpan Panduan"}
          </button>
        </form>
      </div>

      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-xl shadow-md flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={item.image_url || "https://placehold.co/100"} className="w-14 h-14 object-cover rounded-lg bg-gray-100" alt={item.title} />
              <div>
                <strong className="text-gray-800 text-lg block">{item.title}</strong>
                <span className="text-xs text-gray-500">Views: {item.views || 0}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* TOMBOL EDIT */}
              <button onClick={() => handleEdit(item)} className="text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition">
                <Pencil size={18} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-3 rounded-lg transition">
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
