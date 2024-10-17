
import EditorArea from '../../components/editor-area';
import ChatBox from '../../components/chat-box';
import VersionHistory from '../../components/version-history';
import UserPresenceIndicator from '../../components/user-presence-indicator';
import FormattingToolbar from '../../components/formatting-toolbar';

export default function DocumentEditor() {
  const handleFormat = (format) => {
    // Implement formatting logic here
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-screen">
      <div className="col-span-2 flex flex-col">
        <FormattingToolbar onFormat={handleFormat} />
        <EditorArea />
      </div>
      <div className="flex flex-col">
        <UserPresenceIndicator />
        <ChatBox />
        <VersionHistory />
      </div>
    </div>
  );
}
