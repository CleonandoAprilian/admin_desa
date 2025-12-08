import { Outlet, Link, useLocation } from "react-router-dom";
import { Users, Newspaper, ShoppingBag, Map, BookOpen, LogOut, LayoutDashboard } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  // Menu Navigasi
  const menus = [
    { label: "Data Penduduk", path: "/admin/penduduk", icon: Users },
    { label: "Berita Desa", path: "/admin/berita", icon: Newspaper },
    { label: "Produk UMKM", path: "/admin/produk", icon: ShoppingBag },
    { label: "Potensi Wisata", path: "/admin/wisata", icon: Map },
    { label: "Panduan Layanan", path: "/admin/panduan", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-xl">
        <div className="p-6 border-b border-slate-700 flex items-center gap-2">
          <LayoutDashboard className="text-blue-400" />
          <h1 className="text-xl font-bold tracking-wider">ADMIN DESA</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
              >
                <Icon size={20} />
                <span className="font-medium">{menu.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet /> {/* Ini tempat konten berubah-ubah */}
        </div>
      </main>
    </div>
  );
}
