import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to generate a secure random string
function generateSecret(length = 32) {
  return randomBytes(length).toString('base64');
}

// Function to read and format Firebase service account
function setupEnvironment() {
  try {
    // Path to your service account file
    const serviceAccountPath = join(
      dirname(__dirname), 
      'real-time-text-editor-be6aa-firebase-adminsdk-trw0k-ebe22b0163.json'
    );
    
    // Read service account file
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
    // Generate NextAuth secret
    const nextAuthSecret = generateSecret();
    
    // Create environment variables content
    const envContent = `# NextAuth.js
NEXTAUTH_URL=https://real-time-text-editor-git-bug-cee6e5-johanns-projects-6ef4f9e7.vercel.app
NEXTAUTH_SECRET=${nextAuthSecret}

# Firebase Admin SDK
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=${serviceAccount.client_id}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${serviceAccount.project_id}.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${serviceAccount.project_id}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${serviceAccount.project_id}.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${serviceAccount.client_id}
NEXT_PUBLIC_FIREBASE_APP_ID=${serviceAccount.client_id}`;

    // Write to .env.local
    writeFileSync(join(dirname(__dirname), '.env.local'), envContent);
    
    console.log('Environment files created successfully!');
    console.log('\nNextAuth Secret (copy this for Vercel):', nextAuthSecret);
    console.log('\nMake sure to add these environment variables to your Vercel project settings.');
    
  } catch (error) {
    console.error('Error setting up environment:', error);
    if (error.code === 'ENOENT') {
      console.error('\nService account file not found. Make sure it exists at:', serviceAccountPath);
      console.error('\nYou might need to move it from Downloads to your project directory.');
    }
  }
}

// Run the setup
setupEnvironment(); 