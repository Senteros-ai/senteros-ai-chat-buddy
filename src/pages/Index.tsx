import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ChatSidebar from '@/components/ChatSidebar';
import SettingsDialog from '@/components/SettingsDialog';
import VoiceRecordingModal from '@/components/VoiceRecordingModal';
import { ChatMessage as ChatMessageType } from '@/services/openRouterService';
import { 
  generateChatCompletion, 
  generateChatTitle,
  simulateStreamingResponse
} from '@/services/mistralService';
import { speakText } from '@/services/voiceService';
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
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [voiceRecordingOpen, setVoiceRecordingOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
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

  const handleVoiceInput = () => {
    setVoiceRecordingOpen(false);
  };

  const handleStopGeneration = () => {
    stopGenerationRef.current = true;
    if (animationRef.current) {
      animationRef.current();
    }
    setIsGenerating(false);
    setIsThinking(false);
    window.speechSynthesis.cancel();
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
        
        if (isVoiceMode && assistantMessage.content.length < 1000) {
          speakText(assistantMessage.content);
        }
        
        if (isNewChat) {
          generateAITitle(chatId, updatedMessages);
        }
        
        if (!voiceRecordingOpen) {
          setIsVoiceMode(false);
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
          onOpenVoiceRecord={() => setVoiceRecordingOpen(true)}
        />
        
        <div className="flex-1 overflow-y-auto p-4">
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
          onVoiceRecording={() => setVoiceRecordingOpen(true)}
          isGenerating={isGenerating}
          disabled={isLoading && !isGenerating}  
        />
        
        <VoiceRecordingModal 
          isOpen={voiceRecordingOpen} 
          onClose={() => setVoiceRecordingOpen(false)}
          onRecordingComplete={handleVoiceInput} 
        />
      </div>
    </div>
  );
};

export default Index;
