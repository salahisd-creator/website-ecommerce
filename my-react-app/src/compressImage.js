/* =========================================================
   compressImage.js  ←  src/compressImage.js
   يصغّر الصورة (حتى 1280px) ويحوّلها إلى WebP قبل رفعها: متجر أسرع وتخزين أقل.
   عند أي فشل أو إن لم تصغر الصورة يرجع الملف الأصلي كما هو.
   ========================================================= */
export async function compressImage(file, { max = 1280, quality = 0.82 } = {}) {
  try {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej(new Error("decode"));
        i.src = url;
      });
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * k));
      c.height = Math.max(1, Math.round(img.height * k));
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const blob = await new Promise((res) => c.toBlob(res, "image/webp", quality));
      if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
      const base = (file.name || "image").replace(/\.[^.]+$/, "");
      return new File([blob], base + ".webp", { type: "image/webp" });
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return file;
  }
}
