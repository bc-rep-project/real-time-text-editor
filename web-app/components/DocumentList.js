
import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  List, 
  ListItem, 
  ListItemText,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('updatedAt');

  useEffect(() => {
    fetchDocuments();
  }, [filter, sort]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?filter=${filter}&sort=${sort}`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, maxHeight: 400, overflow: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Documents
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Filter documents"
          variant="outlined"
          size="small"
          value={filter}
          onChange={handleFilterChange}
          sx={{ flexGrow: 1 }}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sort}
            onChange={handleSortChange}
            label="Sort by"
          >
            <MenuItem value="updatedAt">Updated At</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <List>
        {documents.map(doc => (
          <ListItem key={doc.id} divider>
            <ListItemText
              primary={doc.title}
              secondary={`Last updated: ${new Date(doc.updatedAt).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DocumentList;
