
import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button } from '@mui/material';

const DocumentList = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // Fetch documents from the server
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const createNewDocument = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Document' }),
      });
      const newDocument = await response.json();
      setDocuments([...documents, newDocument]);
      onSelectDocument(newDocument.id);
    } catch (error) {
      console.error('Error creating new document:', error);
    }
  };

  return (
    <div>
      <h2>Documents</h2>
      <Button onClick={createNewDocument} variant="contained" color="primary">
        Create New Document
      </Button>
      <List>
        {documents.map((doc) => (
          <ListItem
            button
            key={doc.id}
            onClick={() => onSelectDocument(doc.id)}
          >
            <ListItemText primary={doc.title} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default DocumentList;
