import React, { useState } from "react";
import { addPost } from "../services/postService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AddPost() {
  const [cover, setCover] = useState(null);
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    if (cover) fd.append("cover", cover); // ✅ pakai key "cover"
    fd.append("description", description);

    try {
      const res = await addPost(fd);
      if (res.success) {
        Swal.fire("Berhasil", res.message || "Post dibuat", "success");
        navigate("/");
      } else {
        Swal.fire("Gagal", res.message || "Data tidak valid", "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal menambah post",
        "error"
      );
      console.error(err);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <h3 className="mb-3 text-center">Tambah Post</h3>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm rounded-4">
        <div className="mb-3">
          <label className="form-label fw-semibold">Gambar (opsional)</label>
          <input
            type="file"
            className="form-control"
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => setCover(e.target.files[0])}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Deskripsi</label>
          <textarea
            className="form-control"
            rows="4"
            placeholder="Tulis deskripsi postingan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button className="btn btn-success w-100 rounded-3">Kirim</button>
      </form>
    </div>
  );
}
