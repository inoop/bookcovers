const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

/** Resolve a potentially-relative media_url from the backend to a full absolute URL. */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  return `${API_BASE}${url}`;
}

/** Generate a small JPEG data-URL thumbnail from an image File (max 300px on longest side). */
export function createThumbnail(file: File, maxSize = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(blobUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('Image load failed'));
    };
    img.src = blobUrl;
  });
}
