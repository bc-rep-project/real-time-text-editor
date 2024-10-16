
import EditorArea from '../../../components/editor-area';
import ChatBox from '../../../components/chat-box';
import VersionHistory from '../../../components/version-history';
import UserPresenceIndicator from '../../../components/user-presence-indicator';
import FormattingToolbar from '../../../components/formatting-toolbar';

export default function DocumentEditor() {
  return (
    <div className="container mx-auto p-4">
      <UserPresenceIndicator />
      <FormattingToolbar onFormat={(format) => console.log(`Format: ${format}`)} />
      <EditorArea />
      <VersionHistory />
      <ChatBox />
    </div>
  );
}
