
import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { List, ListItem, ListItemText, TextField, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useTouchDevice from '../hooks/useTouchDevice';

const DocumentList = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const isTouchDevice = useTouchDevice();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const createDocument = async () => {
    if (!newDocumentTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newDocumentTitle }),
      });

      if (response.ok) {
        const newDocument = await response.json();
        setDocuments([...documents, newDocument]);
        setNewDocumentTitle('');
      } else {
        console.error('Failed to create document');
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <Typography variant="h5" component="h2" className="mb-4">
        Documents
      </Typography>
      <List className="space-y-2 mb-4">
        {documents.map((doc) => (
          <ListItem
            key={doc.id}
            button
            onClick={() => onSelectDocument(doc.id)}
            className={`rounded ${
              darkMode
                ? 'hover:bg-gray-700 focus:bg-gray-700'
                : 'hover:bg-gray-100 focus:bg-gray-100'
            }`}
          >
            <ListItemText primary={doc.title} />
          </ListItem>
        ))}
      </List>
      <div className="mt-4">
        <TextField
          fullWidth
          variant="outlined"
          size={isTouchDevice ? "medium" : "small"}
          label="New document title"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          className="mb-2"
          InputProps={{
            style: { color: darkMode ? 'white' : 'black' }
          }}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={createDocument}
          size={isTouchDevice ? "large" : "medium"}
        >
          Create New Document
        </Button>
      </div>
    </div>
  );
};

export default DocumentList;
