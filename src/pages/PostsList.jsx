import React, { useEffect, useState } from "react";
import { getAllPosts, addLike, deletePost } from "../services/postService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  // 🔹 Ambil semua postingan
  const fetchPosts = async () => {
    try {
      const res = await getAllPosts();
      setPosts(res.data?.posts || []);
    } catch (err) {
      console.error("Gagal memuat posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 🔹 Tambah like
  const handleLike = async (id) => {
    try {
      const res = await addLike(id);
      if (res.success) {
        await fetchPosts();
      } else {
        Swal.fire("Gagal", res.message || "Tidak bisa menambah like", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menambah like", "error");
      console.error(err);
    }
  };

  // 🔹 Hapus post
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deletePost(id);
          if (res.success) {
            Swal.fire("Dihapus!", "Berhasil menghapus data", "success");
            fetchPosts();
          } else {
            Swal.fire(
              "Gagal",
              res.message || "Tidak bisa menghapus post",
              "error"
            );
          }
        } catch (err) {
          Swal.fire("Error", "Gagal menghapus post", "error");
        }
      }
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">📢 Semua Postingan</h2>
        <button
          onClick={() => navigate("/add")}
          className="btn btn-success px-4 py-2 rounded-3 shadow-sm"
        >
          + Tambah Post
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-secondary mt-5">Belum ada postingan</p>
      ) : (
        <div className="row g-4">
          {posts.map((post) => {
            const authorName =
              post.user?.name ||
              post.author?.name ||
              post.creator?.name ||
              "Anonim";
            const likesCount =
              post.likes_count ?? (post.likes ? post.likes.length : 0);
            const commentsCount =
              post.comments_count ?? (post.comments ? post.comments.length : 0);

            return (
              <div
                key={post.id}
                className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex"
              >
                <div className="card shadow-sm w-100 rounded-4 border-0 d-flex flex-column">
                  {/* 🔹 Gambar Cover */}
                  <div
                    className="card-img-top"
                    style={{
                      height: "180px",
                      overflow: "hidden",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <img
                      src={
                        post.cover ||
                        post.image ||
                        "https://via.placeholder.com/400x200?text=No+Image"
                      }
                      alt="Post"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* 🔹 Isi Card */}
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <p className="text-muted small mb-1">{authorName}</p>
                      <h6 className="fw-semibold text-dark mb-2 text-truncate">
                        {post.description || "Tanpa deskripsi"}
                      </h6>

                      {/* 🔹 Like & Comment Section */}
                      <div className="d-flex justify-content-between text-muted small">
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() => handleLike(post.id)}
                        >
                          ❤️ {likesCount} Likes
                        </span>

                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/post/${post.id}#comments`)}
                        >
                          💬 {commentsCount} Komentar
                        </span>
                      </div>

                      <small className="text-muted d-block mt-2">
                        {new Date(post.created_at).toLocaleString()}
                      </small>
                    </div>

                    {/* 🔹 Tombol Aksi */}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="btn btn-outline-primary btn-sm flex-fill"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleLike(post.id)}
                        className="btn btn-outline-success btn-sm flex-fill"
                      >
                        ❤️ Like
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="btn btn-outline-danger btn-sm flex-fill"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
