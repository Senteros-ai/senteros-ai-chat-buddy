
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, Plus, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';

interface ChatHeaderProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onNewChat, 
  onToggleSidebar
}) => {
  const { user } = useAuth();
  const [language] = useState(localStorage.getItem('language') || 'ru');
  
  // Локализованные тексты
  const texts = {
    settings: language === 'ru' ? 'Настройки' : 'Settings',
    account: language === 'ru' ? 'Аккаунт' : 'Account',
    signOut: language === 'ru' ? 'Выйти' : 'Sign out',
  };
  
  // Получаем инициалы пользователя или имя из метаданных
  const getUserInitials = () => {
    if (!user) return "?";
    
    const username = user.user_metadata?.username;
    if (username) return username.charAt(0).toUpperCase();
    
    return user.email?.charAt(0).toUpperCase() || "?";
  };

  return (
    <header className="border-b dark:border-gray-700 py-2 px-4">
      <div className="flex justify-between items-center max-w-screen-lg mx-auto">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold hidden md:block">SenterosAI</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onNewChat}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {user?.user_metadata?.avatar_url ? (
                    <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata?.username || "User"} />
                  ) : (
                    <AvatarFallback>
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{texts.account}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{texts.settings}</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
