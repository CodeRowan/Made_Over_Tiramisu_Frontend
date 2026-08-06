/**
 * Character limits for admin-editable text fields.
 *
 * These are tuned to what the real site layout can hold on both phone and
 * desktop without wrapping into extra lines, overflowing a card, or breaking
 * a fixed-height section — NOT generic "reasonable" limits. The backend
 * enforces the same numbers (see backend/src/utils/validators.js) so a
 * direct API call can't bypass what the admin UI prevents.
 */

export const CONTENT_FIELD_LIMITS: Record<string, Record<string, number>> = {
  hero: { title: 50, subtitle: 90, description: 160 },
  about: { title: 50, subtitle: 60, description: 900 },
  story: { title: 50, subtitle: 70, description: 900 },
  video: { title: 60, description: 140, videoId: 11 },
  testimonials: { title: 60, description: 140 },
  instagram: { title: 30, description: 200 },
  map: { title: 60, description: 140 },
  contact: { title: 60, description: 300 },
  footer: { title: 40, subtitle: 20, description: 160, address: 100, email: 100, phone: 30 },
};

export const PRODUCT_LIMITS = { name: 60, description: 200 };
export const TESTIMONIAL_LIMITS = { name: 50, location: 50, text: 280 };
export const INSTAGRAM_POST_LIMITS = { caption: 300 };
export const LOCATION_LIMITS = { name: 40, address: 100, hours: 60, email: 100, phone: 30 };

// Matches backend/src/routes/uploadRoutes.js multer config
export const MAX_IMAGE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const MAX_VIDEO_SIZE_MB = 100;
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-msvideo',
  'video/3gpp',
  'video/x-matroska',
];
