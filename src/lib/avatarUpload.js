import { supabase, isSupabaseConfigured } from "./supabase.js";

/**
 * Kompres dan resize gambar foto profil langsung di browser menggunakan HTML Canvas
 * @param {File} file File gambar asli dari input
 * @param {number} maxWidth Ukuran lebar maksimal (default: 500px)
 * @param {number} maxHeight Ukuran tinggi maksimal (default: 500px)
 * @param {number} quality Kualitas kompresi JPEG/WebP (0.1 - 1.0)
 * @returns {Promise<{ blob: Blob, dataUrl: string, sizeKb: number }>}
 */
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_INPUT_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function compressImage(file, maxWidth = 500, maxHeight = 500, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !ALLOWED_MIME_TYPES.has(file.type)) {
      return reject(new Error("Format file harus berupa gambar valid (JPEG, PNG, atau WebP)."));
    }

    if (file.size > MAX_INPUT_FILE_SIZE) {
      return reject(new Error("Ukuran file maksimal 5MB sebelum kompresi."));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Hitung scaling rasio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const outputMime = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(outputMime, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Gagal mengompres gambar."));
            }
            resolve({
              blob,
              dataUrl,
              sizeKb: Math.round(blob.size / 1024),
            });
          },
          outputMime,
          quality
        );
      };

      img.onerror = () => reject(new Error("Gagal membaca data gambar."));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Gagal membaca file dari perangkat."));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload gambar foto profil ke Supabase Storage (Bucket 'avatars')
 * Jika Supabase Storage belum disetup atau gagal, otomatis fallback ke DataURL
 * @param {Blob} blob File blob gambar yang sudah dikompres
 * @param {string} dataUrl Fallback dataUrl jika upload bucket gagal
 * @param {string} userId ID pengguna unik
 * @returns {Promise<string>} URL gambar profil publik atau DataURL
 */
export async function uploadAvatar(blob, dataUrl, userId = "user") {
  if (isSupabaseConfigured && userId) {
    try {
      const cleanUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, "");
      const fileName = `${cleanUserId}/avatar-${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn("Supabase storage upload notice (using fallback):", error.message);
      }
    } catch (err) {
      console.warn("Upload avatar error, using fallback dataUrl:", err);
    }
  }

  // Fallback ke Base64 Data URL jika Supabase Storage belum aktif
  return dataUrl;
}
