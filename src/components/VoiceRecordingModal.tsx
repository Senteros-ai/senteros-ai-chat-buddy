
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Volume2, Play, Square } from 'lucide-react';
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
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
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
      setIsAiSpeaking(true);
      
      // Add event listener to track when speech has ended
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => {
        setIsAiSpeaking(false);
      };
      
      // Speak text also handles adding the utterance to the speechSynthesis queue
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
    setIsAiSpeaking(false);
    onClose();
  };
  
  const handleToggleSpeech = () => {
    if (isAiSpeaking) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    } else if (aiResponse) {
      setIsAiSpeaking(true);
      speakText(aiResponse);
    }
  };
  
  // Get language for UI texts
  const language = localStorage.getItem('language') || 'ru';
  const isRussian = language === 'ru';

  // Return null if not open
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-black to-gray-900 flex items-center justify-center z-50 animate-fade-in">
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
        {/* Recording visualization */}
        <div className="relative mb-8">
          {isRecording ? (
            <div className="recording-animation">
              <div 
                className="w-36 h-36 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse"
                style={{
                  transform: `scale(${1 + Math.max(...amplitudes.slice(-5)) * 0.5})`
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-500/20 to-blue-300/20 animate-spin-slow"></div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center z-10">
                  <Mic className="w-10 h-10 text-white" />
                </div>
              </div>
              
              {/* Sound wave visualization */}
              <div className="voice-visualizer mt-4 flex items-center justify-center space-x-1">
                {amplitudes.slice(-30).map((amp, i) => (
                  <div
                    key={i}
                    className="voice-visualizer-bar bg-blue-400"
                    style={{
                      height: `${Math.max(3, amp * 60)}px`,
                      width: '3px',
                      opacity: i > 15 ? (i - 15) / 15 : (15 - i) / 15,
                      transition: 'height 0.1s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          ) : isAiSpeaking ? (
            <div className="speaking-animation text-center">
              <div className="w-36 h-36 rounded-full bg-gradient-to-b from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50 animate-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-purple-500/20 to-purple-300/20 animate-spin-slow"></div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center z-10">
                  <Volume2 className="w-10 h-10 text-white" />
                </div>
              </div>
              
              {/* Sound wave for AI speaking */}
              <div className="voice-visualizer mt-4 flex items-center justify-center space-x-1">
                {Array(15).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className="bg-purple-400 animate-sound-wave"
                    style={{
                      height: '30px',
                      width: '3px',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="idle-state">
              <div className="w-36 h-36 rounded-full bg-gradient-to-b from-gray-500 to-gray-700 flex items-center justify-center shadow-lg">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-gray-300" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Status message */}
        <div className="text-white text-xl mb-6 font-medium">
          {isRecording ? (
            <span className="animate-pulse">{isRussian ? 'Говорите...' : 'Speaking...'}</span>
          ) : (
            isProcessing ? (
              <span>{isRussian ? 'Обработка...' : 'Processing...'}</span>
            ) : (
              isAiSpeaking ? (
                <span className="animate-pulse">{isRussian ? 'Воспроизведение...' : 'Playing...'}</span>
              ) : (
                userMessage ? (
                  <span>{isRussian ? 'Нажмите на микрофон, чтобы продолжить' : 'Tap the microphone to continue'}</span>
                ) : (
                  <span>{isRussian ? 'Нажмите на кнопку микрофона' : 'Press the microphone button'}</span>
                )
              )
            )
          )}
        </div>
        
        {/* User message and AI response */}
        <div className="w-full max-w-2xl max-h-[60vh] overflow-y-auto bg-background/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10 shadow-xl transition-all duration-300 ease-in-out">
          {userMessage && (
            <div className="mb-6 animate-fade-in">
              <div className="font-semibold text-white mb-2 flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 mr-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{isRussian ? 'Вы' : 'You'}</span>
                </div>
                <span>{isRussian ? 'Вы:' : 'You:'}</span>
              </div>
              <div className="text-white/90 bg-primary/20 p-4 rounded-xl shadow-inner">{userMessage}</div>
            </div>
          )}
          
          {(isProcessing || aiResponse) && (
            <div className="animate-fade-in">
              <div className="font-semibold text-white mb-2 flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-500 mr-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <span>{isRussian ? 'Ассистент:' : 'Assistant:'}</span>
              </div>
              {isProcessing ? (
                <div className="bg-card/30 p-4 rounded-xl shadow-inner">
                  <TypingIndicator />
                </div>
              ) : (
                <div className="text-white/90 bg-card/30 p-4 rounded-xl shadow-inner whitespace-pre-wrap">{aiResponse}</div>
              )}
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex gap-6">
          {!isRecording && !isProcessing && (
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
            >
              <Mic className="w-8 h-8 text-white" />
            </button>
          )}
          
          {aiResponse && !isProcessing && (
            <button
              onClick={handleToggleSpeech}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 ${
                isAiSpeaking 
                  ? "bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30 hover:shadow-red-500/50" 
                  : "bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-500/30 hover:shadow-purple-500/50"
              }`}
            >
              {isAiSpeaking ? (
                <Square className="w-7 h-7 text-white" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1" />
              )}
            </button>
          )}
          
          <button 
            onClick={handleCloseAndReset}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:scale-105"
          >
            <X className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecordingModal;
