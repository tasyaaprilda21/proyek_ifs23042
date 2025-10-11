// src/components/NavbarBottom.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavbarBottom() {
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <Link to="/" className={`bn-item ${isActive("/") ? "active" : ""}`}>
        <span className="bn-ico">🏠</span>
        <span className="bn-label">Home</span>
      </Link>

      <Link
        to="/search"
        className={`bn-item ${isActive("/search") ? "active" : ""}`}
      >
        <span className="bn-ico">🔍</span>
        <span className="bn-label">Search</span>
      </Link>

      <Link to="/add" className="bn-item center-btn">
        <span className="bn-plus">＋</span>
      </Link>

      <Link
        to="/profile"
        className={`bn-item ${isActive("/profile") ? "active" : ""}`}
      >
        <span className="bn-ico">👤</span>
        <span className="bn-label">Profile</span>
      </Link>

      <Link
        to="/about"
        className={`bn-item ${isActive("/about") ? "active" : ""}`}
      >
        <span className="bn-ico">ℹ️</span>
        <span className="bn-label">About</span>
      </Link>
    </nav>
  );
}
