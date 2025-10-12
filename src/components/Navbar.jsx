import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Swal.fire("Logout", "Kamu telah keluar", "info");
    navigate("/login", { replace: true });
  };

  return (
    <nav
      className="navbar navbar-dark modern-navbar"
      style={{
        background:
          "linear-gradient(135deg, #0077b6 0%, #0096c7 50%, #00b4d8 100%)",
        padding: "15px 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 20px rgba(0, 119, 182, 0.3)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="navbar-brand">
        <h4
          style={{
            color: "white",
            margin: 0,
            fontWeight: "700",
            fontSize: "1.5rem",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            letterSpacing: "0.5px",
          }}
        >
          Delcom Posts
        </h4>
      </div>
      <div
        className="navbar-nav"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "12px",
          flexWrap: "nowrap",
        }}
      >
        <Link
          to="/"
          className="btn btn-outline-light btn-sm modern-nav-btn home-btn"
          style={{
            borderRadius: "25px",
            padding: "8px 16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(5px)",
            whiteSpace: "nowrap",
          }}
        >
          🏠 Home
        </Link>
        <Link
          to="/about"
          className="btn btn-outline-light btn-sm modern-nav-btn about-btn"
          style={{
            borderRadius: "25px",
            padding: "8px 16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(5px)",
            whiteSpace: "nowrap",
          }}
        >
          ℹ️ About
        </Link>
        <button
          className="btn btn-danger btn-sm modern-nav-btn"
          onClick={handleLogout}
          style={{
            borderRadius: "25px",
            padding: "8px 16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            background: "#dc3545",
            border: "none",
            boxShadow: "0 4px 15px rgba(220, 53, 69, 0.4)",
            whiteSpace: "nowrap",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}
