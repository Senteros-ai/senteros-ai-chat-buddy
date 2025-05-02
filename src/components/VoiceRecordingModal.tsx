
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X } from 'lucide-react';

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
  const [amplitudes, setAmplitudes] = useState<number[]>(Array(60).fill(0));
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      startRecording();
    } else {
      stopRecordingAndCleanup();
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
          
          // If this is a final result, send it
          if (event.results[0].isFinal) {
            if (transcript.trim()) {
              onRecordingComplete(transcript.trim());
            }
            stopRecordingAndCleanup();
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          stopRecordingAndCleanup();
        };
        
        recognition.onend = () => {
          stopRecordingAndCleanup();
        };
        
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        
        // Start visualizing audio
        visualizeAudio();
      } else {
        console.error('Speech recognition not supported in this browser');
        onClose();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onClose();
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Визуализация звука в виде круга с пульсацией */}
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
        
        <div className="text-white text-xl mb-8">
          {isRecording ? 'Говорите...' : 'Обработка...'}
        </div>
        
        {/* Кнопка закрытия */}
        <button 
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
};

export default VoiceRecordingModal;
