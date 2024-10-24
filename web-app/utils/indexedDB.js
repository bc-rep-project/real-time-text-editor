const DB_NAME = 'OfflineTextEditorDB';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => reject("IndexedDB error: " + event.target.error);
    
    request.onsuccess = (event) => resolve(event.target.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
  });
};

export const saveDocument = async (document) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return store.put(document);
};

export const getDocument = async (id) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onerror = (event) => reject("Error fetching document: " + event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};
