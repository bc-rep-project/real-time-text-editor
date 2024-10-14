
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const TextEditor = () => {
  const [text, setText] = useState('');

  useEffect(() => {
    socket.on('text-update', (newText) => {
      setText(newText);
    });

    return () => {
      socket.off('text-update');
    };
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
    socket.emit('text-update', e.target.value);
  };

  const applyFormat = (format) => {
    document.execCommand(format, false, null);
  };

  return (
    <div>
      <div>
        <button onClick={() => applyFormat('bold')}>Bold</button>
        <button onClick={() => applyFormat('italic')}>Italic</button>
        <button onClick={() => applyFormat('underline')}>Underline</button>
      </div>
      <div
        contentEditable
        onInput={handleChange}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
};

export default TextEditor;
