import React, { useState } from 'react';
import TextEditor from '../components/TextEditor';
import DocumentList from '../components/DocumentList';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectDocument = async (documentId) => {
    setIsLoading(true);
    setSelectedDocument(documentId);
    // Simulating a delay for loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div>
      <h1>Real-Time Text Editor</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : !selectedDocument ? (
        <DocumentList onSelectDocument={handleSelectDocument} />
      ) : (
        <TextEditor documentId={selectedDocument} />
      )}
    </div>
  );
};

export default Home;
