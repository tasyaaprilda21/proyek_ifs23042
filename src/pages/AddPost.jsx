import React, { useState } from "react";
import { addPost } from "../services/postService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AddPost() {
  const [cover, setCover] = useState(null);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCover(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      Swal.fire("Perhatian", "Deskripsi tidak boleh kosong", "warning");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      if (cover) fd.append("cover", cover);
      fd.append("description", description.trim());

      const res = await addPost(fd);
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.message || "Postingan berhasil dibuat",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/");
      } else {
        Swal.fire("Gagal", res.message || "Data tidak valid", "error");
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || "Gagal menambah postingan";
      Swal.fire("Error", errorMessage, "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-post-container">
      <div className="add-post-card">
        <div className="add-post-header">
          <h2>✨ Buat Postingan Baru</h2>
          <p>Bagikan momen terbaikmu dengan komunitas</p>
        </div>

        <form onSubmit={handleSubmit} className="add-post-form">
          {/* Image Upload Section */}
          <div className="image-upload-section">
            <div className="image-upload-area">
              {preview ? (
                <div className="image-preview">
                  <img src={preview} alt="Preview" className="preview-image" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setCover(null);
                      setPreview(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <p>Klik untuk upload gambar</p>
                  <small>PNG, JPG, JPEG (maks 5MB)</small>
                </div>
              )}
              <input
                type="file"
                className="file-input"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="description-section">
            <label className="form-label">
              <span className="label-icon">✍️</span>
              Deskripsi
            </label>
            <textarea
              className="description-input"
              rows="6"
              placeholder="Apa yang ingin kamu bagikan hari ini? Tuliskan cerita, pemikiran, atau momen spesialmu..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength="500"
            />
            <div className="char-counter">
              {description.length}/500 karakter
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
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
              className="submit-btn"
              disabled={loading || !description.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Memposting...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Posting Sekarang
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .add-post-container {
          min-height: 100vh;
          background: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-post-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 600px;
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

        .add-post-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .add-post-header h2 {
          color: #2d3748;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .add-post-header p {
          color: #718096;
          font-size: 16px;
          margin: 0;
        }

        .add-post-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .image-upload-section {
          width: 100%;
        }

        .image-upload-area {
          position: relative;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f7fafc;
        }

        .image-upload-area:hover {
          border-color: #667eea;
          background: #edf2f7;
        }

        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .upload-icon {
          font-size: 48px;
          opacity: 0.6;
        }

        .upload-placeholder p {
          color: #4a5568;
          font-weight: 500;
          margin: 0;
        }

        .upload-placeholder small {
          color: #718096;
        }

        .image-preview {
          position: relative;
          display: inline-block;
        }

        .preview-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .remove-image-btn {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #e53e3e;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .remove-image-btn:hover {
          background: #c53030;
          transform: scale(1.1);
        }

        .description-section {
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

        .description-input {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
          transition: all 0.3s ease;
          background: #f7fafc;
        }

        .description-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .description-input::placeholder {
          color: #a0aec0;
        }

        .char-counter {
          text-align: right;
          font-size: 14px;
          color: #718096;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }

        .cancel-btn, .submit-btn {
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

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .add-post-container {
            padding: 10px;
          }
          
          .add-post-card {
            padding: 25px;
          }
          
          .add-post-header h2 {
            font-size: 24px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
