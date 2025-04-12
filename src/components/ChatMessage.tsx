
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import { simulateStreamingResponse } from '@/services/openRouterService';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    image_url?: string;
  };
  isLast?: boolean;
  animateLastMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast, animateLastMessage }) => {
  const isUser = message.role === 'user';
  const [displayedContent, setDisplayedContent] = useState<string>(isUser ? message.content : '');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<(() => void) | null>(null);
  const { user } = useAuth();
  
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
          "h-8 w-8 rounded-full shrink-0",
          isUser ? "bg-chat-user-bubble" : "bg-chat-bot-bubble"
        )}>
          {isUser ? (
            user?.user_metadata?.avatar_url ? (
              <AvatarImage src={user.user_metadata.avatar_url} alt="User" />
            ) : (
              <AvatarFallback className="text-white text-sm">
                {user?.user_metadata?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            )
          ) : (
            <AvatarImage src="https://i.ibb.co/xKtY6RXz/Chat-GPT-Image-1-2025-17-16-51.png" alt="SenterosAI" className="h-full w-full object-contain p-1 bg-transparent" />
          )}
        </Avatar>
        
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="font-semibold">
            {isUser ? (user?.user_metadata?.username || 'You') : 'SenterosAI'}
          </div>
          
          <div className="message-content">
            {isUser ? (
              <div>
                {message.content}
                {message.image_url && (
                  <div className="mt-2">
                    <img src={message.image_url} alt="Attached image" className="max-w-xs rounded-md" />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative prose dark:prose-invert prose-headings:my-4 prose-p:my-2 max-w-none">
                <ReactMarkdown>
                  {displayedContent}
                </ReactMarkdown>
                {isAnimating && <span className="animate-pulse inline-block ml-0.5">▌</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
