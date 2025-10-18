# Cloudinary Image Upload Setup

This project uses Cloudinary for image storage and management. Follow these steps to set up Cloudinary for the candidate photo uploads.

## 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Complete the email verification

## 2. Get Your Cloudinary Credentials

From your Cloudinary Dashboard, you'll need:

### Cloud Name

- Found in your dashboard URL: `https://console.cloudinary.com/console/[YOUR_CLOUD_NAME]/`
- Also displayed in the dashboard overview

### Upload Preset (Unsigned)

1. Go to Settings → Upload
2. Scroll down to "Upload presets"
3. Click "Add upload preset"
4. **Basic Settings**:
   - **Preset name**: `uni-evoting-candidates` (or any name you prefer)
   - **Signing Mode**: `Unsigned` **Important: Must be Unsigned for client-side uploads**
   - **Folder**: `uni-evoting/candidates` (optional, for organization)
5. **Image Transformations** (Click on "Incoming Transformation" section):
   - **Mode**: `Scale`
   - **Width**: `400`
   - **Height**: `400`
   - **Crop**: `Fill` (this ensures square 400x400 images)
   - **Quality**: `Auto` (for automatic optimization)
   - **Format**: `Auto` (for best format selection)
6. **Advanced Options** (optional):
   - **Allowed formats**: JPG, PNG, GIF, WEBP
   - **Max file size**: 5242880 bytes (5MB)
7. **Save the preset**

> **Note**: For unsigned uploads, all transformations must be configured in the upload preset. You cannot pass transformation parameters in the upload request itself.## 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Update the values:

```env
# Replace with your actual values
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=uni-evoting-candidates
```

## 4. Restart Your Development Server

```bash
npm run dev
```

## 5. Test the Upload

1. Navigate to `/superadmin/admin1/elections`
2. Click "Details" on any election
3. Go to the "Candidates" tab
4. Click "Add Candidate"
5. Try uploading a candidate photo

## Image Upload Features

### ✅ What's Included

- **Drag & drop** image upload
- **Click to upload** fallback
- **Image validation** (type, size)
- **Loading states** with spinner
- **Preview** of uploaded images
- **Error handling** with user-friendly messages
- **File size limit** (5MB)
- **Auto optimization** (400x400, auto quality)
- **Organized storage** (uploads go to `uni-evoting/candidates/` folder)

### 📁 File Organization

Images are automatically organized in Cloudinary:

```
uni-evoting/
├── candidates/
│   ├── image1.jpg
│   ├── image2.png
│   └── ...
```

### 🔧 Customization Options

You can modify the upload behavior in `/src/app/utils/cloudinary.ts`:

- **File size limit**: Change `maxSize` variable
- **Folder structure**: Modify the `folder` parameter
- **Image transformations**: Update the `transformation` parameter
- **Allowed file types**: Modify validation in `validateImageFile`

## Troubleshooting

### "Transformation parameter is not allowed" Error

If you see this error:

```
Transformation parameter is not allowed when using unsigned upload
```

**Solution**:

1. Remove any transformation parameters from the upload code (already fixed in the codebase)
2. Configure all transformations in your **upload preset** in the Cloudinary dashboard
3. Make sure your upload preset has the "Incoming Transformation" section configured
4. Verify your upload preset is set to "Unsigned" mode

### Upload Preset Issues

- Make sure your upload preset is set to "Unsigned"
- Check that the preset name matches your environment variable exactly
- Verify the preset is active/enabled
- Ensure transformations are configured in the preset, not in code

### Environment Variables

- Make sure `.env.local` exists and has the correct values
- Restart your development server after changing environment variables
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

### Network Issues

- Check your internet connection
- Verify Cloudinary service status
- Check browser console for detailed error messages

### File Upload Issues

- Ensure file is under 5MB
- Use standard image formats (JPG, PNG, GIF)
- Check that JavaScript is enabled in your browser

## Alternative: Manual URL Entry

If you prefer to allow manual URL entry instead of file upload, you can:

1. Update the `CreateCandidateModal.tsx` to include both options
2. Add a toggle between file upload and URL input
3. Keep the existing URL validation schema

## Security Notes

- Upload presets are unsigned for simplicity but consider signed uploads for production
- Consider adding additional upload restrictions (file types, transformations)
- Monitor your Cloudinary usage and set up usage alerts
- For production, consider implementing server-side upload endpoints

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Cloudinary configuration
3. Test uploads directly in the Cloudinary dashboard
4. Check the [Cloudinary documentation](https://cloudinary.com/documentation)
