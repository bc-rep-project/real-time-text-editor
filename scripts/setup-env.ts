import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '../.env.local');

// Check if service account file exists
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  const envContent = `
# Firebase Admin SDK
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"
`;

  // Append to .env.local if it exists, create if it doesn't
  fs.writeFileSync(envPath, envContent, { flag: 'a' });
  console.log('Firebase credentials added to .env.local');
} catch (error) {
  console.error('Error setting up environment variables:', error);
} 