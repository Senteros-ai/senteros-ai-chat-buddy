
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import SettingsDialog from '@/components/SettingsDialog';
import ChatSidebar from '@/components/ChatSidebar';
import { 
  generateChatCompletion, 
  setApiKey,
  ChatMessage as ChatMessageType
} from '@/services/openRouterService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchUserChats, 
  fetchChatMessages, 
  createChat, 
  saveChatMessage, 
  Chat 
} from '@/services/chatService';

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load saved API key on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // If no API key is found, open settings dialog
      setSettingsOpen(true);
    }
  }, []);

  // Load user chats
  useEffect(() => {
    if (user) {
      loadUserChats();
    }
  }, [user]);

  // Load chat messages when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserChats = async () => {
    try {
      const userChats = await fetchUserChats();
      setChats(userChats);
      
      // If there are chats and no current chat is selected, select the first one
      if (userChats.length > 0 && !currentChatId) {
        setCurrentChatId(userChats[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить историю чатов',
        variant: 'destructive',
      });
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      const chatMessages = await fetchChatMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения чата',
        variant: 'destructive',
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessageType = {
      role: 'user',
      content,
    };

    let updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // If no current chat, create a new one
      if (!currentChatId) {
        const newChat = await createChat(
          content.substring(0, 30) + (content.length > 30 ? '...' : ''),
          userMessage
        );
        setCurrentChatId(newChat.id);
        setChats(prev => [newChat, ...prev]);
      } else {
        // Save user message to existing chat
        await saveChatMessage(currentChatId, userMessage);
      }

      const assistantMessage = await generateChatCompletion(updatedMessages);
      
      // Save assistant message
      if (currentChatId) {
        await saveChatMessage(currentChatId, assistantMessage);
      }

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось получить ответ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  const handleChatUpdated = () => {
    loadUserChats();
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar 
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onChatUpdated={handleChatUpdated}
        isOpen={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      
      <div className="flex flex-col h-screen w-full">
        <ChatHeader 
          onNewChat={handleNewChat}
          onSettings={() => setSettingsOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
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
    </div>
  );
};

export default Index;
