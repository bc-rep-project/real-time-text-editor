import { Editor } from '../../../components/Editor';
import { CommentsPanel } from '../../../components/CommentsPanel';
import { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

const DocumentPage = ({ params }: { params: { id: string } }) => {
  const websocket = useWebSocket(params.id);
  const [showComments, setShowComments] = useState(false);
  const [selection, setSelection] = useState<{ from: number; to: number } | undefined>();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Document Editor</h1>
          <button
            onClick={() => setShowComments(!showComments)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showComments ? 'Hide Comments' : 'Show Comments'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Document Outline */}
        <div className="w-64 border-r dark:border-gray-700 p-4 hidden md:block">
          <h2 className="font-semibold mb-4">Document Outline</h2>
          {/* Add outline component here */}
        </div>

        {/* Editor */}
        <div className="flex-1 flex">
          <div className={`flex-1 ${showComments ? 'border-r dark:border-gray-700' : ''}`}>
            <Editor 
              websocket={websocket}
              documentId={params.id}
              onSelectionChange={setSelection}
            />
          </div>

          {/* Right Sidebar - Comments */}
          {showComments && (
            <div className="w-80">
              <CommentsPanel
                documentId={params.id}
                websocket={websocket}
                selection={selection}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPage; 