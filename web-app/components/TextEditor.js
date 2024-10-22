import React, { useState, useEffect } from 'react';

const TextEditor = ({ documentId }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      const data = await response.json();
      setContent(data.content);
      setTitle(data.title);
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  const handleChange = async (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    try {
      await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{title}</h2>
      <textarea
        className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 resize-none"
        value={content}
        onChange={handleChange}
        placeholder="Start typing your document here..."
      />
    </div>
  );
};

export default TextEditor;
