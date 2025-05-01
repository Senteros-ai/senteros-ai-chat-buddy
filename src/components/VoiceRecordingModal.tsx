
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X } from 'lucide-react';
import { AudioRecorder } from '@/services/voiceService';

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (audioBlob: Blob) => void;
}

const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({ 
  isOpen, 
  onClose, 
  onRecordingComplete 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [amplitudes, setAmplitudes] = useState<number[]>(Array(60).fill(0));
  const recorderRef = useRef<AudioRecorder | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      startRecording();
    }
    
    return () => {
      stopRecording();
    };
  }, [isOpen]);
  
  const startRecording = async () => {
    const recorder = new AudioRecorder(handleAudioData);
    recorderRef.current = recorder;
    
    const success = await recorder.start();
    if (success) {
      setIsRecording(true);
    } else {
      onClose();
    }
  };
  
  const stopRecording = async () => {
    if (recorderRef.current && isRecording) {
      const audioBlob = await recorderRef.current.stop();
      setIsRecording(false);
      
      if (audioBlob) {
        onRecordingComplete(audioBlob);
      }
    }
  };
  
  const handleAudioData = (audioData: Float32Array) => {
    // Рассчитываем амплитуду звука для визуализации
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += Math.abs(audioData[i]);
    }
    const average = sum / audioData.length;
    const amplitude = Math.min(1, average * 5); // Масштабируем для лучшей визуализации
    
    setAmplitudes(prevAmplitudes => {
      const newAmplitudes = [...prevAmplitudes];
      newAmplitudes.shift();
      newAmplitudes.push(amplitude);
      return newAmplitudes;
    });
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
