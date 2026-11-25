import { ValidationError } from '../domain/errors.js';

const fail = (message) => new ValidationError(message, { avatar: message });

// Crops the picture to a centered square and shrinks it (default 160 x 160).
// This keeps it small enough to save in localStorage.
export function resizeImage(file, size = 160) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(fail('Choose an image file (JPG, PNG or WebP).'));
    if (file.size > 5 * 1024 * 1024) return reject(fail('The image must be smaller than 5 MB.'));

    const reader = new FileReader();
    reader.onerror = () => reject(fail('Could not read that file. Try another image.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(fail('That image could not be opened. Try another one.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const side = Math.min(img.width, img.height);
        canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}