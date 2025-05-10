
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, StopCircle, Send, X } from 'lucide-react';
import { AudioRecorder } from '@/services/voiceService';
import { transcribeVoice } from '@/services/voiceService';

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (text: string) => void;
}

const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
  isOpen,
  onClose,
  onRecordingComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cleanup();
      }
    };
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsRecording(false);
      setIsTranscribing(false);
      setTranscribedText('');
      setErrorMessage('');
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cleanup();
      }
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      setErrorMessage('');
      
      const audioRecorder = new AudioRecorder();
      audioRecorderRef.current = audioRecorder;
      
      const success = await audioRecorder.start();
      
      if (success) {
        setIsRecording(true);
      } else {
        setErrorMessage('Не удалось получить доступ к микрофону');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setErrorMessage('Ошибка при запуске записи');
    }
  };

  const stopRecording = async () => {
    try {
      if (!audioRecorderRef.current) return;
      
      setIsRecording(false);
      setIsTranscribing(true);
      
      // Get recording blob
      const audioBlob = await audioRecorderRef.current.stop();
      
      if (!audioBlob) {
        setIsTranscribing(false);
        setErrorMessage('Не удалось записать аудио');
        return;
      }

      // Use browser's speech recognition API 
      try {
        const language = localStorage.getItem('language') || 'ru';
        const text = await transcribeVoice(language);
        handleTranscriptionComplete(text);
      } catch (error) {
        console.error('Speech recognition error:', error);
        setErrorMessage('Не удалось распознать речь');
        setIsTranscribing(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setErrorMessage('Ошибка при остановке записи');
      setIsTranscribing(false);
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    setTranscribedText(text);
    setIsTranscribing(false);
  };

  const handleSubmit = () => {
    if (transcribedText.trim()) {
      onRecordingComplete(transcribedText);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-6 p-6">
          <h2 className="text-xl font-semibold">Голосовой ввод</h2>

          {/* Different states */}
          <div className="flex flex-col items-center space-y-4 w-full">
            {isTranscribing ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 rounded-full bg-blue-500/20 animate-pulse flex items-center justify-center">
                  <div className="text-blue-500 animate-spin">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
                <p className="text-muted-foreground">Распознавание...</p>
              </div>
            ) : isRecording ? (
              <div className="flex flex-col items-center space-y-3">
                <button
                  onClick={stopRecording}
                  className="p-4 rounded-full bg-destructive/90 text-white hover:bg-destructive flex items-center justify-center"
                >
                  <StopCircle className="h-8 w-8" />
                </button>
                <p className="text-muted-foreground">Запись...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <button
                  onClick={startRecording}
                  className="p-4 rounded-full bg-primary/80 text-white hover:bg-primary flex items-center justify-center"
                >
                  <Mic className="h-8 w-8" />
                </button>
                <p className="text-muted-foreground">Нажмите для записи</p>
              </div>
            )}

            {/* Transcribed text display */}
            {transcribedText && (
              <div className="w-full bg-muted p-3 rounded-lg mt-4">
                <p className="text-foreground">{transcribedText}</p>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleSubmit}
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Отправить
                  </Button>
                </div>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="bg-destructive/20 p-3 rounded-lg w-full">
                <p className="text-destructive text-sm">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Microphone permissions info */}
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Для использования голосового ввода необходимо предоставить доступ к микрофону
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceRecordingModal;
