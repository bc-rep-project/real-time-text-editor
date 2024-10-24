
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
            <TextEditor documentId={selectedDocument} onClose={() => setSelectedDocument(null)} />
          )}
          {mobileView === 'chat' && selectedDocument && <ChatBox documentId={selectedDocument} />}
        </SwipeHandler>
      );
    }

    return (
      <>
        {selectedDocument ? (
          <div className="flex">
            <div className="w-3/4 pr-4">
              <TextEditor documentId={selectedDocument} onClose={() => setSelectedDocument(null)} />
            </div>
            <div className="w-1/4">
              <ChatBox documentId={selectedDocument} />
            </div>
          </div>
        ) : (
          <DocumentList onSelectDocument={setSelectedDocument} />
        )}
      </>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="container mx-auto px-4">
        <header className="py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Real-Time Text Editor</h1>
          <div className="flex items-center">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="mr-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </header>
        <main className="mt-8">{renderContent()}</main>
        {isTouchDevice && isAuthenticated && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex justify-around">
              <button
                onClick={() => setMobileView('list')}
                className={`flex-1 py-4 ${mobileView === 'list' ? 'text-blue-500' : ''}`}
              >
                List
              </button>
              <button
                onClick={() => setMobileView('editor')}
                className={`flex-1 py-4 ${mobileView === 'editor' ? 'text-blue-500' : ''}`}
              >
                Edit
              </button>
              <button
                onClick={() => setMobileView('chat')}
                className={`flex-1 py-4 ${mobileView === 'chat' ? 'text-blue-500' : ''}`}
              >
                Chat
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Home;
