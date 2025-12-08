// src/components/Login.js

import React, { useState } from "react";
import { supabase } from "../SupabaseClients";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Login Berhasil! Cek konsol untuk informasi user.");
      // Supabase akan menyimpan sesi pengguna di Local Storage.
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Masuk ke Aplikasi</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Kata Sandi" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>
        {loading ? "Memproses..." : "Login"}
      </button>
    </form>
  );
}

export default Login;
