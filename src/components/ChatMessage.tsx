
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
  isLast?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        "flex w-full py-4 px-4 md:px-8",
        isUser ? "bg-secondary/50" : "bg-background"
      )}
    >
      <div className="flex w-full max-w-screen-lg mx-auto space-x-4">
        <Avatar className={cn(
          "h-8 w-8 rounded-md shrink-0",
          isUser ? "bg-chat-user-bubble" : "bg-chat-bot-bubble"
        )}>
          {isUser ? (
            <span className="text-white text-sm">U</span>
          ) : (
            <img src="https://i.ibb.co/xKtY6RXz/Chat-GPT-Image-1-2025-17-16-51.png" alt="SenterosAI" className="h-full w-full object-cover" />
          )}
        </Avatar>
        
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="font-semibold">
            {isUser ? 'You' : 'SenterosAI'}
          </div>
          
          <div className="message-content">
            {isUser ? (
              <div>{message.content}</div>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
