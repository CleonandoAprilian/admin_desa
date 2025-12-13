import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Users, Newspaper, ShoppingBag, Map, BookOpen, LogOut, Shield, Menu, X } from "lucide-react";
import { supabase } from "../SupabaseClients";
import { useState } from "react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      await supabase.auth.signOut();
      navigate("/login");
    }
  };

  // Menu Navigasi
  const menus = [
    { label: "Data Penduduk", path: "/admin/penduduk", icon: Users },
    { label: "Berita Desa", path: "/admin/berita", icon: Newspaper },
    { label: "Produk UMKM", path: "/admin/produk", icon: ShoppingBag },
    { label: "Potensi Wisata", path: "/admin/wisata", icon: Map },
    { label: "Panduan Layanan", path: "/admin/panduan", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 font-sans relative overflow-hidden">
      {/* Background Effect - sama seperti Login */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-slate-900/95 backdrop-blur-xl border-r border-white/10 text-white flex flex-col fixed h-full shadow-2xl transition-all duration-300 z-50`}>
        {/* Header Sidebar */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide">Admin Desa</h1>
                <p className="text-xs text-slate-300">Sidoarum</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
                title={!sidebarOpen ? menu.label : ""}
              >
                <Icon size={22} className="flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{menu.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut size={22} className="flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300 relative z-10`}>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}