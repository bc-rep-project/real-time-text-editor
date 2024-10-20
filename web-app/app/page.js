
'use client'

import React, { useState } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import DocumentList from '../components/DocumentList';
import CreateNewDocumentButton from '../components/CreateNewDocumentButton';
import EditorArea from '../components/EditorArea';
import ChatBox from '../components/ChatBox';
import VersionHistory from '../components/VersionHistory';
import UserPresenceIndicator from '../components/UserPresenceIndicator';
import LoginForm from '../components/LoginForm';

export default function Home() {
  const [user, setUser] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleDocumentSelect = (documentId) => {
    setSelectedDocument(documentId);
  };

  const handleNewDocument = (documentId) => {
    setSelectedDocument(documentId);
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Collaborative Document Editor
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <DocumentList onSelectDocument={handleDocumentSelect} />
            <Box sx={{ mt: 2 }}>
              <CreateNewDocumentButton onDocumentCreated={handleNewDocument} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            {selectedDocument && (
              <>
                <EditorArea documentId={selectedDocument} />
                <Box sx={{ mt: 2 }}>
                  <UserPresenceIndicator documentId={selectedDocument} />
                </Box>
              </>
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            {selectedDocument && (
              <>
                <ChatBox documentId={selectedDocument} />
                <Box sx={{ mt: 2 }}>
                  <VersionHistory documentId={selectedDocument} />
                </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
