
import React from 'react';
import { useRouter } from 'next/router';
import TextEditor from '../../components/TextEditor';

const DocumentPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Document</h1>
      {id && <TextEditor documentId={id} />}
    </div>
  );
};

export default DocumentPage;
