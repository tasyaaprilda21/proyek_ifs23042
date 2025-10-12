import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { addLike, deletePost } from "../services/postService";

export default function PostCard({ post, refreshPosts, onOpenModal, onEditPost }) {
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem("user"));
  
  // Check if this post belongs to current user
  const isMyPost = currentUser && (post.user_id === currentUser.id || post.author?.id === currentUser.id);

  const cover = post?.cover || "https://via.placeholder.com/400x250?text=No+Image";
  const authorName = post.author?.name || post.user?.name || "User";
  const authorPhoto = post.author?.photo;
  const likesCount = post.likes?.length || 0;
  const commentsCount = (post.comments || post.comment || []).length;

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

  // Handle like
  const handleLike = async () => {
    if (likeLoading) return;
    
    setLikeLoading(true);
    try {
      const res = await addLike(post.id);
      if (res.success) {
        refreshPosts?.();
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

  // Handle delete
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus Postingan?",
      text: "Postingan ini akan dihapus secara permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e53e3e",
    });

    if (result.isConfirmed) {
      setDeleteLoading(true);
      try {
        const res = await deletePost(post.id);
        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: res.message || "Postingan berhasil dihapus",
            timer: 1500,
            showConfirmButton: false,
          });
          refreshPosts?.();
        } else {
          Swal.fire("Gagal", res.message || "Gagal menghapus postingan", "error");
        }
      } catch (err) {
        const errorMessage = err.message || err.response?.data?.message || "Gagal menghapus postingan";
        Swal.fire("Error", errorMessage, "error");
      } finally {
        setDeleteLoading(false);
      }
    }
  };



  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
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
            <h4 className="author-name">{authorName}</h4>
            <p className="post-time">{formatDate(post.created_at)}</p>
          </div>
        </div>
        
        {/* Action buttons for own posts */}
        {isMyPost && (
          <div className="post-owner-actions">
            <button
              onClick={() => onEditPost?.(post)}
              className="edit-post-btn"
              title="Edit postingan"
            >
              <span className="btn-icon">✏️</span>
            </button>
            <button
              onClick={handleDelete}
              className="delete-btn"
              disabled={deleteLoading}
              title="Hapus postingan"
            >
              {deleteLoading ? (
                <span className="spinner"></span>
              ) : (
                <span className="btn-icon">🗑️</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Post Image */}
      <div className="post-image-container">
        <img src={cover} alt="Post" className="post-image" />
        </div>

      {/* Post Content */}
      <div className="post-content">
        <p className="post-description">{post.description}</p>

        {/* Post Stats */}
        <div className="post-stats">
          <button
            onClick={handleLike}
            className={`like-stat ${likeLoading ? 'loading' : ''}`}
            disabled={likeLoading}
          >
            {likeLoading ? (
              <span className="spinner"></span>
            ) : (
              <span className="stat-icon">❤️</span>
            )}
            <span className="stat-count">{likesCount}</span>
          </button>
          <Link to={`/post/${post.id}`} className="comment-stat">
            <span className="stat-icon">💬</span>
            <span className="stat-count">{commentsCount}</span>
          </Link>
        </div>


        {/* Action Buttons */}
        <div className="post-actions">
          <button
            onClick={handleLike}
            className={`action-btn like-btn ${likeLoading ? 'loading' : ''}`}
            disabled={likeLoading}
          >
            {likeLoading ? (
              <span className="spinner"></span>
            ) : (
              <span className="btn-icon">❤️</span>
            )}
            Like
          </button>
          <button
            onClick={() => onOpenModal?.(post)}
            className="action-btn detail-btn"
          >
            <span className="btn-icon">👁️</span>
            Detail
          </button>
        </div>
      </div>


      <style jsx>{`
        .post-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 20px;
          animation: slideUp 0.6s ease-out;
        }

        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          background: #e3f2fd;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        .author-details {
          flex: 1;
        }

        .author-name {
          font-size: 16px;
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 2px 0;
        }

        .post-time {
          font-size: 12px;
          color: #718096;
          margin: 0;
        }

        .delete-btn {
          background: #fed7d7;
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn:hover:not(:disabled) {
          background: #feb2b2;
          transform: scale(1.1);
        }

        .delete-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .post-owner-actions {
          display: flex;
          gap: 8px;
        }

        .edit-post-btn {
          background: #bee3f8;
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-post-btn:hover {
          background: #90cdf4;
          transform: scale(1.1);
        }

        .post-image-container {
          width: 100%;
          height: 250px;
          overflow: hidden;
          background: #f7fafc;
        }

        .post-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .post-card:hover .post-image {
          transform: scale(1.05);
        }

        .post-content {
          padding: 20px;
        }

        .post-description {
          font-size: 15px;
          line-height: 1.6;
          color: #2d3748;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .like-stat,
        .comment-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #4a5568;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .like-stat:hover {
          color: #e53e3e;
        }

        .comment-stat:hover {
          color: #3182ce;
        }

        .like-stat.loading {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .stat-icon {
          font-size: 16px;
        }

        .stat-count {
          font-weight: 500;
        }


        .post-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
        }

        .like-btn {
          background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
          color: #c53030;
        }

        .like-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #feb2b2 0%, #fc8181 100%);
          transform: translateY(-2px);
        }

        .like-btn.loading {
          opacity: 0.6;
          cursor: not-allowed;
        }


        .detail-btn {
          background: linear-gradient(135deg, #d6f5d6 0%, #9ae6b4 100%);
          color: #2f855a;
        }

        .detail-btn:hover {
          background: linear-gradient(135deg, #9ae6b4 0%, #68d391 100%);
          transform: translateY(-2px);
        }

        .btn-icon {
          font-size: 16px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .post-card {
            margin-bottom: 16px;
          }
          
          .post-header {
            padding: 12px 16px;
          }
          
          .post-content {
            padding: 16px;
          }
          
          .post-actions {
            flex-direction: column;
            gap: 8px;
          }
          
          .action-btn {
            padding: 12px 16px;
          }
        }

      `}</style>
    </div>
  );
}
