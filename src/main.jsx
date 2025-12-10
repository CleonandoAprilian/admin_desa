import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

// --- Komponen Auth & Layout ---
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import AdminLayout from "./components/AdminLayout";

// --- Halaman Admin ---
import AdminDashboard from "./components/AdminDashboard";
import BeritaAdmin from "./components/BeritaAdmin";
import ProdukAdmin from "./components/ProdukAdmin";
import WisataAdmin from "./components/WisataAdmin";
import PanduanAdmin from "./components/PanduanAdmin";

// --- Render ---
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ---------- ROUTE PUBLIC ---------- */}
        <Route path="/login" element={<Login />} />

        {/* ---------- ROUTE ADMIN PROTECTED ---------- */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Jika buka /admin → redirect ke /admin/penduduk */}
            <Route index element={<Navigate to="/admin/penduduk" replace />} />

            <Route path="penduduk" element={<AdminDashboard />} />
            <Route path="berita" element={<BeritaAdmin />} />
            <Route path="produk" element={<ProdukAdmin />} />
            <Route path="wisata" element={<WisataAdmin />} />
            <Route path="panduan" element={<PanduanAdmin />} />
          </Route>
        </Route>

        {/* ---------- FALLBACK ROUTE ---------- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
