import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
  client_id: string;
}

// Function to generate a secure random string
function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('base64');
}

// Function to read and format Firebase service account
function setupEnvironment(): void {
  try {
    // Path to your service account file
    const serviceAccountPath = join(
      process.cwd(), 
      'real-time-text-editor-be6aa-firebase-adminsdk-trw0k-ebe22b0163.json'
    );
    
    // Read service account file
    const serviceAccount: ServiceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf8')
    );
    
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
    writeFileSync(join(process.cwd(), '.env.local'), envContent);
    
    console.log('Environment files created successfully!');
    console.log('\nNextAuth Secret (copy this for Vercel):', nextAuthSecret);
    console.log('\nMake sure to add these environment variables to your Vercel project settings.');
    
  } catch (error) {
    console.error('Error setting up environment:', error);
    console.error('Make sure your service account file exists and is in the correct location.');
  }
}

// Run the setup
setupEnvironment(); 