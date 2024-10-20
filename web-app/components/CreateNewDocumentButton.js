
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';

const CreateNewDocumentButton = ({ onDocumentCreated }) => {
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTitleChange = (e) => {
    setNewDocumentTitle(e.target.value);
  };

  const createDocument = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newDocumentTitle, content: '' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const data = await response.json();
      setNewDocumentTitle('');
      setIsModalOpen(false);
      if (onDocumentCreated) {
        onDocumentCreated(data.id);
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsModalOpen(true)}
      >
        Create New Document
      </Button>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a title for your new document:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Document Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newDocumentTitle}
            onChange={handleTitleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={createDocument} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateNewDocumentButton;
