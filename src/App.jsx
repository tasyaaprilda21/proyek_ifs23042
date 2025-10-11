import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import PostsList from "./pages/PostsList";
import AddPost from "./pages/AddPost";
import EditPost from "./pages/EditPost";
import PostDetail from "./pages/PostDetail";
import Navbar from "./components/Navbar";
import React, { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      {/* 🌈 Navbar tampil hanya jika login */}
      {isAuthenticated && <Navbar />}

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f9ff, #e0f7fa)",
        }}
      >
        <Routes>
          {/* 🏠 Halaman utama (hanya login user) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PostsList />
              </ProtectedRoute>
            }
          />

          {/* ➕ Tambah post */}
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <AddPost />
              </ProtectedRoute>
            }
          />

          {/* ✏️ Edit post */}
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            }
          />

          {/* 🔍 Detail post */}
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            }
          />

          {/* 🔑 Auth pages (tanpa Navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🧾 About (bebas diakses) */}
          <Route path="/about" element={<About />} />

          {/* 🚫 Route tidak dikenal → redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
