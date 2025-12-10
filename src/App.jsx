import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 1. Import Komponen Keamanan & Layout
// Pastikan file-file ini ada di folder yang sesuai
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import AdminLayout from "./components/AdminLayout";

// 2. Import Halaman Admin (CRUD)
import AdminDashboard from "./components/AdminDashboard"; // Dashboard Penduduk (File lama Anda)
import BeritaAdmin from "./components/BeritaAdmin";
import ProdukAdmin from "./components/ProdukAdmin";
import WisataAdmin from "./components/WisataAdmin";
import PanduanAdmin from "./components/PanduanAdmin";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- 1. ROUTE PUBLIK (Bisa diakses tanpa login) --- */}
        <Route path="/login" element={<Login />} />

        {/* --- 2. ROUTE ADMIN (Hanya bisa diakses jika login) --- */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Redirect: Buka /admin langsung masuk ke /admin/penduduk */}
            <Route index element={<Navigate to="/admin/penduduk" replace />} />

            {/* Sub-menu Admin */}
            <Route path="penduduk" element={<AdminDashboard />} />
            <Route path="berita" element={<BeritaAdmin />} />
            <Route path="produk" element={<ProdukAdmin />} />
            <Route path="wisata" element={<WisataAdmin />} />
            <Route path="panduan" element={<PanduanAdmin />} />
          </Route>
        </Route>

        {/* --- 3. FALLBACK (Jika halaman tidak ditemukan / Root) --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
