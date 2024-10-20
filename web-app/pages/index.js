import React, { useState } from 'react';
import TextEditor from '../components/TextEditor';
import DocumentList from '../components/DocumentList';

const Home = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleSelectDocument = (documentId) => {
    setSelectedDocument(documentId);
  };

  return (
    <div>
      <h1>Real-Time Text Editor</h1>
      {!selectedDocument ? (
        <DocumentList onSelectDocument={handleSelectDocument} />
      ) : (
        <TextEditor documentId={selectedDocument} />
      )}
    </div>
  );
};

export default Home;
