import React, { useEffect, useState } from "react";
import {
  getPostDetail,
  addComment,
  deleteComment,
  addLike,
} from "../services/postService";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // 🔹 Ambil detail post (termasuk komentar)
  const loadData = async () => {
    try {
      const res = await getPostDetail(id);
      if (res.success) {
        setPost(res.data.post);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // 🔹 Tambah komentar
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await addComment(id, commentText);
      if (res.success) {
        Swal.fire(
          "Sukses!",
          "Berhasil memberikan komentar pada postingan",
          "success"
        );
        setCommentText("");
        loadData();
      } else {
        Swal.fire(
          "Gagal",
          res.message || "Tidak bisa menambah komentar",
          "error"
        );
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menambah komentar", "error");
    }
  };

  // 🔹 Hapus komentar (tanpa ID karena modul pakai /posts/:id/comments)
  const handleDeleteComment = async () => {
    Swal.fire({
      title: "Hapus semua komentar?",
      text: "Semua komentar kamu di postingan ini akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteComment(id);
          if (res.success) {
            Swal.fire(
              "Terhapus!",
              "Berhasil menghapus komentar pada postingan",
              "success"
            );
            loadData();
          } else {
            Swal.fire(
              "Gagal",
              res.message || "Tidak bisa hapus komentar",
              "error"
            );
          }
        } catch (err) {
          Swal.fire("Error", "Gagal hapus komentar", "error");
        }
      }
    });
  };

  // 🔹 Like post
  const handleLike = async () => {
    try {
      const res = await addLike(id);
      if (res.success) loadData();
      else
        Swal.fire("Gagal", res.message || "Tidak bisa menambah like", "error");
    } catch {
      Swal.fire("Error", "Tidak bisa menambah like", "error");
    }
  };

  if (!post) return <p className="text-center mt-5">Memuat detail...</p>;

  const authorName =
    post.author?.name || post.user?.name || post.creator?.name || "Anonim";
  const likesCount = post.likes_count ?? (post.likes ? post.likes.length : 0);
  const comments = post.comments || [];
  const commentsCount = comments.length;

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <div className="card shadow-sm p-3">
        {post.cover && (
          <img
            src={post.cover}
            alt="Post"
            className="img-fluid rounded mb-3"
            style={{ objectFit: "cover", maxHeight: 400 }}
          />
        )}

        <h5 className="fw-bold">{authorName}</h5>
        <p>{post.description}</p>

        <div className="d-flex justify-content-between text-muted small mb-2">
          <span>❤️ {likesCount} Likes</span>
          <span>💬 {commentsCount} Komentar</span>
        </div>

        <button
          onClick={handleLike}
          className="btn btn-outline-danger btn-sm mb-3"
        >
          ❤️ Like
        </button>

        <hr />
        <h6>Komentar</h6>

        {comments.length > 0 ? (
          comments.map((c) => {
            const commenterName =
              c.author?.name ||
              c.user?.name ||
              c.username ||
              c.name ||
              "Anonim";

            return (
              <div
                key={c.id || c.comment}
                className="border rounded p-2 mb-2 bg-light"
              >
                <strong>{commenterName}</strong>: {c.comment}
              </div>
            );
          })
        ) : (
          <p className="text-muted">Belum ada komentar.</p>
        )}

        <form onSubmit={handleAddComment} className="mt-3">
          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Tulis komentar..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="btn btn-primary">Kirim</button>
          </div>
        </form>

        {commentsCount > 0 && (
          <button
            onClick={handleDeleteComment}
            className="btn btn-danger mt-3 w-100"
          >
            🗑️ Hapus Komentar Saya
          </button>
        )}

        <Link
          to={`/edit/${post.id}`}
          className="btn btn-outline-secondary mt-3 w-100"
        >
          Edit Post
        </Link>
      </div>
    </div>
  );
}
