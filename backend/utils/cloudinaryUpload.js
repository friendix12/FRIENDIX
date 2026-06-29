const cloudinary = require('cloudinary').v2;
const CloudinaryConfig = require('../models/CloudinaryConfig');

/**
 * Dynamically configure Cloudinary using the currently active
 * configuration from MongoDB. Falls back to .env if none is set.
 */
const getActiveCloudinaryConfig = async () => {
  try {
    const activeConfig = await CloudinaryConfig.findOne({ isActive: true });
    if (activeConfig) {
      cloudinary.config({
        cloud_name: activeConfig.cloudName,
        api_key: activeConfig.apiKey,
        api_secret: activeConfig.apiSecret,
        secure: true,
      });
      return activeConfig;
    }
  } catch (err) {
    console.error('Cloudinary DB config error, using .env fallback:', err.message);
  }

  // Fallback to .env
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return null;
};

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = async (fileBuffer, folder = 'friendix/posts') => {
  await getActiveCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder, 
        resource_type: 'auto',
        // Auto-optimize quality and convert to compressed formats (like WebP/MP4)
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by publicId
 */
const deleteFromCloudinary = async (publicId) => {
  await getActiveCloudinaryConfig();
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, getActiveCloudinaryConfig };
