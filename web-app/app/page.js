
'use client'

import React, { useState } from 'react';
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
    <div className="container mx-auto px-4">
      <div className="my-8">
        <h1 className="text-3xl font-bold mb-4">
          Collaborative Document Editor
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <DocumentList onSelectDocument={handleDocumentSelect} />
            <div className="mt-4">
              <CreateNewDocumentButton onDocumentCreated={handleNewDocument} />
            </div>
          </div>
          <div className="md:col-span-6">
            {selectedDocument && <EditorArea documentId={selectedDocument} />}
          </div>
          <div className="md:col-span-3">
            {selectedDocument && (
              <>
                <ChatBox documentId={selectedDocument} />
                <div className="mt-4">
                  <VersionHistory documentId={selectedDocument} />
                </div>
                <div className="mt-4">
                  <UserPresenceIndicator documentId={selectedDocument} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
