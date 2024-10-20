
import React, { useState, useEffect } from 'react';

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
    <div className="border border-gray-300 p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Documents</h2>
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter documents"
          className="border border-gray-300 rounded px-2 py-1 mr-2"
        />
        <select
          value={sort}
          onChange={handleSortChange}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="updatedAt">Sort by Updated At</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>
      <ul className="space-y-2">
        {documents.map(doc => (
          <li key={doc.id} className="border border-gray-200 rounded p-2">
            <h3 className="font-semibold">{doc.title}</h3>
            <p className="text-sm text-gray-600">Last updated: {new Date(doc.updatedAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;
