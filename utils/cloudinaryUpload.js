// utils/cloudinaryUpload.js

export const uploadImageToCloudinary = async (imageUri) => {
  const CLOUD_NAME = 'dmxl5oa3h';
  const UPLOAD_PRESET = 'campus_notice_upload'; // Replace with your actual unsigned preset

  const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(data.error?.message || 'Image upload failed');
    }
  } catch (error) {
    throw error;
  }
};
