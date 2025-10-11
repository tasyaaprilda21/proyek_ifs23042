import React, { useState } from "react";
import { loginUser, saveToken } from "../services/authService";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import "./AuthStyle.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      if (res.success && res.data?.token) {
        saveToken(res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        await Swal.fire({
          icon: "success",
          title: "Welcome back!",
          text: "Login sukses",
          timer: 1200,
          showConfirmButton: false,
        });

        navigate("/");
        window.location.reload();
      } else {
        Swal.fire("Gagal", res.message || "Email/password salah", "error");
      }
      a;
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Login gagal", "error");
    }
  };

  return (
    <div className="auth-container">
      {/* 🌊 Bagian Kiri */}
      <div className="auth-left">
        <h1 className="brand-title">TasyaVibe</h1>
        <p className="brand-sub">Drop Your Posts, Catch the Wave </p>
        {/* Gambar Laut */}
        <img
          src="/img/login.jpg"
          alt="Ocean vibes"
          className="auth-illustration"
        />
      </div>

      {/* 🩵 Bagian Kanan (Form Login) */}
      <div className="auth-right">
        <form onSubmit={handleLogin} className="auth-card">
          <h2>Welcome Back </h2>
          <p className="text-muted">Please login to continue</p>

          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="auth-btn">Login</button>

          <p className="auth-link">
            Belum punya akun? <Link to="/register">Daftar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
