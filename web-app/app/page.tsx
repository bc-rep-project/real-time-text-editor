
import DocumentList from '../components/document-list'
import CreateNewDocumentButton from '../components/create-new-document-button'

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <CreateNewDocumentButton />
      <DocumentList />
    </div>
  )
}
