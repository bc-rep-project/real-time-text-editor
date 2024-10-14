
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VersionControl = () => {
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);

    useEffect(() => {
        // Fetch versions from the server
        axios.get('http://localhost:5000/versions')
            .then(response => {
                setVersions(response.data);
            })
            .catch(error => {
                console.error('Error fetching versions:', error);
            });
    }, []);

    const handleRevert = (version) => {
        setSelectedVersion(version);
        // Revert to the selected version
        axios.post('http://localhost:5000/revert', { version })
            .then(response => {
                console.log('Reverted to version:', version);
            })
            .catch(error => {
                console.error('Error reverting to version:', error);
            });
    };

    return (
        <div>
            <h2>Version Control</h2>
            <ul>
                {versions.map((version, index) => (
                    <li key={index}>
                        {version}
                        <button onClick={() => handleRevert(version)}>Revert</button>
                    </li>
                ))}
            </ul>
            {selectedVersion && <p>Reverted to version: {selectedVersion}</p>}
        </div>
    );
};

export default VersionControl;
