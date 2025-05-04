
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X } from 'lucide-react';
import { generateChatCompletion, ChatMessage } from '@/services/mistralService';
import { useToast } from "@/hooks/use-toast";
import { speakText } from '@/services/voiceService';
import TypingIndicator from './TypingIndicator';

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (text: string) => void;
}

const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [amplitudes, setAmplitudes] = useState<number[]>(Array(60).fill(0));
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      startRecording();
    } else {
      stopRecordingAndCleanup();
      setUserMessage('');
      setAiResponse('');
    }
    
    return () => {
      stopRecordingAndCleanup();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen]);
  
  const startRecording = async () => {
    try {
      // Request microphone access for visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      
      // Set up speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = localStorage.getItem('language') === 'en' ? 'en-US' : 'ru-RU';
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          
          // If this is a final result, process it
          if (event.results[0].isFinal) {
            if (transcript.trim()) {
              processVoiceInput(transcript.trim());
            }
            stopRecordingAndCleanup();
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          stopRecordingAndCleanup();
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        
        // Start visualizing audio
        visualizeAudio();
      } else {
        console.error('Speech recognition not supported in this browser');
        toast({
          title: "Ошибка",
          description: "Распознавание речи не поддерживается в этом браузере",
          variant: "destructive",
        });
        onClose();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить доступ к микрофону",
        variant: "destructive",
      });
      onClose();
    }
  };
  
  const processVoiceInput = async (transcript: string) => {
    setUserMessage(transcript);
    setIsProcessing(true);
    
    try {
      const messages: ChatMessage[] = [{ 
        role: 'user' as const, 
        content: transcript 
      }];
      
      const response = await generateChatCompletion(messages);
      
      setAiResponse(response.content);
      
      // Clean text for voice output
      const cleanText = response.content
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[-–—.0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
      // Speak the AI response
      speakText(cleanText);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ от ИИ",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const visualizeAudio = () => {
    if (!analyserRef.current || !isRecording) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average amplitude
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedAmplitude = average / 255; // Normalize to 0-1 range
    
    setAmplitudes(prev => {
      const newAmplitudes = [...prev];
      newAmplitudes.shift();
      newAmplitudes.push(normalizedAmplitude);
      return newAmplitudes;
    });
    
    animationFrameRef.current = requestAnimationFrame(visualizeAudio);
  };
  
  const stopRecordingAndCleanup = () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping recognition
      }
      recognitionRef.current = null;
    }
    
    // Stop microphone and clean up audio context
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    analyserRef.current = null;
    setIsRecording(false);
  };

  const handleCloseAndReset = () => {
    // Stop any ongoing speech synthesis
    window.speechSynthesis.cancel();
    onClose();
  };
  
  // Get language for UI texts
  const language = localStorage.getItem('language') || 'ru';
  const isRussian = language === 'ru';

  // Return null if not open
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
        {/* Recording visualization */}
        <div className="relative mb-8">
          <div 
            className={`w-32 h-32 rounded-full bg-gradient-to-b from-blue-300 to-blue-500 flex items-center justify-center transition-all duration-200 ${
              isRecording ? 'animate-pulse' : ''
            }`}
            style={{
              transform: `scale(${1 + Math.max(...amplitudes.slice(-5)) * 0.3})`
            }}
          >
            <Mic className="w-10 h-10 text-white" />
          </div>
        </div>
        
        {/* Status message */}
        <div className="text-white text-xl mb-6">
          {isRecording ? (isRussian ? 'Говорите...' : 'Speaking...') : 
            (isProcessing ? (isRussian ? 'Обработка...' : 'Processing...') : 
              (userMessage ? '' : (isRussian ? 'Нажмите на кнопку микрофона' : 'Press the microphone button')))}
        </div>
        
        {/* User message and AI response */}
        <div className="w-full max-w-2xl max-h-[70vh] overflow-y-auto bg-background/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          {userMessage && (
            <div className="mb-4">
              <div className="font-semibold text-white mb-2">{isRussian ? 'Вы:' : 'You:'}</div>
              <div className="text-white/90 bg-primary/20 p-3 rounded">{userMessage}</div>
            </div>
          )}
          
          {(isProcessing || aiResponse) && (
            <div>
              <div className="font-semibold text-white mb-2">{isRussian ? 'Ассистент:' : 'Assistant:'}</div>
              {isProcessing ? (
                <div className="bg-card/30 p-3 rounded">
                  <TypingIndicator />
                </div>
              ) : (
                <div className="text-white/90 bg-card/30 p-3 rounded whitespace-pre-wrap">{aiResponse}</div>
              )}
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex gap-4">
          {!isRecording && !isProcessing && (
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <Mic className="w-8 h-8 text-white" />
            </button>
          )}
          
          <button 
            onClick={handleCloseAndReset}
            className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecordingModal;
