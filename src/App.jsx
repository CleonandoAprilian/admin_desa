import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard"; // Asumsi ini CRUD Penduduk kamu
import BeritaAdmin from "./components/BeritaAdmin";
import ProdukAdmin from "./components/ProdukAdmin";
import PotensiAdmin from "./components/WisataAdmin";
import PanduanAdmin from "./components/PanduanAdmin";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect halaman awal ke dashboard admin */}
        <Route path="/" element={<Navigate to="/admin/penduduk" replace />} />

        {/* Grouping Route Admin dengan Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Halaman CRUD Penduduk (AdminDashboard lama kamu) */}
          <Route path="penduduk" element={<AdminDashboard />} />

          {/* Halaman-halaman baru */}
          <Route path="berita" element={<BeritaAdmin />} />
          <Route path="produk" element={<ProdukAdmin />} />
          <Route path="wisata" element={<PotensiAdmin />} />
          <Route path="panduan" element={<PanduanAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
