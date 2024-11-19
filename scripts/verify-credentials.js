const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function formatPrivateKey(key) {
  return key.replace(/\\n/g, '\n');
}

function generateNextAuthSecret() {
  return crypto.randomBytes(32).toString('base64');
}

async function verifyCredentials() {
  try {
    // First, try to find the service account file in the project root
    let serviceAccountPath = path.join(process.cwd(), 'real-time-text-editor-be6aa-firebase-adminsdk-trw0k-ebe22b0163.json');
    
    // If not found, try the Downloads folder
    if (!fs.existsSync(serviceAccountPath)) {
      const downloadsPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads');
      serviceAccountPath = path.join(downloadsPath, 'real-time-text-editor-be6aa-firebase-adminsdk-trw0k-ebe22b0163.json');
      
      if (!fs.existsSync(serviceAccountPath)) {
        console.error('Service account file not found!');
        console.error('Please ensure the Firebase service account JSON file is in either:');
        console.error('1. Project root directory');
        console.error('2. Downloads folder');
        process.exit(1);
      }
    }

    console.log('Found service account file at:', serviceAccountPath);

    // Read and parse service account file
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('Successfully parsed service account file');

    // Generate NextAuth secret
    const nextAuthSecret = generateNextAuthSecret();
    console.log('Generated NextAuth secret');

    // Format credentials for Vercel
    const credentials = {
      FIREBASE_PROJECT_ID: serviceAccount.project_id,
      FIREBASE_CLIENT_EMAIL: serviceAccount.client_email,
      FIREBASE_PRIVATE_KEY: JSON.stringify(serviceAccount.private_key),
      NEXTAUTH_SECRET: nextAuthSecret,
      NEXTAUTH_URL: 'https://real-time-text-editor-git-bug-cee6e5-johanns-projects-6ef4f9e7.vercel.app'
    };

    console.log('\n=== Vercel Environment Variables ===\n');
    Object.entries(credentials).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });

    // Save to .env.local
    const envContent = Object.entries(credentials)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync('.env.local', envContent);
    console.log('\nCredentials saved to .env.local');
    console.log('\nPlease copy these variables to your Vercel project settings.');

  } catch (error) {
    console.error('Error processing credentials:', error);
    process.exit(1);
  }
}

// Run the verification
verifyCredentials().catch(console.error); 