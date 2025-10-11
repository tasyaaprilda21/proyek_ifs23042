import React from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { addLike, deletePost } from "../services/postService";

export default function PostCard({ post, refreshPosts }) {
  const cover =
    post?.cover ||
    post?.image ||
    "https://via.placeholder.com/400x200?text=No+Image";
  const created = post?.created_at
    ? new Date(post.created_at).toLocaleString()
    : "Tidak diketahui";
  const authorName =
    post.user?.name || post.author?.name || post.creator?.name || "Anonim";
  const likesCount = post.likes_count ?? (post.likes ? post.likes.length : 0);
  const commentsCount =
    post.comments_count ?? (post.comments ? post.comments.length : 0);

  // ✅ Fungsi Like
  const handleLike = async () => {
    try {
      const res = await addLike(post.id);
      if (res.success) {
        refreshPosts?.();
      } else {
        Swal.fire("Gagal", res.message || "Gagal menambah like", "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal menambah like",
        "error"
      );
    }
  };

  // ✅ Fungsi Delete
  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Hapus Post?",
      text: "Kamu yakin ingin menghapus postingan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await deletePost(post.id);
        if (res.success) {
          Swal.fire("Dihapus!", "Postingan berhasil dihapus.", "success");
          refreshPosts?.();
        } else {
          Swal.fire("Gagal", res.message || "Gagal menghapus post", "error");
        }
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Gagal menghapus post",
          "error"
        );
      }
    }
  };

  return (
    <div className="postcard">
      <div className="postcard-img">
        <img src={cover} alt="cover" />
      </div>

      <div className="postcard-body">
        <div className="postcard-author">{authorName}</div>
        <p className="postcard-desc">{post.description || "Tanpa deskripsi"}</p>

        <div className="postcard-meta">
          <span>❤️ {likesCount}</span>
          <span>💬 {commentsCount}</span>
        </div>

        <div className="postcard-time">{created}</div>

        <div className="postcard-actions">
          <Link to={`/post/${post.id}`} className="btn-view">
            Detail
          </Link>
          <button onClick={handleLike} className="btn-like">
            ❤️
          </button>
          <button onClick={handleDelete} className="btn-delete">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
