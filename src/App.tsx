import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./pages/Settings";
import { useEffect } from "react";
import { syncUserProfileToLocalStorage } from "./services/mistralService";
import { supabase } from "./integrations/supabase/client";
import Chat from "./pages/Chat";
import Intro from "./pages/Intro";
import Teleport from "./pages/Teleport";

const queryClient = new QueryClient();

// Apply theme from localStorage on load
const applyStoredTheme = () => {
  const storedTheme = localStorage.getItem('theme') || 'system';
  
  if (storedTheme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', systemTheme === 'dark');
  } else {
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }
};

// Setup theme listener
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

// Register service worker for PWA
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registered');
    } catch (error) {
      console.error('Error registering service worker:', error);
    }
  }
};

// Sync user profile data from Supabase to localStorage
const syncUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.user_metadata) {
      syncUserProfileToLocalStorage(user.user_metadata);
    }
  } catch (error) {
    console.error('Error syncing user profile:', error);
  }
};

const AppWithTheme = () => {
  useEffect(() => {
    initializeBrowserLanguage();
    applyStoredTheme();
    syncUserProfile();
    registerServiceWorker();
    const cleanup = setupThemeListener();
    
    // Update document title for SEO
    document.title = "SenterosAI - Умный помощник на базе Mistral";
    
    return cleanup;
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
              <Route path="/" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/intro" element={<ProtectedRoute><Intro /></ProtectedRoute>} />
              <Route path="/tp" element={<ProtectedRoute><Teleport /></ProtectedRoute>} />
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
