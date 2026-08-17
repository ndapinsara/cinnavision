// Pure string helpers — safe to import from client components.
// Do not import the Cloudinary SDK here; it is server-only.

const UPLOAD_SEGMENT = "/image/upload/";

/**
 * Rewrites a Cloudinary delivery URL to request a cropped, auto-encoded
 * thumbnail so history lists don't pull full-resolution scans over mobile data.
 * Returns the URL unchanged if it isn't a Cloudinary upload URL.
 */
export function cloudinaryThumb(url: string, size = 160): string {
  const index = url.indexOf(UPLOAD_SEGMENT);
  if (index === -1) return url;

  const head = url.slice(0, index + UPLOAD_SEGMENT.length);
  const tail = url.slice(index + UPLOAD_SEGMENT.length);
  return `${head}w_${size},h_${size},c_fill,q_auto,f_auto/${tail}`;
}
