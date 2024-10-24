import React from 'react';

const CreateNewDocumentButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
    >
      Create New Document
    </button>
  );
};

export default CreateNewDocumentButton;
