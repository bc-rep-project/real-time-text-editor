
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DocumentList from '../components/DocumentList';
import TextEditor from '../components/TextEditor';
import AuthForm from '../components/LoginForm';
import ChatBox from '../components/ChatBox';

const Home = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Real-time Text Editor</h1>
            <div>
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className={`ml-2 px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
          {!isAuthenticated ? (
            <AuthForm onLogin={handleLogin} />
          ) : (
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
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Home;
