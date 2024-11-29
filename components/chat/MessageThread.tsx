interface MessageBubbleProps {
  message: string;
  username: string;
  timestamp: string;
  isSelf: boolean;
  onReact?: (reaction: string) => void;
} 