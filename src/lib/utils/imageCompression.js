import imageCompression from 'browser-image-compression';

export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8
  };

  const compressionOptions = {
    ...defaultOptions,
    ...options
  };

  try {
    // Only compress if it's an image
    if (!file.type.startsWith('image/')) {
      return file;
    }

    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Create a new file with the compressed data
    return new File([compressedFile], file.name, {
      type: file.type,
      lastModified: file.lastModified
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    // If compression fails, return original file
    return file;
  }
}; 