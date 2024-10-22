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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Real-Time Text Editor</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : !selectedDocument ? (
          <DocumentList onSelectDocument={handleSelectDocument} />
        ) : (
          <TextEditor documentId={selectedDocument} />
        )}
      </div>
    </div>
  );
};

export default Home;
