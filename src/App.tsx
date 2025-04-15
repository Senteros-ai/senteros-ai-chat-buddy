
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./pages/Settings";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Применение темы из localStorage при загрузке
const applyStoredTheme = () => {
  const storedTheme = localStorage.getItem('theme') || 'system';
  
  if (storedTheme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', systemTheme === 'dark');
  } else {
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }
};

// Добавляем поддержку для наблюдения за изменениями системной темы
const setupThemeListener = () => {
  const storedTheme = localStorage.getItem('theme') || 'system';
  
  if (storedTheme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }
  
  return () => {};
};

// Initialize browser language if not already set
const initializeBrowserLanguage = () => {
  if (!localStorage.getItem('language')) {
    const browserLang = navigator.language.split('-')[0];
    const supportedLanguages = ['ru', 'en', 'es', 'fr', 'de', 'it', 'zh', 'ja', 'ar', 'pt', 'hi'];
    
    if (supportedLanguages.includes(browserLang)) {
      localStorage.setItem('language', browserLang);
    } else {
      localStorage.setItem('language', 'en');
    }
  }
};

const AppWithTheme = () => {
  useEffect(() => {
    initializeBrowserLanguage();
    applyStoredTheme();
    return setupThemeListener();
    
    // Update document title for SEO
    document.title = "SenterosAI Chat Buddy";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AppWithTheme;
