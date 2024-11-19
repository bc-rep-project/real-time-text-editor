const fs = require('fs');
const path = require('path');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const sourceFile = path.join(
    process.env.USERPROFILE || process.env.HOME,
    'Downloads',
    'real-time-text-editor-be6aa-firebase-adminsdk-trw0k-ebe22b0163.json'
  );
  
  const destFile = path.join(
    path.dirname(__dirname),
    'real-time-text-editor-be6aa-firebase-adminsdk-trw0k-ebe22b0163.json'
  );

  fs.copyFileSync(sourceFile, destFile);
  console.log('Service account file moved successfully!');
} catch (error) {
  console.error('Error moving service account file:', error);
} 