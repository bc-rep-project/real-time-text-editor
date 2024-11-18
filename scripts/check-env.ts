#!/usr/bin/env node

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingVars.forEach(envVar => {
    console.error(`- ${envVar}`);
  });
  process.exit(1);
}

console.log('✓ All required environment variables are set'); 