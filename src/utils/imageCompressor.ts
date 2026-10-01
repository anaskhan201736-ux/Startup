/**
 * Client-side image compression utility
 * Resizes images to fit within bounds and compresses to JPEG data URL,
 * saving storage while keeping textbook covers and text crisp.
 */
export async function compressImage(
  file: File,
  maxWidth = 640,
  maxHeight = 640,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    // 4-second safety timeout so image processing never freezes the UI
    const timer = setTimeout(() => {
      resolve('');
    }, 4000);

    const reader = new FileReader();
    reader.onerror = () => {
      clearTimeout(timer);
      resolve('');
    };

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        clearTimeout(timer);
        resolve(reader.result as string || '');
      };

      img.onload = () => {
        clearTimeout(timer);
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string || '');
            return;
          }

          // Draw image with smooth scaling
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(reader.result as string || '');
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
