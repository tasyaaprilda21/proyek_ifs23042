import React, { useEffect, useState } from "react";
import { getPostDetail, updatePost } from "../services/postService";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Ambil data post saat halaman dibuka
  useEffect(() => {
    getPostDetail(id)
      .then((res) => {
        if (res.success && res.data?.post) {
          setDescription(res.data.post.description || "");
          setPreview(res.data.post.cover || res.data.post.image || null);
        }
      })
      .catch((err) => console.error("Gagal ambil data post:", err));
  }, [id]);

  // Handle upload gambar baru
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // Kirim data ke backend
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      Swal.fire("Perhatian", "Deskripsi tidak boleh kosong", "warning");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("description", description);
      if (image) fd.append("cover", image); // hanya kalau ada gambar baru

      const res = await updatePost(id, fd);

      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Berhasil mengubah data",
          timer: 1000,
          showConfirmButton: false,
        });
        navigate("/");
      } else {
        Swal.fire("Gagal", res.message || "Gagal update", "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal memperbarui postingan",
        "error"
      );
      console.error(err);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 700 }}>
      <h3 className="text-center mb-4">✏️ Edit Postingan</h3>
      <form onSubmit={handleUpdate} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label fw-semibold">Deskripsi</label>
          <textarea
            className="form-control"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tulis deskripsi postingan..."
            required
          />
        </div>

        {preview && (
          <div className="mb-3 text-center">
            <img
              src={preview}
              alt="Preview"
              className="img-fluid rounded"
              style={{ maxHeight: "250px", objectFit: "cover" }}
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Ganti Gambar (Opsional)
          </label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleImageChange}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary flex-fill">
            Simpan Perubahan
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary flex-fill"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
