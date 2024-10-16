
import EditorArea from '../../../components/editor-area';
import ChatBox from '../../../components/chat-box';
import VersionHistory from '../../../components/version-history';
import UserPresenceIndicator from '../../../components/user-presence-indicator';
import FormattingToolbar from '../../../components/formatting-toolbar';

import '../../../app/globals.css';

export default function DocumentEditor() {
  return (
     <div className="container">
       <div className="user-presence-indicator">
         <UserPresenceIndicator />
         <FormattingToolbar onFormat={(format) => console.log(`Format: ${format}`)} />
       </div>
       <div className="editor-area">
         <EditorArea />
       </div>
       <div className="version-history">
         <VersionHistory />
       </div>
       <div className="chat-box">
         <ChatBox />
       </div>
    </div>
  );
}
