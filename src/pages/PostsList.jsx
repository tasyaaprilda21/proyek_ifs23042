import React, { useEffect, useState } from "react";
import { getAllPosts, getPostDetail, addComment, deleteComment, updatePost, changeCoverPost } from "../services/postService";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import Swal from "sweetalert2";

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, my-posts
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetail, setPostDetail] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editCover, setEditCover] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  
  const navigate = useNavigate();

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchPosts = async (isMe = false) => {
    try {
      setLoading(true);
      const res = await getAllPosts(isMe);
      if (res.success) {
      setPosts(res.data?.posts || []);
      } else {
        Swal.fire("Error", "Gagal memuat postingan", "error");
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
      Swal.fire("Error", "Gagal memuat postingan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(filter === "my-posts");
  }, [filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const refreshPosts = () => {
    fetchPosts(filter === "my-posts");
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Hari ini";
    if (diffDays === 2) return "Kemarin";
    if (diffDays <= 7) return `${diffDays - 1} hari yang lalu`;
    
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Handle open modal
  const handleOpenModal = async (post) => {
    setSelectedPost(post);
    setShowModal(true);
    setModalLoading(true);
    try {
      const res = await getPostDetail(post.id);
      if (res.success) {
        setPostDetail(res.data.post);
      } else {
        Swal.fire("Error", "Gagal memuat detail postingan", "error");
        setShowModal(false);
      }
    } catch (err) {
      Swal.fire("Error", "Gagal memuat detail postingan", "error");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
    setPostDetail(null);
    setCommentText("");
  };

  // Handle add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      Swal.fire("Perhatian", "Komentar tidak boleh kosong", "warning");
      return;
    }

    setCommentLoading(true);
    try {
      const res = await addComment(selectedPost.id, commentText.trim());
      if (res.success) {
        setCommentText("");
        // Reload post detail
        const detailRes = await getPostDetail(selectedPost.id);
        if (detailRes.success) {
          setPostDetail(detailRes.data.post);
        }
        refreshPosts();
      } else {
        Swal.fire("Gagal", res.message || "Gagal menambah komentar", "error");
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || "Gagal menambah komentar";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async () => {
    const result = await Swal.fire({
      title: "Hapus Komentar?",
      text: "Komentar kamu akan dihapus dari postingan ini",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e53e3e",
    });

      if (result.isConfirmed) {
        try {
        const res = await deleteComment(selectedPost.id);
          if (res.success) {
          // Reload post detail
          const detailRes = await getPostDetail(selectedPost.id);
          if (detailRes.success) {
            setPostDetail(detailRes.data.post);
          }
          refreshPosts();
        } else {
          Swal.fire("Gagal", res.message || "Gagal menghapus komentar", "error");
        }
      } catch (err) {
        const errorMessage = err.message || err.response?.data?.message || "Gagal menghapus komentar";
        Swal.fire("Error", errorMessage, "error");
      }
    }
  };

  // Handle open edit modal
  const handleEditPost = (post) => {
    setEditPost(post);
    setEditDescription(post.description || "");
    setEditPreview(post.cover || null);
    setShowEditModal(true);
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditPost(null);
    setEditDescription("");
    setEditCover(null);
    setEditPreview(null);
  };

  // Handle cover change
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setEditCover(file);
    if (file) {
      setEditPreview(URL.createObjectURL(file));
    }
  };

  // Handle update description
  const handleUpdateDescription = async (e) => {
    e.preventDefault();
    if (!editDescription.trim()) {
      Swal.fire("Perhatian", "Deskripsi tidak boleh kosong", "warning");
      return;
    }

    setEditLoading(true);
    try {
      const res = await updatePost(editPost.id, editDescription.trim());
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.message || "Deskripsi berhasil diubah",
          timer: 1500,
          showConfirmButton: false,
        });
        handleCloseEditModal();
        refreshPosts();
      } else {
        Swal.fire("Gagal", res.message || "Gagal mengubah deskripsi", "error");
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || "Gagal mengubah deskripsi";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle change cover
  const handleChangeCover = async () => {
    if (!editCover) {
      Swal.fire("Perhatian", "Pilih gambar baru terlebih dahulu", "warning");
      return;
    }

    setCoverLoading(true);
    try {
      const res = await changeCoverPost(editPost.id, editCover);
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.message || "Cover berhasil diubah",
          timer: 1500,
          showConfirmButton: false,
        });
        handleCloseEditModal();
        refreshPosts();
      } else {
        Swal.fire("Gagal", res.message || "Gagal mengubah cover", "error");
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || "Gagal mengubah cover";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setCoverLoading(false);
    }
  };

  if (loading) {
            return (
      <div className="posts-list-loading">
        <div className="loading-spinner"></div>
        <p>Memuat postingan...</p>
      </div>
    );
  }

  return (
    <div className="posts-list-container">
      {/* Header */}
      <div className="posts-header">
        <div className="header-content">
          <h1>📢 Feed Postingan</h1>
          <p>Jelajahi dan bagikan momen terbaik bersama komunitas</p>
                        </div>
        <button
          onClick={() => navigate("/add-post")}
          className="add-post-btn"
        >
          <span className="btn-icon">➕</span>
          Buat Postingan
        </button>
                  </div>

      {/* Filters and Search */}
      <div className="posts-controls">
        <div className="filter-tabs">
                    <button
            onClick={() => handleFilterChange("all")}
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
                    >
            <span className="tab-icon">🌍</span>
            Semua Postingan
                    </button>
                    <button
            onClick={() => handleFilterChange("my-posts")}
            className={`filter-tab ${filter === "my-posts" ? "active" : ""}`}
                    >
            <span className="tab-icon">👤</span>
            Postingan Saya
                    </button>
        </div>

        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari postingan atau penulis..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
                    <button
                onClick={() => setSearchTerm("")}
                className="clear-search-btn"
                    >
                ✕
                    </button>
            )}
                  </div>
                </div>
              </div>

      {/* Posts Grid */}
      <div className="posts-content">
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {searchTerm ? "🔍" : filter === "my-posts" ? "📝" : "📭"}
            </div>
            <h3>
              {searchTerm
                ? "Tidak ada hasil pencarian"
                : filter === "my-posts"
                ? "Belum ada postingan"
                : "Belum ada postingan"}
            </h3>
            <p>
              {searchTerm
                ? `Tidak ditemukan postingan dengan kata kunci "${searchTerm}"`
                : filter === "my-posts"
                ? "Mulai bagikan momen terbaikmu dengan membuat postingan pertama"
                : "Jadilah yang pertama untuk memulai percakapan"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/add-post")}
                className="create-first-post-btn"
              >
                <span className="btn-icon">➕</span>
                Buat Postingan Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                refreshPosts={refreshPosts}
                onOpenModal={handleOpenModal}
                onEditPost={handleEditPost}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {filteredPosts.length > 0 && (
        <div className="posts-stats">
          <div className="stat-item">
            <span className="stat-number">{filteredPosts.length}</span>
            <span className="stat-label">
              {filter === "my-posts" ? "Postingan Saya" : "Total Postingan"}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {filteredPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)}
            </span>
            <span className="stat-label">Total Likes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {filteredPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)}
            </span>
            <span className="stat-label">Total Komentar</span>
          </div>
        </div>
      )}

      {/* Modal for Post Detail and Comments */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📖 Detail Postingan</h2>
              <button onClick={handleCloseModal} className="close-btn">
                ✕
              </button>
            </div>

            {modalLoading ? (
              <div className="modal-loading">
                <div className="spinner"></div>
                <p>Memuat detail postingan...</p>
              </div>
            ) : postDetail ? (
              <div className="modal-body">
                {/* Post Content */}
                <div className="modal-post-content">
                  <div className="modal-author-info">
                    <div className="modal-author-avatar">
                      {postDetail.author?.photo ? (
                        <img src={postDetail.author.photo} alt={postDetail.author.name} />
                      ) : (
                        <div className="modal-avatar-placeholder">
                          {postDetail.author?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="modal-author-details">
                      <h3>{postDetail.author?.name || "User"}</h3>
                      <p>{formatDate(postDetail.created_at)}</p>
                    </div>
                  </div>

                  {postDetail.cover && (
                    <div className="modal-post-image">
                      <img src={postDetail.cover} alt="Post" />
                    </div>
                  )}

                  <div className="modal-post-description">
                    <p>{postDetail.description}</p>
                  </div>

                  <div className="modal-post-stats">
                    <div className="modal-stat-item">
                      <span className="modal-stat-icon">❤️</span>
                      <span>{postDetail.likes?.length || 0} Likes</span>
                    </div>
                    <div className="modal-stat-item">
                      <span className="modal-stat-icon">💬</span>
                      <span>{postDetail.comments?.length || 0} Komentar</span>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="modal-comments-section">
                  <h3>💬 Komentar ({postDetail.comments?.length || 0})</h3>

                  <div className="modal-comments-list">
                    {postDetail.comments?.length > 0 ? (
                      postDetail.comments.map((comment) => (
                        <div key={comment.id} className="modal-comment-item">
                          <div className="modal-comment-content">
                            <p className="modal-comment-text">{comment.comment}</p>
                            <p className="modal-comment-date">
                              {formatDate(comment.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="modal-no-comments">
                        <div className="modal-no-comments-icon">💭</div>
                        <p>Belum ada komentar. Jadilah yang pertama!</p>
                      </div>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="modal-add-comment-form">
                    <div className="modal-comment-input-group">
                      <textarea
                        className="modal-comment-input"
                        placeholder="Tulis komentar kamu di sini..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        maxLength="300"
                        rows="3"
                      />
                      <div className="modal-comment-actions">
                        <div className="modal-char-counter">
                          {commentText.length}/300
                        </div>
                        <button
                          type="submit"
                          className="modal-submit-comment-btn"
                          disabled={commentLoading || !commentText.trim()}
                        >
                          {commentLoading ? (
                            <>
                              <span className="spinner"></span>
                              Mengirim...
                            </>
                          ) : (
                            <>
                              <span className="btn-icon">💬</span>
                              Kirim
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Delete Comment Button */}
                  {postDetail.my_comment && (
                    <button
                      onClick={handleDeleteComment}
                      className="modal-delete-comment-btn"
                    >
                      <span className="btn-icon">🗑️</span>
                      Hapus Komentar Saya
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Postingan</h2>
              <button onClick={handleCloseEditModal} className="close-btn">
                ✕
              </button>
            </div>

            <div className="edit-modal-body">
              {/* Current Cover Display */}
              {editPreview && (
                <div className="edit-current-cover">
                  <h3>🖼️ Cover Saat Ini</h3>
                  <div className="edit-cover-preview">
                    <img src={editPreview} alt="Current cover" />
                  </div>
                </div>
              )}

              {/* Change Cover Section */}
              <div className="edit-change-cover">
                <h3>🔄 Ganti Cover</h3>
                <div className="edit-cover-upload">
                  <input
                    type="file"
                    className="edit-cover-input"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleCoverChange}
                  />
                  <div className="edit-upload-placeholder">
                    <div className="edit-upload-icon">📷</div>
                    <p>Klik untuk pilih gambar baru</p>
                    <small>PNG, JPG, JPEG (maks 5MB)</small>
                  </div>
                </div>
                {editCover && (
                  <button
                    onClick={handleChangeCover}
                    className="edit-change-cover-btn"
                    disabled={coverLoading}
                  >
                    {coverLoading ? (
                      <>
                        <span className="spinner"></span>
                        Mengubah Cover...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">🔄</span>
                        Ubah Cover
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Update Description Section */}
              <div className="edit-description-section">
                <h3>📝 Ubah Deskripsi</h3>
                <form onSubmit={handleUpdateDescription} className="edit-description-form">
                  <div className="edit-description-input-group">
                    <label className="edit-form-label">
                      <span className="edit-label-icon">✍️</span>
                      Deskripsi
                    </label>
                    <textarea
                      className="edit-description-textarea"
                      rows="6"
                      placeholder="Tulis deskripsi postingan yang baru..."
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      maxLength="500"
                    />
                    <div className="edit-char-counter">
                      {editDescription.length}/500 karakter
                    </div>
                  </div>

                  <div className="edit-description-actions">
                    <button
                      type="button"
                      className="edit-cancel-btn"
                      onClick={handleCloseEditModal}
                      disabled={editLoading}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="edit-update-btn"
                      disabled={editLoading || !editDescription.trim()}
                    >
                      {editLoading ? (
                        <>
                          <span className="spinner"></span>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">💾</span>
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .posts-list-container {
          min-height: 100vh;
          background: white;
          padding: 20px;
        }

        .posts-list-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .posts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .header-content h1 {
          font-size: 32px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 8px 0;
        }

        .header-content p {
          font-size: 16px;
          color: #718096;
          margin: 0;
        }

        .add-post-btn {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
        }

        .add-post-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
        }

        .posts-controls {
          background: white;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }

        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .filter-tab {
          flex: 1;
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          background: #f7fafc;
          color: #4a5568;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .filter-tab:hover {
          border-color: #cbd5e0;
          background: #edf2f7;
        }

        .filter-tab.active {
          background: #2196f3;
          color: white;
          border-color: transparent;
        }

        .tab-icon {
          font-size: 18px;
        }

        .search-container {
          width: 100%;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          font-size: 18px;
          color: #718096;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 16px 16px 16px 50px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          background: #f7fafc;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-input::placeholder {
          color: #a0aec0;
        }

        .clear-search-btn {
          position: absolute;
          right: 16px;
          background: #e2e8f0;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #718096;
          transition: all 0.3s ease;
        }

        .clear-search-btn:hover {
          background: #cbd5e0;
          color: #4a5568;
        }

        .posts-content {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #718096;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 12px;
        }

        .empty-state p {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .create-first-post-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .create-first-post-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .posts-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 30px;
          background: white;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #718096;
          font-weight: 500;
        }

        .btn-icon {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .posts-list-container {
            padding: 10px;
          }
          
          .posts-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .header-content h1 {
            font-size: 24px;
          }
          
          .filter-tabs {
            flex-direction: column;
          }
          
          .posts-grid {
            grid-template-columns: 1fr;
          }
          
          .posts-stats {
            flex-direction: column;
            gap: 20px;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h2 {
          color: #2d3748;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .close-btn {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
          color: #4a5568;
        }

        .close-btn:hover {
          background: #edf2f7;
          border-color: #cbd5e0;
        }

        .modal-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #718096;
        }

        .modal-loading .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        .modal-body {
          padding: 30px;
        }

        .modal-post-content {
          margin-bottom: 30px;
        }

        .modal-author-info {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .modal-author-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-avatar-placeholder {
          font-size: 20px;
          font-weight: 600;
          color: #4a5568;
        }

        .modal-author-details h3 {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 4px 0;
        }

        .modal-author-details p {
          font-size: 14px;
          color: #718096;
          margin: 0;
        }

        .modal-post-image {
          margin-bottom: 20px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .modal-post-image img {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          display: block;
        }

        .modal-post-description {
          margin-bottom: 20px;
        }

        .modal-post-description p {
          font-size: 16px;
          line-height: 1.6;
          color: #2d3748;
          margin: 0;
        }

        .modal-post-stats {
          display: flex;
          gap: 20px;
          padding: 15px;
          background: #f7fafc;
          border-radius: 10px;
        }

        .modal-stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4a5568;
          font-weight: 500;
        }

        .modal-stat-icon {
          font-size: 18px;
        }

        .modal-comments-section {
          border-top: 1px solid #e2e8f0;
          padding-top: 30px;
        }

        .modal-comments-section h3 {
          font-size: 20px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 20px;
        }

        .modal-comments-list {
          margin-bottom: 25px;
        }

        .modal-comment-item {
          background: #f7fafc;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .modal-comment-text {
          font-size: 15px;
          line-height: 1.5;
          color: #2d3748;
          margin: 0 0 8px 0;
        }

        .modal-comment-date {
          font-size: 12px;
          color: #718096;
          margin: 0;
        }

        .modal-no-comments {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
        }

        .modal-no-comments-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .modal-add-comment-form {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .modal-comment-input-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .modal-comment-input {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 15px;
          font-size: 15px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
          background: #f7fafc;
        }

        .modal-comment-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modal-comment-input::placeholder {
          color: #a0aec0;
        }

        .modal-comment-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-char-counter {
          font-size: 14px;
          color: #718096;
        }

        .modal-submit-comment-btn {
          padding: 10px 20px;
          background: #48bb78;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-submit-comment-btn:hover:not(:disabled) {
          background: #38a169;
          transform: translateY(-2px);
        }

        .modal-submit-comment-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .modal-delete-comment-btn {
          margin-top: 15px;
          padding: 10px 20px;
          background: #e53e3e;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
        }

        .modal-delete-comment-btn:hover {
          background: #c53030;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
          }
          
          .modal-content {
            max-height: 95vh;
          }
          
          .modal-header {
            padding: 15px 20px;
          }
          
          .modal-body {
            padding: 20px;
          }
          
          .modal-header h2 {
            font-size: 20px;
          }
        }

        /* Edit Modal Styles */
        .edit-modal-content {
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .edit-modal-body {
          padding: 20px;
        }

        .edit-current-cover {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 2px dashed #e2e8f0;
        }

        .edit-current-cover h3 {
          margin: 0 0 15px 0;
          color: #2d3748;
          font-size: 16px;
        }

        .edit-cover-preview {
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .edit-cover-preview img {
          width: 100%;
          height: auto;
          display: block;
        }

        .edit-change-cover {
          margin-bottom: 30px;
          padding: 20px;
          background: #f0f9ff;
          border-radius: 12px;
          border: 2px dashed #0ea5e9;
        }

        .edit-change-cover h3 {
          margin: 0 0 15px 0;
          color: #0c4a6e;
          font-size: 16px;
        }

        .edit-cover-upload {
          position: relative;
          margin-bottom: 15px;
        }

        .edit-cover-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .edit-upload-placeholder {
          padding: 30px 20px;
          text-align: center;
          background: white;
          border: 2px dashed #0ea5e9;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .edit-upload-placeholder:hover {
          background: #f0f9ff;
          border-color: #0284c7;
        }

        .edit-upload-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .edit-upload-placeholder p {
          margin: 0 0 5px 0;
          color: #0c4a6e;
          font-weight: 500;
        }

        .edit-upload-placeholder small {
          color: #64748b;
          font-size: 12px;
        }

        .edit-change-cover-btn {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .edit-change-cover-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .edit-change-cover-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .edit-description-section {
          padding: 20px;
          background: #fefce8;
          border-radius: 12px;
          border: 2px dashed #eab308;
        }

        .edit-description-section h3 {
          margin: 0 0 15px 0;
          color: #a16207;
          font-size: 16px;
        }

        .edit-description-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .edit-description-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .edit-form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #a16207;
          font-size: 14px;
        }

        .edit-label-icon {
          font-size: 16px;
        }

        .edit-description-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          min-height: 120px;
          transition: border-color 0.3s ease;
        }

        .edit-description-textarea:focus {
          outline: none;
          border-color: #eab308;
          box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.1);
        }

        .edit-char-counter {
          text-align: right;
          font-size: 12px;
          color: #64748b;
        }

        .edit-description-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .edit-cancel-btn {
          background: #f1f5f9;
          color: #475569;
          border: 2px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-cancel-btn:hover:not(:disabled) {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .edit-cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .edit-update-btn {
          background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .edit-update-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
        }

        .edit-update-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .edit-modal-content {
            width: 95%;
            margin: 10px;
          }
          
          .edit-modal-body {
            padding: 15px;
          }
          
          .edit-description-actions {
            flex-direction: column;
          }
          
          .edit-cancel-btn,
          .edit-update-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
