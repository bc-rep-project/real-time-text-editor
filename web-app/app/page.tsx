
import DocumentList from '../components/document-list';
import CreateNewDocumentButton from '../components/create-new-document-button';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Collaborative Text Editor</h1>
      <CreateNewDocumentButton />
      <DocumentList />
    </div>
  );
}
