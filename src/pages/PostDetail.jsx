import React, { useEffect, useState } from "react";
import {
  getPostDetail,
  addComment,
  deleteComment,
  addLike,
} from "../services/postService";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Load post detail
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getPostDetail(id);
      if (res.success) {
        setPost(res.data.post);
      } else {
        Swal.fire("Error", "Gagal memuat detail postingan", "error");
      }
    } catch (err) {
      console.error("Failed to load post:", err);
      Swal.fire("Error", "Gagal memuat detail postingan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      Swal.fire("Perhatian", "Komentar tidak boleh kosong", "warning");
      return;
    }

    setCommentLoading(true);

    try {
      const res = await addComment(id, commentText.trim());
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.message || "Komentar berhasil ditambahkan",
          timer: 1500,
          showConfirmButton: false,
        });
        setCommentText("");
        loadData();
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

  // Delete comment
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
        const res = await deleteComment(id);
        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: res.message || "Komentar berhasil dihapus",
            timer: 1500,
            showConfirmButton: false,
          });
          loadData();
        } else {
          Swal.fire("Gagal", res.message || "Gagal menghapus komentar", "error");
        }
      } catch (err) {
        const errorMessage = err.message || err.response?.data?.message || "Gagal menghapus komentar";
        Swal.fire("Error", errorMessage, "error");
      }
    }
  };

  // Like/Unlike post
  const handleLike = async () => {
    setLikeLoading(true);

    try {
      const res = await addLike(id);
      if (res.success) {
        loadData();
      } else {
        Swal.fire("Gagal", res.message || "Gagal menambah like", "error");
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || "Gagal menambah like";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setLikeLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="loading-spinner"></div>
        <p>Memuat detail postingan...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-error">
        <div className="error-icon">😕</div>
        <h3>Postingan Tidak Ditemukan</h3>
        <p>Postingan yang Anda cari tidak ada atau telah dihapus</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Kembali
        </button>
      </div>
    );
  }

  const authorName = post.author?.name || post.user?.name || "User";
  const authorPhoto = post.author?.photo;
  const likesCount = post.likes?.length || 0;
  const comments = post.comments || [];
  const commentsCount = comments.length;
  const hasMyComment = post.my_comment;

  return (
    <div className="post-detail-container">
      <div className="post-detail-card">
        {/* Header with back button */}
        <div className="post-detail-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Kembali
          </button>
          <h2>📖 Detail Postingan</h2>
        </div>

        {/* Post Content */}
        <div className="post-content">
          {/* Author Info */}
          <div className="author-info">
            <div className="author-avatar">
              {authorPhoto ? (
                <img src={authorPhoto} alt={authorName} />
              ) : (
                <div className="avatar-placeholder">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="author-details">
              <h3 className="author-name">{authorName}</h3>
              <p className="post-date">{formatDate(post.created_at)}</p>
            </div>
          </div>

          {/* Post Image */}
          {post.cover && (
            <div className="post-image-container">
              <img src={post.cover} alt="Post" className="post-image" />
            </div>
          )}

          {/* Post Description */}
          <div className="post-description">
            <p>{post.description}</p>
          </div>

          {/* Post Stats */}
          <div className="post-stats">
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <span className="stat-count">{likesCount} Likes</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💬</span>
              <span className="stat-count">{commentsCount} Komentar</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="post-actions">
            <button
              onClick={handleLike}
              className={`like-btn ${likeLoading ? 'loading' : ''}`}
              disabled={likeLoading}
            >
              {likeLoading ? (
                <span className="spinner"></span>
              ) : (
                <span className="btn-icon">❤️</span>
              )}
              {likeLoading ? 'Loading...' : 'Like'}
            </button>
            
            <Link to={`/edit/${post.id}`} className="edit-btn">
              <span className="btn-icon">✏️</span>
              Edit Post
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3 className="comments-title">
            💬 Komentar ({commentsCount})
          </h3>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-content">
                    <p className="comment-text">{comment.comment}</p>
                    <p className="comment-date">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">
                <div className="no-comments-icon">💭</div>
                <p>Belum ada komentar. Jadilah yang pertama!</p>
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="add-comment-form">
            <div className="comment-input-group">
              <textarea
                className="comment-input"
                placeholder="Tulis komentar kamu di sini..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength="300"
                rows="3"
              />
              <div className="comment-actions">
                <div className="char-counter">
                  {commentText.length}/300
                </div>
                <button
                  type="submit"
                  className="submit-comment-btn"
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
          {hasMyComment && (
            <button
              onClick={handleDeleteComment}
              className="delete-comment-btn"
            >
              <span className="btn-icon">🗑️</span>
              Hapus Komentar Saya
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .post-detail-container {
          min-height: 100vh;
          background: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .post-detail-loading,
        .post-detail-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: white;
          text-align: center;
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

        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .post-detail-error h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .post-detail-error p {
          font-size: 16px;
          opacity: 0.8;
          margin-bottom: 20px;
        }

        .back-btn {
          padding: 12px 24px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .post-detail-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 800px;
          animation: slideUp 0.6s ease-out;
          overflow: hidden;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .post-detail-header {
          padding: 20px 30px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-button {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          color: #4a5568;
        }

        .back-button:hover {
          background: #edf2f7;
          border-color: #cbd5e0;
        }

        .post-detail-header h2 {
          color: #2d3748;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .post-content {
          padding: 30px;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .author-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          font-size: 20px;
          font-weight: 600;
          color: #4a5568;
        }

        .author-details {
          flex: 1;
        }

        .author-name {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 4px 0;
        }

        .post-date {
          font-size: 14px;
          color: #718096;
          margin: 0;
        }

        .post-image-container {
          margin-bottom: 20px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .post-image {
          width: 100%;
          max-height: 500px;
          object-fit: cover;
          display: block;
        }

        .post-description {
          margin-bottom: 20px;
        }

        .post-description p {
          font-size: 16px;
          line-height: 1.6;
          color: #2d3748;
          margin: 0;
        }

        .post-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f7fafc;
          border-radius: 10px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4a5568;
          font-weight: 500;
        }

        .stat-icon {
          font-size: 18px;
        }

        .post-actions {
          display: flex;
          gap: 15px;
        }

        .like-btn,
        .edit-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .like-btn {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
        }

        .like-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
        }

        .like-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .edit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .edit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .comments-section {
          padding: 30px;
          border-top: 1px solid #e2e8f0;
          background: #f7fafc;
        }

        .comments-title {
          font-size: 20px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 20px;
        }

        .comments-list {
          margin-bottom: 25px;
        }

        .comment-item {
          background: white;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .comment-text {
          font-size: 15px;
          line-height: 1.5;
          color: #2d3748;
          margin: 0 0 8px 0;
        }

        .comment-date {
          font-size: 12px;
          color: #718096;
          margin: 0;
        }

        .no-comments {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
        }

        .no-comments-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .add-comment-form {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .comment-input-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .comment-input {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 15px;
          font-size: 15px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
          background: #f7fafc;
        }

        .comment-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .comment-input::placeholder {
          color: #a0aec0;
        }

        .comment-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .char-counter {
          font-size: 14px;
          color: #718096;
        }

        .submit-comment-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
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

        .submit-comment-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
        }

        .submit-comment-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .delete-comment-btn {
          margin-top: 15px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
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

        .delete-comment-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
        }

        .btn-icon {
          font-size: 16px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .post-detail-container {
            padding: 10px;
          }
          
          .post-content,
          .comments-section {
            padding: 20px;
          }
          
          .post-actions {
            flex-direction: column;
          }
          
          .author-info {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
