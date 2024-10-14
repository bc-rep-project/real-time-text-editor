
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://33e271225f3c196440.blackbx.ai');

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
        const newText = e.target.value;
        setText(newText);
        socket.emit('text-update', newText);
    };

    return (
        <textarea
            value={text}
            onChange={handleChange}
            rows="20"
            cols="100"
        />
    );
};

export default TextEditor;
