import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ TAMBAHKAN INI
import { supabase } from "../SupabaseClients"; // ✅ TAMBAHKAN INI
import { LogIn, Loader2, Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";

export default function Login() {
  const navigate = useNavigate(); // ✅ TAMBAHKAN INI
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ GANTI FUNGSI INI dengan Supabase Authentication
  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // ✅ Jika login berhasil, redirect ke dashboard
      if (data.user) {
        navigate("/admin/penduduk"); // Redirect ke halaman admin penduduk
      }
    } catch (error) {
      setErrorMsg("Login gagal: Email atau kata sandi salah.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 p-10 text-center overflow-hidden">
            {/* Animated circles in header */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="inline-block p-4 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Admin Desa Sidoarum</h1>
              <p className="text-blue-100 text-sm font-medium">Sistem Informasi Desa Terpadu</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 bg-white rounded-t-3xl -mt-6 relative z-10">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-start gap-3 animate-shake">
                <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">!</div>
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Input Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Email Admin</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="Masukkan Email Anda"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan Password Anda"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-gray-600 group-hover:text-gray-800 transition-colors">Ingat saya</span>
                </label>
                <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Lupa password?</button>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Masuk Sekarang</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Keamanan Terjamin
                </span>
                <span className="mx-2">•</span>
                © 2025 Sistem Informasi Desa Sidoarum
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl rounded-full"></div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}