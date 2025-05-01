
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import { simulateStreamingResponse } from '@/services/mistralService';
import { useAuth } from '@/contexts/AuthContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TypingIndicator from './TypingIndicator';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    image_url?: string;
  };
  isLast?: boolean;
  animateLastMessage?: boolean;
  isThinking?: boolean;
}

// Add proper type definition for the code component props
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast,
  animateLastMessage,
  isThinking
}) => {
  const isUser = message.role === 'user';
  const [displayedContent, setDisplayedContent] = useState<string>(isUser ? message.content : '');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<(() => void) | null>(null);
  const { user } = useAuth();
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  // Handle image click to show fullscreen
  const handleImageClick = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
  };
  
  // Handle closing the fullscreen image
  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  // Запускаем анимацию только для последнего сообщения от ассистента
  useEffect(() => {
    if (!isUser && isLast && animateLastMessage) {
      setIsAnimating(true);
      setDisplayedContent('');
      animationRef.current = simulateStreamingResponse(message.content, chunk => {
        setDisplayedContent(prev => prev + chunk);
      }, () => {
        setIsAnimating(false);
      });
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
    <>
      <div className={cn("flex w-full py-4 px-4 md:px-8", isUser ? "bg-secondary/50" : "bg-background")}>
        <div className="flex w-full max-w-screen-lg mx-auto space-x-4">
          <Avatar className={cn("h-8 w-8 rounded-full shrink-0", 
            isUser ? "bg-sky-100 dark:bg-slate-700" : "bg-blue-100 dark:bg-blue-900")}>
            {isUser ? (
              user?.user_metadata?.avatar_url ? (
                <AvatarImage src={user.user_metadata.avatar_url} alt="User" className="text-violet-500" />
              ) : (
                <AvatarFallback className="text-sm dark:text-white text-black">
                  {user?.user_metadata?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              )
            ) : (
              <AvatarImage src="https://i.ibb.co/6JWhNYQF/photo-2025-04-21-16-32-07-removebg-preview.png" alt="SenterosAI" className="h-full w-full object-contain p-1 bg-transparent" />
            )}
          </Avatar>
          
          <div className="flex-1 space-y-2 overflow-hidden">
            <div className="font-semibold">
              {isUser ? user?.user_metadata?.username || 'You' : 'SenterosAI'}
            </div>
            
            <div className="message-content">
              {isUser ? (
                <div>
                  {message.content}
                  {message.image_url && (
                    <div className="mt-2">
                      <img 
                        src={message.image_url} 
                        alt="Attached image" 
                        className="message-image max-w-xs rounded-md" 
                        onClick={() => handleImageClick(message.image_url!)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative prose dark:prose-invert prose-headings:my-4 prose-p:my-2 max-w-none">
                  {isThinking ? (
                    <TypingIndicator />
                  ) : (
                    <ReactMarkdown
                      components={{
                        code: ({
                          inline,
                          className,
                          children,
                          ...props
                        }: CodeProps) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline ? (
                            <SyntaxHighlighter 
                              style={isDarkMode ? oneDark : oneLight} 
                              language={match ? match[1] : undefined} 
                              PreTag="div" 
                              className="rounded-md my-2 bg-gray-100 dark:bg-gray-800" 
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        img: ({src, alt}) => (
                          <img 
                            src={src} 
                            alt={alt} 
                            className="message-image max-w-md" 
                            onClick={() => src && handleImageClick(src)}
                          />
                        ),
                      }}
                    >
                      {displayedContent}
                    </ReactMarkdown>
                  )}
                  {isAnimating && <span className="animate-pulse inline-block ml-0.5">▌</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {fullscreenImage && (
        <div className="fullscreen-image-overlay" onClick={closeFullscreenImage}>
          <img src={fullscreenImage} alt="Fullscreen image" className="fullscreen-image" />
        </div>
      )}
    </>
  );
};

export default ChatMessage;
