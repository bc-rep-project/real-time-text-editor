
"use client";
import EditorArea from '../components/EditorArea';
import ChatBox from '../components/ChatBox';
import VersionHistory from '../components/VersionHistory';
import UserPresenceIndicator from '../components/UserPresenceIndicator';
import FormattingToolbar from '../components/FormattingToolbar';
import LoginForm from '../components/LoginForm';

export default function Home() {
  const documentId = 1; // Example document ID
  const userId = 1; // Example user ID

  return (
    <div className="container mx-auto p-4">
      <LoginForm />
      <UserPresenceIndicator documentId={documentId} />
      <FormattingToolbar onFormat={(format) => console.log(`Format: ${format}`)} />
      <EditorArea documentId={documentId} />
      <ChatBox documentId={documentId} userId={userId} />
      <VersionHistory documentId={documentId} />
    </div>
  );
}
