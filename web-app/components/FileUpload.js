import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';

const FileUpload = ({ onFileUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      onFileUpload(data.url);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="raised-button-file">
        <Button variant="contained" component="span" disabled={uploading}>
          {uploading ? <CircularProgress size={24} /> : 'Upload Image'}
        </Button>
      </label>
    </div>
  );
};

export default FileUpload;
