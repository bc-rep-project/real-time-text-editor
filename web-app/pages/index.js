
import React, { useState, useEffect } from 'react';
import DocumentList from '../components/DocumentList';
import TextEditor from '../components/TextEditor';
import AuthForm from '../components/LoginForm';
import ChatBox from '../components/ChatBox';
import SwipeHandler from '../components/SwipeHandler';
import useTouchDevice from '../hooks/useTouchDevice';

const Home = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileView, setMobileView] = useState('list');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isTouchDevice = useTouchDevice();

  // New state variables for ChatBox
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // You might want to verify the token with the server here
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSwipe = (direction) => {
    if (direction === 'left') {
      setMobileView(mobileView === 'list' ? 'editor' : mobileView === 'editor' ? 'chat' : 'list');
    } else if (direction === 'right') {
      setMobileView(mobileView === 'chat' ? 'editor' : mobileView === 'editor' ? 'list' : 'chat');
    }
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return <AuthForm onLogin={handleLogin} />;
    }

    if (isTouchDevice) {
      return (
        <SwipeHandler onSwipe={handleSwipe}>
          {mobileView === 'list' && <DocumentList onSelectDocument={setSelectedDocument} />}
          {mobileView === 'editor' && selectedDocument && (
            <div className="h-screen overflow-y-auto">
              <TextEditor documentId={selectedDocument} onClose={() => setSelectedDocument(null)} />
            </div>
          )}
          {mobileView === 'chat' && selectedDocument && (
            <div className="h-screen overflow-y-auto">
              <ChatBox
                documentId={selectedDocument}
                activeUsers={activeUsers}
                typingUsers={typingUsers}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                isSearching={isSearching}
                searchError={searchError}
                file={file}
                setFile={setFile}
                isUploading={isUploading}
                uploadError={uploadError}
              />
            </div>
          )}
        </SwipeHandler>
      );
    }

    return (
      <>
        {selectedDocument ? (
          <div className="flex flex-col md:flex-row h-screen">
            <div className="w-full md:w-2/3 h-1/2 md:h-full md:pr-4 overflow-y-auto">
              <TextEditor documentId={selectedDocument} onClose={() => setSelectedDocument(null)} />
            </div>
            <div className="w-full md:w-1/3 h-1/2 md:h-full overflow-y-auto">
              <ChatBox
                documentId={selectedDocument}
                activeUsers={activeUsers}
                typingUsers={typingUsers}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                isSearching={isSearching}
                searchError={searchError}
                file={file}
                setFile={setFile}
                isUploading={isUploading}
                uploadError={uploadError}
              />
            </div>
          </div>
        ) : (
          <DocumentList onSelectDocument={setSelectedDocument} />
        )}
      </>
    );
  };

  return (
<div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Real-Time Text Editor</h1>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
              >
                Logout
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded transition-colors duration-300 ${
                darkMode ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </header>
        <main className="mt-8 pb-16">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Home;
