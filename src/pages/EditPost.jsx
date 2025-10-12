import React, { useEffect, useState } from "react";
import { getPostDetail, updatePost, changeCoverPost } from "../services/postService";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [description, setDescription] = useState("");
  const [newCover, setNewCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await getPostDetail(id);
        if (res.success && res.data?.post) {
          setPost(res.data.post);
          setDescription(res.data.post.description || "");
          setPreview(res.data.post.cover || null);
        }
      } catch (err) {
        console.error("Failed to load post:", err);
        Swal.fire("Error", "Gagal memuat data postingan", "error");
      }
    };
    loadPost();
  }, [id]);

  // Handle cover change
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setNewCover(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Update description only
  const handleUpdateDescription = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      Swal.fire("Perhatian", "Deskripsi tidak boleh kosong", "warning");
      return;
    }

    setLoading(true);

    try {
      const res = await updatePost(id, description.trim());
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.message || "Deskripsi berhasil diubah",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/");
      } else {
        Swal.fire("Gagal", res.message || "Gagal mengubah deskripsi", "error");
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || "Gagal mengubah deskripsi";
      Swal.fire("Error", errorMessage, "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Change cover only
  const handleChangeCover = async () => {
    if (!newCover) {
      Swal.fire("Perhatian", "Pilih gambar baru terlebih dahulu", "warning");
      return;
    }

    setCoverLoading(true);

    try {
      const res = await changeCoverPost(id, newCover);
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.message || "Cover berhasil diubah",
          timer: 1500,
          showConfirmButton: false,
        });
        // Reload post data
        const postRes = await getPostDetail(id);
        if (postRes.success && postRes.data?.post) {
          setPost(postRes.data.post);
          setPreview(postRes.data.post.cover);
        }
        setNewCover(null);
      } else {
        Swal.fire("Gagal", res.message || "Gagal mengubah cover", "error");
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || "Gagal mengubah cover";
      Swal.fire("Error", errorMessage, "error");
      console.error(err);
    } finally {
      setCoverLoading(false);
    }
  };

  if (!post) {
    return (
      <div className="edit-post-loading">
        <div className="loading-spinner"></div>
        <p>Memuat data postingan...</p>
      </div>
    );
  }

  return (
    <div className="edit-post-container">
      <div className="edit-post-card">
        <div className="edit-post-header">
          <h2>✏️ Edit Postingan</h2>
          <p>Ubah deskripsi atau gambar postinganmu</p>
        </div>

        {/* Current Cover Display */}
        {preview && (
          <div className="current-cover-section">
            <h3>🖼️ Cover Saat Ini</h3>
            <div className="cover-preview">
              <img src={preview} alt="Current cover" className="current-cover-image" />
            </div>
          </div>
        )}

        {/* Change Cover Section */}
        <div className="change-cover-section">
          <h3>🔄 Ganti Cover</h3>
          <div className="cover-upload-area">
          <input
            type="file"
              className="cover-file-input"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleCoverChange}
            />
            <div className="cover-upload-placeholder">
              <div className="upload-icon">📷</div>
              <p>Klik untuk pilih gambar baru</p>
              <small>PNG, JPG, JPEG (maks 5MB)</small>
            </div>
          </div>
          {newCover && (
            <button
              onClick={handleChangeCover}
              className="change-cover-btn"
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
        <div className="update-description-section">
          <h3>📝 Ubah Deskripsi</h3>
          <form onSubmit={handleUpdateDescription} className="description-form">
            <div className="description-input-group">
              <label className="form-label">
                <span className="label-icon">✍️</span>
                Deskripsi
              </label>
              <textarea
                className="description-textarea"
                rows="6"
                placeholder="Tulis deskripsi postingan yang baru..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength="500"
              />
              <div className="char-counter">
                {description.length}/500 karakter
              </div>
            </div>

            <div className="description-actions">
          <button
            type="button"
                className="cancel-btn"
            onClick={() => navigate(-1)}
                disabled={loading}
          >
            Batal
          </button>
              <button
                type="submit"
                className="update-btn"
                disabled={loading || !description.trim()}
              >
                {loading ? (
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

      <style jsx>{`
        .edit-post-container {
          min-height: 100vh;
          background: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-post-loading {
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

        .edit-post-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 700px;
          animation: slideUp 0.6s ease-out;
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

        .edit-post-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .edit-post-header h2 {
          color: #2d3748;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .edit-post-header p {
          color: #718096;
          font-size: 16px;
          margin: 0;
        }

        .current-cover-section,
        .change-cover-section,
        .update-description-section {
          margin-bottom: 30px;
          padding: 25px;
          border: 2px solid #e2e8f0;
          border-radius: 15px;
          background: #f7fafc;
        }

        .current-cover-section h3,
        .change-cover-section h3,
        .update-description-section h3 {
          color: #2d3748;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cover-preview {
          text-align: center;
        }

        .current-cover-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .cover-upload-area {
          position: relative;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 30px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .cover-upload-area:hover {
          border-color: #667eea;
          background: #edf2f7;
        }

        .cover-file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .cover-upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .upload-icon {
          font-size: 36px;
          opacity: 0.6;
        }

        .cover-upload-placeholder p {
          color: #4a5568;
          font-weight: 500;
          margin: 0;
        }

        .cover-upload-placeholder small {
          color: #718096;
        }

        .change-cover-btn {
          margin-top: 15px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }

        .change-cover-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
        }

        .change-cover-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .description-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .description-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2d3748;
          font-size: 16px;
        }

        .label-icon {
          font-size: 18px;
        }

        .description-textarea {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
          transition: all 0.3s ease;
          background: white;
        }

        .description-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .description-textarea::placeholder {
          color: #a0aec0;
        }

        .char-counter {
          text-align: right;
          font-size: 14px;
          color: #718096;
        }

        .description-actions {
          display: flex;
          gap: 15px;
        }

        .cancel-btn, .update-btn {
          flex: 1;
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cancel-btn {
          background: #f7fafc;
          color: #4a5568;
          border: 2px solid #e2e8f0;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #edf2f7;
          border-color: #cbd5e0;
        }

        .update-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .update-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .update-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 18px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .edit-post-container {
            padding: 10px;
          }
          
          .edit-post-card {
            padding: 25px;
          }
          
          .edit-post-header h2 {
            font-size: 24px;
          }
          
          .description-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
