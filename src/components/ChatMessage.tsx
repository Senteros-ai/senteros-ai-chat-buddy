
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import { simulateStreamingResponse } from '@/services/openRouterService';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
  isLast?: boolean;
  animateLastMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast, animateLastMessage }) => {
  const isUser = message.role === 'user';
  const [displayedContent, setDisplayedContent] = useState<string>(isUser ? message.content : '');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<() => void | null>(null);
  
  // Запускаем анимацию только для последнего сообщения от ассистента
  useEffect(() => {
    if (!isUser && isLast && animateLastMessage) {
      setIsAnimating(true);
      setDisplayedContent('');
      
      animationRef.current = simulateStreamingResponse(
        message.content,
        (chunk) => {
          setDisplayedContent(prev => prev + chunk);
        },
        () => {
          setIsAnimating(false);
        }
      );
    } else if (!isUser && !animateLastMessage) {
      setDisplayedContent(message.content);
    }
    
    return () => {
      if (animationRef.current) {
        animationRef.current();
      }
    };
  }, [message.content, isUser, isLast, animateLastMessage]);
  
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
              <>
                <ReactMarkdown className="prose dark:prose-invert prose-headings:my-4 prose-p:my-2 max-w-none">
                  {displayedContent}
                </ReactMarkdown>
                {isAnimating && <span className="animate-pulse">▌</span>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
