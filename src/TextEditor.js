
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const TextEditor = () => {
  const [editorContent, setEditorContent] = useState('');
  const quillRef = useRef(null);

useEffect(() => {
  const fetchLatestDocument = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/documents/latest');
      const data = await response.json();
      if (data) {
        setEditorContent(data.content);
      }
    } catch (error) {
      console.error('Failed to fetch the latest document:', error);
    }
  };

  fetchLatestDocument();

  socket.on('editor-content', (content) => {
    setEditorContent(content);
  });

  return () => {
    socket.off('editor-content');
  };
}, []);

const handleEditorChange = async (content, delta, source, editor) => {
  if (source === 'user') {
    socket.emit('editor-content', content);
    try {
      const response = await fetch('http://localhost:4000/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, version: Date.now() }),
      });
      if (!response.ok) {
        throw new Error('Failed to save document');
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  }
  setEditorContent(content);
};

  return (
    <div className="text-editor">
      <ReactQuill
        ref={(el) => {
          if (el) {
            quillRef.current = el.getEditor();
          }
        }}
        value={editorContent}
        onChange={handleEditorChange}
        theme="snow"
      />
    </div>
  );
};

export default TextEditor;
