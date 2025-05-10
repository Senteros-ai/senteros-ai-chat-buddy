
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Info, Settings, Home } from 'lucide-react';

const Teleport: React.FC = () => {
  const language = localStorage.getItem('language') || 'ru';
  const isRussian = language === 'ru';

  const navigationItems = [
    {
      title: isRussian ? "Чат с SenterosAI" : "Chat with SenterosAI",
      description: isRussian 
        ? "Общайтесь с ИИ, задавайте вопросы, получайте помощь" 
        : "Chat with AI, ask questions, get assistance",
      icon: MessageSquare,
      path: "/chat",
      variant: "default" as const
    },
    {
      title: isRussian ? "О SenterosAI" : "About SenterosAI",
      description: isRussian 
        ? "Информация о возможностях и функциях" 
        : "Information about features and functions",
      icon: Info,
      path: "/intro",
      variant: "outline" as const
    },
    {
      title: isRussian ? "Настройки" : "Settings",
      description: isRussian 
        ? "Изменить язык, тему и другие параметры" 
        : "Change language, theme, and other settings",
      icon: Settings,
      path: "/settings",
      variant: "outline" as const
    },
    {
      title: isRussian ? "Главная" : "Home",
      description: isRussian 
        ? "Вернуться на главную страницу" 
        : "Return to the main page",
      icon: Home,
      path: "/",
      variant: "outline" as const
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{isRussian ? "Навигация" : "Navigation"}</h1>
          <p className="text-muted-foreground">
            {isRussian 
              ? "Выберите, куда вы хотите перейти" 
              : "Choose where you want to go"}
          </p>
        </div>

        <div className="space-y-4">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant={item.variant}
              asChild
              className="w-full justify-start text-left h-auto py-6"
            >
              <Link to={item.path} className="flex items-start">
                <div className="mr-4 mt-1">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teleport;
