import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ChatSidebar from '@/components/ChatSidebar';
import SettingsDialog from '@/components/SettingsDialog';
import MemoryNotification from '@/components/MemoryNotification';
import { ChatMessage as ChatMessageType } from '@/services/openRouterService';
import { 
  generateChatCompletion, 
  generateChatTitle,
  simulateStreamingResponse
} from '@/services/mistralService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchUserChats, 
  fetchChatMessages, 
  createChat, 
  saveChatMessage, 
  Chat,
  updateChatTitle
} from '@/services/chatService';
import { memoryService, MemorySuggestion } from '@/services/memoryService';
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [animateLastMessage, setAnimateLastMessage] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [memorySuggestion, setMemorySuggestion] = useState<MemorySuggestion | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const stopGenerationRef = useRef<boolean>(false);
  const animationRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
      
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

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'ru' | 'en' || 'ru';
    setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    if (user) {
      // Sync username to localStorage for the AI to use
      if (user.user_metadata?.username) {
        localStorage.setItem('username', user.user_metadata.username);
      }
      loadUserChats();
    }
  }, [user]);

  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserChats = async () => {
    try {
      const userChats = await fetchUserChats();
      setChats(userChats);
      
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
      setAnimateLastMessage(false);
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
      if (messages.length >= 2) {
        const title = await generateChatTitle(messages);
        if (title) {
          await updateChatTitle(chatId, title);
          loadUserChats();
        }
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
    }
  };

  const handleStopGeneration = () => {
    stopGenerationRef.current = true;
    if (animationRef.current) {
      animationRef.current();
    }
    setIsGenerating(false);
    setIsThinking(false);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleMemoryConfirm = () => {
    if (memorySuggestion) {
      memoryService.addMemory(
        memorySuggestion.content,
        memorySuggestion.type,
        memorySuggestion.importance
      );
      toast({
        title: language === 'ru' ? 'Информация сохранена' : 'Information saved',
        description: memorySuggestion.content,
        variant: 'default',
      });
    }
    setMemorySuggestion(null);
  };

  const handleMemoryReject = () => {
    setMemorySuggestion(null);
  };

  const handleSendMessage = async (content: string, imageFile?: File) => {
    if (!content.trim() && !imageFile) return;

    // Анализируем сообщение на предмет важной информации
    if (content.trim()) {
      const suggestions = memoryService.analyzeMessage(content);
      if (suggestions.length > 0 && suggestions[0].confidence > 0.7) {
        setMemorySuggestion(suggestions[0]);
      }
    }

    let image_url: string | undefined;
    
    if (imageFile) {
      try {
        image_url = await convertImageToBase64(imageFile);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        toast({
          title: language === 'ru' ? 'Ошибка' : 'Error',
          description: language === 'ru' 
            ? 'Не удалось загрузить изображение' 
            : 'Failed to upload image',
          variant: 'destructive',
        });
        return;
      }
    }

    const userMessage: ChatMessageType = {
      role: 'user',
      content,
      ...(image_url && { image_url })
    };

    let updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setIsThinking(true);
    setIsGenerating(true);
    stopGenerationRef.current = false;

    try {
      let chatId = currentChatId;
      let isNewChat = false;
      
      if (!chatId) {
        const tempTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        const newChat = await createChat(tempTitle, userMessage);
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setChats(prev => [newChat, ...prev]);
        isNewChat = true;
      } else {
        await saveChatMessage(chatId, userMessage);
      }

      if (!stopGenerationRef.current) {
        const assistantMessage = await generateChatCompletion(updatedMessages);
        
        if (chatId) {
          await saveChatMessage(chatId, assistantMessage);
        }

        setIsThinking(false);
        updatedMessages = [...updatedMessages, assistantMessage];
        setAnimateLastMessage(true);
        setMessages(updatedMessages);
        
        if (isNewChat) {
          generateAITitle(chatId, updatedMessages);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsThinking(false);
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Error',
        description: error instanceof Error ? error.message : 
          (language === 'ru' ? 'Не удалось получить ответ' : 'Failed to get response'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
      stopGenerationRef.current = false;
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
      
      <div className="flex flex-col h-screen w-full chat-container">
        <ChatHeader 
          onNewChat={handleNewChat}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 overflow-y-auto p-4">
          {memorySuggestion && (
            <MemoryNotification
              content={memorySuggestion.content}
              onConfirm={handleMemoryConfirm}
              onReject={handleMemoryReject}
              language={language}
            />
          )}
          
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4 p-8 max-w-md bg-card/70 rounded-xl shadow-lg backdrop-blur-sm border border-border/30">
                <div className="flex justify-center">
                  <img
                    src="https://i.ibb.co/6JWhNYQF/photo-2025-04-21-16-32-07-removebg-preview.png"
                    alt="SenterosAI"
                    className="w-24 h-24 animate-bounce-slight bg-transparent"
                  />
                </div>
                <h2 className="text-2xl font-bold">{texts.welcome}</h2>
                <p className="text-muted-foreground">
                  {texts.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  message={message} 
                  isLast={index === messages.length - 1} 
                  animateLastMessage={index === messages.length - 1 && animateLastMessage}
                  isThinking={isThinking && index === messages.length - 1 && message.role === 'user'}
                />
              ))}
              {isThinking && (
                <ChatMessage 
                  message={{ role: 'assistant', content: '' }}
                  isThinking={true}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onStopGeneration={handleStopGeneration}
          isGenerating={isGenerating}
          disabled={isLoading && !isGenerating}  
        />
      </div>
    </div>
  );
};

export default Index;
