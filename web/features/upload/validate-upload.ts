/** Mobil `lib/mediaUpload` + Edge `upload-validate` limitleriyle hizalı (istemci tarafı). */

export const UPLOAD_LIMITS = {
  imageMaxBytes: 10 * 1024 * 1024,
  videoMaxBytes: 100 * 1024 * 1024,
  postImagesMax: 4,
  shortMaxSeconds: 120,
  minImageBytes: 100,
  minVideoBytes: 2048,
} as const;

const IMAGE_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);

/**
 * Edge `upload-validate`: `media` bucket + signed URL; web: `post-images`/`videos` + public URL — bu fazda Edge çağrılmıyor (TODO: tek pipeline).
 */
export function extFromMime(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "video/webm") return "webm";
  if (mime === "video/quicktime") return "mov";
  return "mp4";
}

export function validateImageFile(file: File): string | null {
  const type = (file.type || "").toLowerCase().trim();
  if (!type || !IMAGE_MIME.has(type)) {
    return "Desteklenmeyen görsel formatı. JPEG, PNG, WebP veya GIF kullanın.";
  }
  if (file.size < UPLOAD_LIMITS.minImageBytes) {
    return "Görsel dosyası çok küçük veya bozuk.";
  }
  if (file.size > UPLOAD_LIMITS.imageMaxBytes) {
    return `Görsel çok büyük (maks. ${Math.round(UPLOAD_LIMITS.imageMaxBytes / 1024 / 1024)} MB).`;
  }
  return null;
}

export function validateVideoFile(file: File): string | null {
  const type = (file.type || "").toLowerCase().trim();
  if (!type || !VIDEO_MIME.has(type)) {
    return "Desteklenmeyen video formatı. MP4, WebM veya MOV kullanın.";
  }
  if (file.size < UPLOAD_LIMITS.minVideoBytes) {
    return "Video dosyası çok küçük veya bozuk.";
  }
  if (file.size > UPLOAD_LIMITS.videoMaxBytes) {
    return `Video çok büyük (maks. ${Math.round(UPLOAD_LIMITS.videoMaxBytes / 1024 / 1024)} MB).`;
  }
  return null;
}

/** MIME ile dosya başı (magic) uyumu — sahte `type` alanını azaltır. */
export async function validateMediaMagicBytes(file: File, kind: "image" | "video"): Promise<string | null> {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (buf.length < 12) return "Dosya okunamadı.";

  if (kind === "image") {
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return null;
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return null;
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return null;
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
      const tag = String.fromCharCode(buf[8] ?? 0, buf[9] ?? 0, buf[10] ?? 0, buf[11] ?? 0);
      if (tag === "WEBP") return null;
    }
    return "Görsel içeriği doğrulanamadı (dosya türü şüpheli).";
  }

  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return null;
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return null;
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x00 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    return null;
  }
  return "Video içeriği doğrulanamadı (dosya türü şüpheli).";
}

export function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

export function loadVideoMeta(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.onloadedmetadata = () => {
      const d = Number.isFinite(v.duration) ? v.duration : 0;
      const w = v.videoWidth || 0;
      const h = v.videoHeight || 0;
      URL.revokeObjectURL(url);
      resolve({ duration: d, width: w, height: h });
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Video önizlemesi okunamadı"));
    };
    v.src = url;
  });
}
