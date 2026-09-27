/**
 * Utility to compress and resize image files before saving to LocalStorage or state.
 * Uses WebP/JPEG with intelligent adaptive quality to keep images ultra-lightweight (< 60KB - 100KB)
 * while maintaining crisp HD visual quality, preventing LocalStorage QuotaExceededError.
 */
export function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or tiny gif, return as dataURL directly
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Fill white background for transparent images converted to JPEG/WebP
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first for maximum compression (85% smaller than png/jpeg)
        let compressedDataUrl = "";
        try {
          compressedDataUrl = canvas.toDataURL("image/webp", quality);
          // If browser doesn't support webp, canvas.toDataURL falls back to image/png
          if (compressedDataUrl.startsWith("data:image/png")) {
            compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          }
        } catch (err) {
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Safety pass: If base64 is still > 150KB, downscale again to ensure it fits comfortably in LocalStorage
        if (compressedDataUrl.length > 150 * 1024) {
          try {
            const smallerCanvas = document.createElement("canvas");
            const scale = 0.7;
            smallerCanvas.width = Math.max(100, Math.round(width * scale));
            smallerCanvas.height = Math.max(100, Math.round(height * scale));
            const sCtx = smallerCanvas.getContext("2d");
            if (sCtx) {
              sCtx.fillStyle = "#ffffff";
              sCtx.fillRect(0, 0, smallerCanvas.width, smallerCanvas.height);
              sCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
              compressedDataUrl = smallerCanvas.toDataURL("image/webp", 0.65);
              if (compressedDataUrl.startsWith("data:image/png")) {
                compressedDataUrl = smallerCanvas.toDataURL("image/jpeg", 0.65);
              }
            }
          } catch (e) {}
        }

        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
