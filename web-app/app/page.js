
'use client'

import React, { useState, useEffect } from 'react';
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Collaborative Document Editor</h1>
      <div className="flex">
        <div className="w-1/4 pr-4">
          <DocumentList onSelectDocument={handleDocumentSelect} />
          <CreateNewDocumentButton onDocumentCreated={handleNewDocument} />
        </div>
        <div className="w-1/2 px-4">
          {selectedDocument && (
            <>
              <EditorArea documentId={selectedDocument} />
              <UserPresenceIndicator documentId={selectedDocument} />
            </>
          )}
        </div>
        <div className="w-1/4 pl-4">
          {selectedDocument && (
            <>
              <ChatBox documentId={selectedDocument} />
              <VersionHistory documentId={selectedDocument} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
