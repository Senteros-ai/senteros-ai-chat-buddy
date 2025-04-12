
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import SettingsDialog from '@/components/SettingsDialog';
import { 
  generateChatCompletion, 
  setApiKey,
  ChatMessage as ChatMessageType
} from '@/services/openRouterService';

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load saved API key on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // If no API key is found, open settings dialog
      setSettingsOpen(true);
    }

    // Check for saved messages
    const savedMessages = localStorage.getItem('senteros_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse saved messages', e);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('senteros_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessageType = {
      role: 'user',
      content,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const assistantMessage = await generateChatCompletion([
        ...messages,
        userMessage,
      ]);

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      const confirmClear = window.confirm('Start a new chat? This will clear the current conversation.');
      if (confirmClear) {
        setMessages([]);
        localStorage.removeItem('senteros_messages');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader 
        onNewChat={handleNewChat}
        onSettings={() => setSettingsOpen(true)}
      />
      
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4 p-4 max-w-md">
              <img
                src="https://i.ibb.co/xKtY6RXz/Chat-GPT-Image-1-2025-17-16-51.png"
                alt="SenterosAI"
                className="w-20 h-20 mx-auto animate-bounce-slight"
              />
              <h2 className="text-2xl font-bold">Привет! Я SenterosAI</h2>
              <p className="text-muted-foreground">
                Я супер-дружелюбный и полезный ассистент, готовый помочь вам с любыми вопросами! (●'◡'●)
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-4">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message} 
                isLast={index === messages.length - 1} 
              />
            ))}
            {isLoading && (
              <div className="flex w-full py-4 px-4 md:px-8 bg-background">
                <div className="flex w-full max-w-screen-lg mx-auto space-x-4">
                  <div className="h-8 w-8 rounded-md shrink-0 bg-chat-bot-bubble flex items-center justify-center">
                    <img src="https://i.ibb.co/xKtY6RXz/Chat-GPT-Image-1-2025-17-16-51.png" alt="SenterosAI" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 pt-1">
                    <TypingIndicator />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
};

export default Index;
