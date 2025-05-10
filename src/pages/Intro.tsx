
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Intro: React.FC = () => {
  const language = localStorage.getItem('language') || 'ru';
  const isRussian = language === 'ru';

  const content = {
    title: isRussian ? "Что такое SenterosAI?" : "What is SenterosAI?",
    subtitle: isRussian ? "Ваш персональный ИИ-помощник" : "Your personal AI assistant",
    description: isRussian 
      ? "SenterosAI - это современный искусственный интеллект, созданный чтобы помогать вам с повседневными задачами. Он может отвечать на вопросы, помогать с работой, учебой и многим другим."
      : "SenterosAI is a modern artificial intelligence designed to help you with everyday tasks. It can answer questions, help with work, study, and much more.",
    features: {
      title: isRussian ? "Возможности" : "Features",
      list: isRussian 
        ? [
            "Умный разговорный помощник с поддержкой контекста",
            "Работа с изображениями и их анализ",
            "Поддержка голосового ввода и вывода",
            "Многоязычная поддержка",
            "Персонализированные ответы"
          ]
        : [
            "Smart conversational assistant with context support",
            "Image processing and analysis",
            "Voice input and output support",
            "Multilingual support",
            "Personalized responses"
          ]
    },
    useCases: {
      title: isRussian ? "Примеры использования" : "Use cases",
      list: isRussian
        ? [
            "Ответы на вопросы и поиск информации",
            "Помощь в написании текстов и создании контента",
            "Объяснение сложных концепций простыми словами",
            "Анализ изображений и текста",
            "Повседневная помощь и советы"
          ]
        : [
            "Answering questions and finding information",
            "Help with writing texts and creating content",
            "Explaining complex concepts in simple terms",
            "Analyzing images and text",
            "Everyday assistance and advice"
          ]
    },
    chatButton: isRussian ? "Начать общение" : "Start chatting",
    teleportButton: isRussian ? "Навигация" : "Navigation"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex justify-center mb-8">
          <img
            src="https://i.ibb.co/6JWhNYQF/photo-2025-04-21-16-32-07-removebg-preview.png"
            alt="SenterosAI"
            className="w-32 h-32"
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">{content.title}</h1>
        <h2 className="text-xl md:text-2xl text-muted-foreground text-center mb-12">{content.subtitle}</h2>
        
        <div className="prose max-w-none dark:prose-invert mb-12">
          <p className="text-lg text-center mb-8">{content.description}</p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">{content.features.title}</h3>
              <ul className="space-y-2">
                {content.features.list.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">{content.useCases.title}</h3>
              <ul className="space-y-2">
                {content.useCases.list.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Button asChild className="text-lg px-6 py-2 rounded-full" size="lg">
            <Link to="/chat">
              {content.chatButton}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="text-lg px-6 py-2 rounded-full" size="lg">
            <Link to="/tp">{content.teleportButton}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Intro;
