
import EditorArea from '../../../components/editor-area';
import ChatBox from '../../../components/chat-box';
import VersionHistory from '../../../components/version-history';
import UserPresenceIndicator from '../../../components/user-presence-indicator';
import FormattingToolbar from '../../../components/formatting-toolbar';

export default function DocumentEditor() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <UserPresenceIndicator />
        <FormattingToolbar onFormat={(format) => console.log(`Format: ${format}`)} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <EditorArea />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <VersionHistory />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <ChatBox />
      </div>
    </div>
  );
}
