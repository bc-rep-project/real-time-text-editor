
import React, { useState, useEffect } from 'react';
import DocumentList from '../components/DocumentList';
import TextEditor from '../components/TextEditor';

const Home = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  

  

  

  return (
    <div className={'min-h-screen bg-white text-black'}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Real-time Text Editor</h1>
          <button
            
            className="px-4 py-2 rounded bg-gray-800 text-white"
          >
            
          </button>
        </div>
        {selectedDocument ? (
          <TextEditor documentId={selectedDocument} onClose={() => setSelectedDocument(null)}  />
        ) : (
          <DocumentList onSelectDocument={setSelectedDocument}  />
        )}
      </div>
    </div>
  );
};

export default Home;
