
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";

interface ChatHeaderProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onNewChat, 
  onToggleSidebar
}) => {
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
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
