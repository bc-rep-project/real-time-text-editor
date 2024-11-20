const { readFileSync } = require('fs');
const { join } = require('path');
const admin = require('firebase-admin');

async function initializeFirestore() {
  try {
    // Initialize Firebase Admin
    const serviceAccountPath = join(
      process.cwd(), 
      'real-time-text-editor-be6aa-firebase-adminsdk-trw0k-ebe22b0163.json'
    );
    
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf8')
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();

    // Create collections with example documents
    const collections = [
      {
        name: 'users',
        example: {
          username: 'example_user',
          password: 'hashed_password',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      {
        name: 'documents',
        example: {
          title: 'Example Document',
          content: '<p>Example content</p>',
          userId: 'example_user_id',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      {
        name: 'versions',
        example: {
          documentId: 'example_document_id',
          content: '<p>Example version content</p>',
          userId: 'example_user_id',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      {
        name: 'chat_messages',
        example: {
          documentId: 'example_document_id',
          userId: 'example_user_id',
          message: 'Example message',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
      }
    ];

    // Create collections and example documents
    for (const collection of collections) {
      const collectionRef = db.collection(collection.name);
      await collectionRef.add(collection.example);
      console.log(`Created collection: ${collection.name}`);
    }

    // Log instructions for creating indexes
    console.log('\nFirestore collections created successfully!');
    console.log('\nTo create indexes, run these commands in your Firebase project:');
    console.log('\nfirebase deploy --only firestore:indexes');
    console.log('\nOr manually create these indexes in the Firebase Console:');
    console.log(`
1. Collection: documents
   - Fields: userId (Ascending), updatedAt (Descending)
   - Fields: title (Ascending), updatedAt (Descending)

2. Collection: versions
   - Fields: documentId (Ascending), createdAt (Descending)

3. Collection: chat_messages
   - Fields: documentId (Ascending), createdAt (Ascending)
`);

    process.exit(0);
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    process.exit(1);
  }
}

initializeFirestore(); 