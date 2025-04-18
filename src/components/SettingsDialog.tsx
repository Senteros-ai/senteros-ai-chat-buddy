
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import YandexAdManager from './YandexAdManager';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [experimentalDesign, setExperimentalDesign] = useState(false);
  const [showSaveAd, setShowSaveAd] = useState(false);
  const { toast } = useToast();
  const { language, languages, setLanguage, texts } = useAppLanguage();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    const savedExperimentalDesign = localStorage.getItem('experimentalDesign') === 'true';
    setTheme(savedTheme);
    setExperimentalDesign(savedExperimentalDesign);
  }, [open]);

  const handleSaveSettings = () => {
    setShowSaveAd(true);
  };

  const handleSaveAdClosed = () => {
    setShowSaveAd(false);
    
    // Actually save the settings after ad is shown
    localStorage.setItem('theme', theme);
    localStorage.setItem('experimentalDesign', experimentalDesign.toString());
    
    // Apply theme
    applyTheme(theme);
    
    // Apply experimental design
    document.documentElement.classList.toggle('experimental-design', experimentalDesign);
    
    toast({
      title: texts.settingsSaved,
      description: texts.settingsSavedDesc,
    });
    
    onOpenChange(false);
  };

  const applyTheme = (selectedTheme: string) => {
    if (selectedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <YandexAdManager trigger={showSaveAd} onClose={handleSaveAdClosed} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {texts.settings}
          </DialogTitle>
          <DialogDescription>
            {texts.configureApp}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme" className="col-span-4">
              {texts.theme}
            </Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
              <SelectTrigger id="theme" className="col-span-4">
                <SelectValue placeholder={texts.selectTheme} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{texts.light}</SelectItem>
                <SelectItem value="dark">{texts.dark}</SelectItem>
                <SelectItem value="system">{texts.system}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="col-span-4">
              {texts.language}
            </Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
              <SelectTrigger id="language" className="col-span-4">
                <SelectValue placeholder={texts.selectLanguage} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="experimental-design" className="col-span-3">
              {texts.experimentalDesign || 'Экспериментальный дизайн'}
            </Label>
            <Switch
              id="experimental-design"
              checked={experimentalDesign}
              onCheckedChange={setExperimentalDesign}
              className="col-span-1 justify-self-end"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveSettings}>
            {texts.saveSettings}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
