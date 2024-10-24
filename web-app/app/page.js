import React from 'react';
import TextEditor from '../components/TextEditor';
import DocumentList from '../components/DocumentList';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Real-time Text Editor</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TextEditor documentId="example-doc-id" />
        </div>
        <div>
          <DocumentList />
        </div>
      </div>
    </div>
  );
}
