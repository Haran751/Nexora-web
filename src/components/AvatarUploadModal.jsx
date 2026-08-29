import { useState, useRef } from "react";
import { compressImage, uploadAvatar } from "../lib/avatarUpload.js";

export default function AvatarUploadModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  userName = "User",
  userId = "user",
  onAvatarSaved,
  onAvatarDeleted,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [compressedData, setCompressedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const initialChar = (userName || "U").trim().charAt(0).toUpperCase();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal 10MB sebelum kompresi.");
      return;
    }

    setErrorMsg("");
    setSelectedFile(file);

    try {
      // Kompres otomatis di browser
      const result = await compressImage(file, 500, 500, 0.85);
      setCompressedData(result);
      setPreviewUrl(result.dataUrl);
    } catch (err) {
      setErrorMsg(err.message || "Gagal memproses gambar.");
    }
  };

  const handleSave = async () => {
    if (!compressedData) {
      setErrorMsg("Pilih foto terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const publicUrl = await uploadAvatar(
        compressedData.blob,
        compressedData.dataUrl,
        userId
      );

      if (onAvatarSaved) {
        onAvatarSaved(publicUrl);
      }
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan foto profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus foto profil ini dan kembali ke avatar inisial?")) {
      if (onAvatarDeleted) {
        onAvatarDeleted();
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setCompressedData(null);
    setErrorMsg("");
    setLoading(false);
    onClose();
  };

  const displayAvatar = previewUrl || currentAvatarUrl;

  return (
    <div className="avatar-modal-overlay" onClick={handleClose}>
      <div
        className="avatar-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="avatar-modal-header">
          <h3>Ubah Foto Profil</h3>
          <button
            type="button"
            className="avatar-modal-close"
            onClick={handleClose}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <div className="avatar-modal-body">
          <div className="avatar-modal-preview-wrapper">
            <div className="avatar-modal-preview">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Preview Foto Profil"
                  className="avatar-modal-img"
                />
              ) : (
                <span className="avatar-modal-char">{initialChar}</span>
              )}
            </div>
            {previewUrl && (
              <span className="avatar-modal-badge">Preview Baru</span>
            )}
          </div>

          {compressedData && (
            <div className="avatar-modal-meta">
              <span className="avatar-modal-filename">{selectedFile?.name}</span>
              <span className="avatar-modal-filesize">
                Ukuran setelah kompresi: ~{compressedData.sizeKb} KB
              </span>
            </div>
          )}

          {errorMsg && <div className="avatar-modal-error">{errorMsg}</div>}

          <div className="avatar-modal-picker">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="cta-btn cta-btn--outline avatar-modal-choose-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              📷 {previewUrl ? "Pilih Foto Lain" : "Pilih File Foto..."}
            </button>
            <p className="avatar-modal-hint">
              Format JPG, PNG, atau WebP. Otomatis dikompres & dioptimasi (max 500×500px).
            </p>
          </div>
        </div>

        <div className="avatar-modal-footer">
          <div className="avatar-modal-footer-left">
            {currentAvatarUrl && (
              <button
                type="button"
                className="avatar-modal-delete-btn"
                onClick={handleDelete}
                disabled={loading}
              >
                Hapus Foto
              </button>
            )}
          </div>
          <div className="avatar-modal-footer-right">
            <button
              type="button"
              className="cta-btn cta-btn--outline"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="button"
              className="cta-btn cta-btn--orange"
              onClick={handleSave}
              disabled={loading || !previewUrl}
            >
              {loading ? "Menyimpan..." : "Simpan Foto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
