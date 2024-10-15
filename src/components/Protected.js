
import React, { useState } from 'react';
import axios from 'axios';
import './Protected.css';

const Protected = () => {
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');

    const handleAccessProtected = async () => {
        try {
            const response = await axios.get('http://localhost:3000/protected', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Access denied');
        }
    };

    return (
        <div className="protected-container">
            <h2>Protected Route</h2>
            <input
                type="text"
                placeholder="Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
            />
            <button onClick={handleAccessProtected}>Access Protected Route</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Protected;
