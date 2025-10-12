import React, { useState } from "react";
import { registerUser } from "../services/authService";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import "./AuthStyle.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser({ name, email, password });
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Registrasi Berhasil",
          text: "Silakan login untuk melanjutkan",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/login");
      } else {
        Swal.fire("Gagal", res.message || "Registrasi gagal", "error");
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || "Registrasi gagal";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  return (
    <div className="auth-container">
      {/* 🌊 Bagian Kiri */}
      <div className="auth-left">
        <h1 className="brand-title">TasyaVibe</h1>
        <p className="brand-sub">Join the Wave, Share Your Story</p>
        <img
          src="/img/login.jpg"
          alt="Ocean vibes"
          className="auth-illustration"
        />
      </div>

      {/* 🩵 Bagian Kanan (Form Register) */}
      <div className="auth-right">
        <form onSubmit={handleRegister} className="auth-card">
          <h2>Create Account </h2>
          <p className="text-muted">Sign up to get started</p>

          <input
            type="text"
            placeholder="Nama Lengkap"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <button className="auth-btn">Daftar</button>

          <p className="auth-link">
            Sudah punya akun? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
