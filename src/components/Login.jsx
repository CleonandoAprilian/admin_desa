import { useState } from "react";
import { supabase } from "../SupabaseClients"; // Import path yang benar
import { useNavigate } from "react-router-dom";
import { LogIn, Loader2, Lock, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Jika sukses, redirect ke dashboard admin
      if (data.user) {
        navigate("/admin/penduduk");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setErrorMsg("Login gagal: Email atau kata sandi salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Desa</h1>
          <p className="text-blue-100 text-sm">Masuk untuk mengelola data desa</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">⚠️ {errorMsg}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@desa.id"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Button */}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {loading ? (
                <>
                  {" "}
                  <Loader2 className="animate-spin" /> Memproses...{" "}
                </>
              ) : (
                <>
                  {" "}
                  <LogIn size={20} /> Masuk Sekarang{" "}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">&copy; 2025 Sistem Informasi Desa. Keamanan Terjamin.</div>
        </div>
      </div>
    </div>
  );
}
