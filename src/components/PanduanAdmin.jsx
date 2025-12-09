import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClients";
import { Trash, Image as ImageIcon, Loader2 } from "lucide-react";

export default function PanduanAdmin() {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const stepsArray = form.stepsText.split("\n").filter((line) => line.trim() !== "");
      const reqArray = form.reqText.split("\n").filter((line) => line.trim() !== "");

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
        views: 0, // ✅ OTOMATIS VIEWS 0
      };

      const { error } = await supabase.from("panduan").insert([payload]);
      if (error) throw error;

      alert("✅ Panduan berhasil disimpan!");
      setForm({ title: "", description: "", content: "", stepsText: "", reqText: "", image_url: "" });
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
    if (confirm("Hapus panduan ini?")) {
      await supabase.from("panduan").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">📘 Kelola Panduan Layanan</h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 max-w-4xl">
        <h2 className="font-semibold text-lg mb-6">Tambah Panduan Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" placeholder="Judul Panduan" className="w-full border rounded-lg p-3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea rows="2" placeholder="Deskripsi Singkat" className="w-full border rounded-lg p-3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea rows="3" placeholder="Isi Penjelasan" className="w-full border rounded-lg p-3" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea className="w-full border p-3 rounded" rows="5" value={form.stepsText} onChange={(e) => setForm({ ...form, stepsText: e.target.value })} placeholder="Langkah-langkah (1 baris 1 langkah)" />
            <textarea className="w-full border p-3 rounded" rows="5" value={form.reqText} onChange={(e) => setForm({ ...form, reqText: e.target.value })} placeholder="Persyaratan Dokumen (1 baris 1 syarat)" />
          </div>

          {/* INPUT FILE */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative cursor-pointer hover:bg-gray-50">
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center">
              <ImageIcon className="text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">{selectedFile ? selectedFile.name : "Upload Gambar Panduan"}</span>
            </div>
          </div>
          {previewUrl && <img src={previewUrl} className="h-32 w-full object-cover rounded-lg border mt-2" />}

          <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-5 py-3 rounded-lg w-full font-semibold">
            {uploading ? "Mengupload..." : "Simpan Panduan"}
          </button>
        </form>
      </div>

      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-xl shadow-md flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={item.image_url || "https://placehold.co/100"} className="w-14 h-14 object-cover rounded-lg" />
              <div>
                <strong className="text-gray-800 text-lg block">{item.title}</strong>
                <span className="text-xs text-gray-500">Views: {item.views || 0}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-100 p-3 rounded-lg">
              <Trash size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
