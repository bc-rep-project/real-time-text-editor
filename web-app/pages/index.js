
import React, { useState, useEffect } from 'react';
import DocumentList from '../components/DocumentList';
import TextEditor from '../components/TextEditor';

const Home = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-white text-black'}`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Real-time Text Editor</h1>
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded ${darkMode ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white'}`}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        {selectedDocument ? (
          <TextEditor documentId={selectedDocument} onClose={() => setSelectedDocument(null)} darkMode={darkMode} />
        ) : (
          <DocumentList onSelectDocument={setSelectedDocument} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default Home;
