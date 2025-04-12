
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ChatSidebar from '@/components/ChatSidebar';
import SettingsDialog from '@/components/SettingsDialog';
import { 
  generateChatCompletion, 
  ChatMessage as ChatMessageType,
  generateChatTitle
} from '@/services/openRouterService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchUserChats, 
  fetchChatMessages, 
  createChat, 
  saveChatMessage, 
  Chat,
  updateChatTitle
} from '@/services/chatService';

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [animateLastMessage, setAnimateLastMessage] = useState(false);
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load language setting
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'ru' | 'en' || 'ru';
    setLanguage(savedLanguage);
  }, []);

  // Apply theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
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
        title: language === 'ru' ? 'Ошибка' : 'Error',
        description: language === 'ru' 
          ? 'Не удалось загрузить историю чатов' 
          : 'Failed to load chat history',
        variant: 'destructive',
      });
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      const chatMessages = await fetchChatMessages(chatId);
      setMessages(chatMessages);
      setAnimateLastMessage(false); // Не анимируем при загрузке истории
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Error',
        description: language === 'ru' 
          ? 'Не удалось загрузить сообщения чата' 
          : 'Failed to load chat messages',
        variant: 'destructive',
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAITitle = async (chatId: string, messages: ChatMessageType[]) => {
    try {
      if (messages.length >= 2) { // Need at least one user message and one AI response
        const title = await generateChatTitle(messages);
        if (title) {
          await updateChatTitle(chatId, title);
          loadUserChats(); // Refresh the chat list to show the new title
        }
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
      // Silent fail - don't show toast for this
    }
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
      let chatId = currentChatId;
      let isNewChat = false;
      
      // If no current chat, create a new one with a temporary title
      if (!chatId) {
        const tempTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        const newChat = await createChat(tempTitle, userMessage);
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setChats(prev => [newChat, ...prev]);
        isNewChat = true;
      } else {
        // Save user message to existing chat
        await saveChatMessage(chatId, userMessage);
      }

      const assistantMessage = await generateChatCompletion(updatedMessages);
      
      // Save assistant message
      if (chatId) {
        await saveChatMessage(chatId, assistantMessage);
      }

      updatedMessages = [...updatedMessages, assistantMessage];
      setAnimateLastMessage(true); // Включаем анимацию для нового сообщения
      setMessages(updatedMessages);
      
      // For new chats or chats with default title, generate AI title
      if (isNewChat) {
        generateAITitle(chatId, updatedMessages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Error',
        description: error instanceof Error ? error.message : 
          (language === 'ru' ? 'Не удалось получить ответ' : 'Failed to get response'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (currentChatId !== null) {
      setCurrentChatId(null);
      setMessages([]);
      setSidebarOpen(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  const handleChatUpdated = () => {
    loadUserChats();
  };

  const texts = {
    welcome: language === 'ru' ? 'Привет! Я SenterosAI' : 'Hello! I am SenterosAI',
    description: language === 'ru' 
      ? 'Я супер-дружелюбный и полезный ассистент, готовый помочь вам с любыми вопросами! (●\'◡\'●)' 
      : 'I am a super-friendly and helpful assistant, ready to help you with any questions! (●\'◡\'●)'
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar 
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onChatUpdated={handleChatUpdated}
        isOpen={sidebarOpen}
        onOpenChange={setSidebarOpen}
        language={language}
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
                  className="w-20 h-20 mx-auto animate-bounce-slight bg-transparent"
                />
                <h2 className="text-2xl font-bold">{texts.welcome}</h2>
                <p className="text-muted-foreground">
                  {texts.description}
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
                  animateLastMessage={index === messages.length - 1 && animateLastMessage}
                />
              ))}
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
