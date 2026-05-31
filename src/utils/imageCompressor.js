import imageCompression from 'browser-image-compression';

export const compressImage = async (file) => {
  if (file.type === 'application/pdf') return file;
  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });
};
