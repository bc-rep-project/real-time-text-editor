import React, { useState, useEffect } from 'react';
import TextEditor from '../components/TextEditor';
import DocumentList from '../components/DocumentList';
import LoginForm from '../components/LoginForm';

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Check dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setSelectedDocument(null);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-8 dark:bg-gray-900 dark:text-white">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Real-time Text Editor</h1>
          <div className="flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 mr-4"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </header>

        <main>
          {isAuthenticated ? (
            selectedDocument ? (
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-3/4 pr-0 md:pr-4 mb-4 md:mb-0">
                  <TextEditor
                    documentId={selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                  />
                </div>
                <div className="w-full md:w-1/4">
                  <DocumentList onSelectDocument={setSelectedDocument} />
                </div>
              </div>
            ) : (
              <DocumentList onSelectDocument={setSelectedDocument} />
            )
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
