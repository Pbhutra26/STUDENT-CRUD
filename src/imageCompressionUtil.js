// Utility to compress images before upload using browser-image-compression
import imageCompression from 'browser-image-compression';

export async function compressImage(file, options = { maxSizeMB: 0.7, maxWidthOrHeight: 1024, useWebWorker: true }) {
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // fallback to original if compression fails
  }
}
