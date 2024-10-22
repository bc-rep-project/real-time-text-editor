

import React, { useState } from 'react';
import DocumentList from '../components/DocumentList';
import TextEditor from '../components/TextEditor';

const Home = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Real-Time Text Editor</h1>
      {selectedDocument ? (
        <TextEditor documentId={selectedDocument} onClose={() => setSelectedDocument(null)} />
      ) : (
        <DocumentList onSelectDocument={setSelectedDocument} />
      )}
    </div>
  );
};

export default Home;


