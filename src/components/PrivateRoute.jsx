import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../SupabaseClients";

export default function PrivateRoute() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Pasang pendengar perubahan auth (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-semibold animate-pulse">Memeriksa akses...</p>
      </div>
    );
  }

  // Jika ada sesi, render halaman tujuan (Outlet). Jika tidak, lempar ke Login.
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
