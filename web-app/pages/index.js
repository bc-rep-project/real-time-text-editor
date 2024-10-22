import React, { useState } from 'react';
import TextEditor from '../components/TextEditor';
import DocumentList from '../components/DocumentList';

const Home = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleSelectDocument = (documentId) => {
    setSelectedDocument(documentId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      {!selectedDocument ? (
        <DocumentList onSelectDocument={handleSelectDocument} />
      ) : (
        <TextEditor documentId={selectedDocument} />
      )}
    </div>
  );
};

export default Home;
