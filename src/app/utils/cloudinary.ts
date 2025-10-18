/**
 * Cloudinary Upload Utility
 * Handles image uploads to Cloudinary with loading states and error handling
 */

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image to Cloudinary
 * @param file - The image file to upload
 * @param uploadPreset - Cloudinary upload preset (configured in Cloudinary dashboard)
 * @param cloudName - Your Cloudinary cloud name
 * @returns Promise with upload result containing URL or error
 */
export const uploadImageToCloudinary = async (
  file: File,
  uploadPreset: string = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
  cloudName: string = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
): Promise<UploadResult> => {
  try {
    // Validate inputs
    if (!uploadPreset || !cloudName) {
      return {
        success: false,
        error:
          "Cloudinary configuration is missing. Please check your environment variables.",
      };
    }

    if (!file) {
      return {
        success: false,
        error: "No file provided for upload.",
      };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Please select a valid image file (JPG, PNG, GIF, etc.).",
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Image file size must be less than 5MB.",
      };
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    // Optional: Add folder organization
    formData.append("folder", "uni-evoting/candidates");

    // Note: Transformations must be configured in the upload preset, not here
    // For unsigned uploads, transformations should be set in the Cloudinary dashboard

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || "Upload failed. Please try again.",
      };
    }

    const data: CloudinaryUploadResponse = await response.json();

    return {
      success: true,
      url: data.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
};

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @returns Object with validation result
 */
export const validateImageFile = (
  file: File | null
): {
  isValid: boolean;
  error?: string;
} => {
  if (!file) {
    return { isValid: false, error: "Please select a file." };
  }

  if (!file.type.startsWith("image/")) {
    return {
      isValid: false,
      error: "Please select a valid image file (JPG, PNG, GIF, etc.).",
    };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "Image file size must be less than 5MB.",
    };
  }

  return { isValid: true };
};

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
