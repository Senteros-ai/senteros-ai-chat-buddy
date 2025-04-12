
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw, Settings, PanelLeft, User } from "lucide-react";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  onNewChat: () => void;
  onSettings: () => void;
  onToggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat, onSettings, onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between border-b p-4 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
          <PanelLeft className="h-5 w-5" />
        </Button>
        <img src="https://i.ibb.co/xKtY6RXz/Chat-GPT-Image-1-2025-17-16-51.png" alt="SenterosAI Logo" className="h-8 w-auto" />
        <h1 className="text-xl font-semibold">SenterosAI</h1>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onNewChat}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Новый чат
        </Button>
        <Button variant="outline" size="sm" onClick={onSettings}>
          <Settings className="h-4 w-4" />
        </Button>
        <Link to="/settings">
          <Button variant="outline" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default ChatHeader;
