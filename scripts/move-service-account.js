import { copyFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const sourceFile = join(
    process.env.USERPROFILE || process.env.HOME,
    'Downloads',
    'real-time-text-editor-be6aa-firebase-adminsdk-trw0k-ebe22b0163.json'
  );
  
  const destFile = join(
    dirname(__dirname),
    'real-time-text-editor-be6aa-firebase-adminsdk-trw0k-ebe22b0163.json'
  );

  copyFileSync(sourceFile, destFile);
  console.log('Service account file moved successfully!');
} catch (error) {
  console.error('Error moving service account file:', error);
} 