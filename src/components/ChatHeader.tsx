
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Menu, Plus, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatHeaderProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onNewChat, 
  onToggleSidebar
}) => {
  const navigate = useNavigate();
  const language = localStorage.getItem('language') || 'ru';
  const isRussian = language === 'ru';
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onToggleSidebar}
          aria-label={isRussian ? "Открыть меню" : "Open menu"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">SenterosAI</h1>
        
        {/* New chat and history buttons moved here */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="ml-2"
          aria-label={isRussian ? "Новый чат" : "New chat"}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="ml-1"
          aria-label={isRussian ? "История чатов" : "Chat history"}
        >
          <History className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          aria-label={isRussian ? "Настройки" : "Settings"}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
