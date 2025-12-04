import { IMAGE_BASE_URL } from '../config/apiConfig';
import { ProductImage } from '../types/home.types';

export const getImageUrl = (images: (string | ProductImage)[]): string => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://via.placeholder.com/150?text=No+Image';
  }
  
  const firstImage = images[0];
  
  // If it's already a string URL
  if (typeof firstImage === 'string') {
    return firstImage.startsWith('http') ? firstImage : `${IMAGE_BASE_URL}${firstImage}`;
  }
  
  // If it's an image object from Cloudinary
  if (typeof firstImage === 'object' && firstImage !== null) {
    const url = firstImage.url || firstImage.secure_url || firstImage.thumbnail;
    if (url) {
      return url;
    }
  }
  
  return 'https://via.placeholder.com/150?text=No+Image';
};