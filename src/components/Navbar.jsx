import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Swal.fire("Logout", "Kamu telah keluar", "info");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav
      className="navbar navbar-dark"
      style={{
        backgroundColor: "#222",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h4 style={{ color: "white" }}>Delcom Posts</h4>
      <div className="d-flex gap-2">
        <Link to="/" className="btn btn-outline-light btn-sm">
          Home
        </Link>
        <Link to="/about" className="btn btn-outline-light btn-sm">
          About
        </Link>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
