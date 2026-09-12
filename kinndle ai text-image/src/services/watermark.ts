/**
 * KINNDLE Watermark Service
 * Provides helper functions to stamp and export images with the 'kindle' watermark
 * positioned in the bottom-left corner directly inside the image pixels.
 */

/**
 * Stamps the 'kindle' watermark pill in the bottom-left corner of any image
 * and returns the resulting high-res base64 data URL.
 */
export async function stampWatermarkToDataUrl(imageUrl: string): Promise<string> {
  try {
    let sourceUrl = imageUrl;

    // If it's a remote URL, fetch via proxy or blob to avoid canvas tainting
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      try {
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
        const resp = await fetch(proxyUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          sourceUrl = URL.createObjectURL(blob);
        }
      } catch {
        // Fall back to original URL
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = sourceUrl;
    });

    const canvas = document.createElement('canvas');
    const width = img.naturalWidth || img.width || 1024;
    const height = img.naturalHeight || img.height || 1024;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return imageUrl;

    // Draw base visual
    ctx.drawImage(img, 0, 0, width, height);

    // Calculate proportional font and pill dimensions
    const fontSize = Math.max(16, Math.round(width * 0.024));
    ctx.font = `600 ${fontSize}px monospace, -apple-system, sans-serif`;
    const text = 'kindle';
    const textMetrics = ctx.measureText(text);

    // Watermark placement in bottom-left corner without background box or dot
    const margin = Math.max(16, Math.round(width * 0.028));
    const x = margin;
    const y = height - margin;

    ctx.save();
    // Subtle shadow so text is visible on any image background without a box
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = Math.max(4, Math.round(fontSize * 0.35));
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Pure watermark text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, x, y);
    ctx.restore();

    if (sourceUrl.startsWith('blob:')) {
      URL.revokeObjectURL(sourceUrl);
    }

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Could not bake watermark into data URL, using original URL:', err);
    return imageUrl;
  }
}

export async function downloadImageWithWatermark(imageUrl: string, filename: string = `kindle-${Date.now()}.png`): Promise<void> {
  try {
    // If it's already a watermarked data URL, download directly
    if (imageUrl.startsWith('data:image/')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Otherwise stamp and export
    const watermarkedDataUrl = await stampWatermarkToDataUrl(imageUrl);
    const link = document.createElement('a');
    link.href = watermarkedDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    fallbackDirectDownload(imageUrl, filename);
  }
}

function fallbackDirectDownload(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
