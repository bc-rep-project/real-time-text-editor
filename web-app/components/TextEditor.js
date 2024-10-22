import React, { useState, useEffect } from 'react';

const TextEditor = ({ documentId }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    // Fetch document content
    // This is a placeholder for actual API call
    setContent('Sample content for document ' + documentId);
  }, [documentId]);

  const handleChange = (e) => {
    setContent(e.target.value);
    // Here you would typically send updates to the server
  };

  return (
    <div className="w-full">
      <textarea
        className="w-full h-64 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={content}
        onChange={handleChange}
      />
    </div>
  );
};

export default TextEditor;
