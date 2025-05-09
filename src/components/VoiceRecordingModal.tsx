
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
  const [visualizerValues, setVisualizerValues] = useState<number[]>(Array(20).fill(5));
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
      
      const audioRecorder = new AudioRecorder(handleAudioData);
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

  // Audio visualization
  const handleAudioData = (audioData: Float32Array) => {
    // Create an animated visualization
    const values = [];
    const step = Math.floor(audioData.length / 20);
    
    for (let i = 0; i < 20; i++) {
      const startIdx = i * step;
      const endIdx = startIdx + step;
      let sum = 0;
      
      for (let j = startIdx; j < endIdx; j++) {
        sum += Math.abs(audioData[j]);
      }
      
      const average = sum / step;
      // Scale the value for better visualization (min 3px, max 40px)
      const scaledValue = Math.max(3, Math.min(40, Math.floor(average * 100)));
      values.push(scaledValue);
    }
    
    setVisualizerValues(values);
  };

  // Generate a dynamic wave when not recording
  useEffect(() => {
    if (!isRecording && !isTranscribing && isOpen) {
      const generateIdleWave = () => {
        const values = Array(20).fill(0).map(() => {
          return Math.floor(Math.random() * 15) + 3; // Random height between 3-18px
        });
        setVisualizerValues(values);
        animationFrameRef.current = requestAnimationFrame(() => {
          setTimeout(generateIdleWave, 200); // Update every 200ms
        });
      };
      
      generateIdleWave();
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isRecording, isTranscribing, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-xl voice-modal-container">
        <div className="voice-modal-content p-6 rounded-xl flex flex-col items-center space-y-6">
          <div className="flex justify-between w-full">
            <h2 className="text-xl font-semibold text-white">Голосовой ввод</h2>
            <Button
              variant="ghost"
              className="p-0 h-auto text-white/70 hover:text-white hover:bg-transparent"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Voice visualizer */}
          <div className="voice-visualizer my-4 h-16">
            {visualizerValues.map((value, index) => (
              <div
                key={index}
                className={`voice-visualizer-bar ${isRecording ? 'animate-wave' : 'animate-sound-wave'}`}
                style={{ 
                  height: `${value}px`,
                  animationDelay: `${index * 0.05}s`,
                  backgroundColor: isRecording 
                    ? 'rgba(239, 68, 68, 0.7)' 
                    : 'rgba(59, 130, 246, 0.7)'
                }}
              />
            ))}
          </div>

          {/* Different states */}
          <div className="flex flex-col items-center space-y-4 w-full">
            {isTranscribing ? (
              <div className="recording-animation animate-fade-in-up flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="voice-record-ring w-16 h-16 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="p-4 rounded-full bg-blue-500/20 animate-pulse flex items-center justify-center">
                    <div className="text-blue-500 animate-spin-slow">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-white/80">Распознавание...</p>
              </div>
            ) : isRecording ? (
              <div className="recording-animation animate-fade-in-up flex flex-col items-center space-y-3">
                <button
                  onClick={stopRecording}
                  className="voice-record-button recording p-4 rounded-full flex items-center justify-center"
                >
                  <StopCircle className="h-8 w-8 text-white" />
                </button>
                <p className="text-white/80">Запись...</p>
              </div>
            ) : (
              <div className="idle-state animate-fade-in-up flex flex-col items-center space-y-3">
                <button
                  onClick={startRecording}
                  className="voice-record-button p-4 rounded-full flex items-center justify-center"
                >
                  <Mic className="h-8 w-8 text-white" />
                </button>
                <p className="text-white/80">Нажмите для записи</p>
              </div>
            )}

            {/* Transcribed text display */}
            {transcribedText && (
              <div className="w-full bg-white/10 p-3 rounded-lg animate-fade-in-up mt-4">
                <p className="text-white/90">{transcribedText}</p>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Отправить
                  </Button>
                </div>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="bg-red-500/20 p-3 rounded-lg w-full animate-fade-in-up">
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Microphone permissions info */}
          <p className="text-white/50 text-xs text-center max-w-xs">
            Для использования голосового ввода необходимо предоставить доступ к микрофону
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceRecordingModal;
