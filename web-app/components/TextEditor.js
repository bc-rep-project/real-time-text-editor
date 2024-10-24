import React, { useState, useEffect, useRef } from 'react';
import useDebounce from '../hooks/useDebounce';
import { saveDocument, getDocument } from '../utils/indexedDB';
import FileUpload from './FileUpload';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 3000;

const TextEditor = ({ documentId, onClose }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const ws = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

const connectWebSocket = () => {
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host;
const token = localStorage.getItem('token');
ws.current = new WebSocket(`${protocol}//${host}?token=${token}`);

ws.current.onopen = () => {
console.log('WebSocket connected');
setIsConnected(true);
setRetryAttempts(0);
ws.current.send(JSON.stringify({ type: 'join', documentId }));
};

ws.current.onmessage = async (event) => {
  let data;
  if (event.data instanceof Blob) {
    const text = await event.data.text();
    data = JSON.parse(text);
  } else {
    data = JSON.parse(event.data);
  }
  if (data.type === 'update') {
    console.log('Received update:', data);
    setContent(data.content);
    setTitle(data.title);
    setIsSaving(false);
    saveDocument({ id: documentId, content: data.content, title: data.title });
  } else if (data.type === 'error') {
    setError(data.message);
    setIsSaving(false);
    setSnackbarOpen(true);
  }
};

ws.current.onclose = () => {
console.log('WebSocket disconnected. Trying to reconnect...');
setIsConnected(false);
if (retryAttempts < MAX_RETRY_ATTEMPTS) {
setTimeout(() => {
setRetryAttempts(prev => prev + 1);
connectWebSocket();
}, RETRY_DELAY);
} else {
setError('Unable to connect to the server. Please try again later.');
setSnackbarOpen(true);
}
};

ws.current.onerror = (error) => {
console.error('WebSocket error:', error);
setError('An error occurred with the connection. Trying to reconnect...');
setSnackbarOpen(true);
ws.current.close();
};
};

useEffect(() => {
const loadDocument = async () => {
try {
const doc = await getDocument(documentId);
if (doc) {
setContent(doc.content);
setTitle(doc.title);
}
} catch (err) {
console.error('Error loading document from IndexedDB:', err);
setError('Error loading document. Please try again.');
setSnackbarOpen(true);
}
};

loadDocument();
connectWebSocket();

return () => {
if (ws.current) {
ws.current.close();
}
};
}, [documentId]);

const sendUpdate = (newContent, newTitle) => {
if (isConnected && ws.current) {
setIsSaving(true);
setError('');
const token = localStorage.getItem('token');
ws.current.send(JSON.stringify({
type: 'update',
content: newContent,
title: newTitle,
documentId,
token
}));
} else {
setError('Unable to save changes. Saving offline.');
saveDocument({ id: documentId, content: newContent, title: newTitle });
setSnackbarOpen(true);
}
};

const debouncedContent = useDebounce(content, 500);
const debouncedTitle = useDebounce(title, 500);

useEffect(() => {
sendUpdate(debouncedContent, debouncedTitle);
}, [debouncedContent, debouncedTitle]);

const handleContentChange = (value) => {
setContent(value);
};

const handleTitleChange = (e) => {
setTitle(e.target.value);
};

const handleFileUpload = (url) => {
setContent(prevContent => `${prevContent}<img src="${url}" alt="Uploaded Image" />`);
};

const handleSave = () => {
sendUpdate(content, title);
};

const modules = {
toolbar: [
[{ 'header': [1, 2, false] }],
['bold', 'italic', 'underline', 'strike', 'blockquote'],
[{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
['link', 'image'],
['clean']
],
};

const formats = [
'header',
'bold', 'italic', 'underline', 'strike', 'blockquote',
'list', 'bullet', 'indent',
'link', 'image'
];

return (
<div className="h-screen flex flex-col">
  <div className="flex justify-between items-center p-4">
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Document Title"
      className="flex-grow mr-4 p-2 border rounded"
    />
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={`mr-4 px-4 py-2 rounded ${
        isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
    >
      {isSaving ? 'Saving...' : 'Save'}
    </button>
    <FileUpload onFileUpload={handleFileUpload} />
    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
  <ReactQuill
    theme="snow"
    value={content}
    onChange={handleContentChange}
    className="flex-grow"
    modules={modules}
    formats={formats}
  />
  {snackbarOpen && (
    <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg flex items-center">
      <span>{error}</span>
      <button
        onClick={() => setSnackbarOpen(false)}
        className="ml-2 text-white hover:text-gray-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )}
</div>
);
};

export default TextEditor;
