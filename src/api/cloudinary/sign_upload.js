import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your cloud name and API secret
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME, // Use the same environment variable name as frontend for consistency
  api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API Key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Your Cloudinary API Secret
  secure: true, // Use HTTPS
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Optional: Implement authentication/authorization here
  // Verify the user is logged in and authorized to upload files
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
     console.warn('Cloudinary sign_upload: No authentication token provided');
     return res.status(401).json({ error: 'Authentication required' });
  }

  // In a real application, you would verify the token with your auth provider (e.g., Firebase Admin SDK)
  // For this example, we'll assume a valid token is present after login
  console.log('Cloudinary sign_upload: Authentication token received (basic check)');

  // Log environment variables (be careful not to log the secret in production logs)
  console.log('Cloudinary Config - Cloud Name:', cloudinary.config().cloud_name);
  console.log('Cloudinary Config - API Key:', cloudinary.config().api_key);
  console.log('Cloudinary Config - API Secret Available:', !!cloudinary.config().api_secret);

  // Validate that critical config is present
  if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
      console.error('Cloudinary environment variables not fully configured.');
      return res.status(500).json({ error: 'Server configuration error: Cloudinary credentials missing.' });
  }

  try {
    const { folder, public_id } = req.body;

    // Validate input from frontend
    if (!folder || !public_id) {
        console.warn('Cloudinary sign_upload: Missing folder or public_id in request body.', { folder, public_id });
        return res.status(400).json({ error: 'Missing required parameters: folder and public_id' });
    }
    console.log('Cloudinary sign_upload: Received folder and public_id', { folder, public_id });

    // Configure options for the signed upload
    const options = {
      folder: folder,
      public_id: public_id,
      // You can add other options here, e.g., tags, type, eager transformations
      tags: 'budget-application', // Example tag
      // resource_type: 'auto', // Automatically detect file type
      timestamp: Math.round((new Date).getTime() / 1000), // Timestamp in seconds
    };

    console.log('Cloudinary sign_upload: Options for signature:', options);

    // Generate the signature
    const signature = cloudinary.utils.api_sign_request(options, cloudinary.config().api_secret);
    console.log('Cloudinary sign_upload: Generated signature (first few chars):', signature ? signature.substring(0, 10) + '...' : 'none');

    // Respond with the signature and other necessary parameters for the frontend upload
    const responseData = {
      signature: signature,
      api_key: cloudinary.config().api_key, // Include API Key for frontend upload
      timestamp: options.timestamp,
      folder: options.folder,
      public_id: options.public_id,
    };
    console.log('Cloudinary sign_upload: Sending response data:', responseData);

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Cloudinary sign_upload error:', error);
    res.status(500).json({ error: 'Failed to generate Cloudinary signature', details: error.message });
  }
} 