
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { IconButton, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DocumentList from '../components/DocumentList';
import TextEditor from '../components/TextEditor';
import AuthForm from '../components/LoginForm';

const Home = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    setSelectedDocument(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return <AuthForm onLogin={handleLogin} />;
    }

    return (
      <>
        {selectedDocument ? (
          <TextEditor
            documentId={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        ) : (
          <DocumentList onSelectDocument={setSelectedDocument} />
        )}
      </>
    );
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
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  color="secondary"
                  className="ml-2"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Home;
