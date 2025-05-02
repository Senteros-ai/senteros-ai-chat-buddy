
// Класс для записи аудио с микрофона
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  
  constructor(private onAudioData?: (audioData: Float32Array) => void) {}
  
  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Создаем медиарекордер для записи аудио в формате webm
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      
      this.mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });
      
      this.mediaRecorder.start(100);
      
      // Также обрабатываем сырые аудиоданные для визуализации
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      if (this.onAudioData) {
        this.processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          this.onAudioData!(new Float32Array(inputData));
        };
      }
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      return true;
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      return false;
    }
  }
  
  stop(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }
      
      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      });
      
      this.mediaRecorder.stop();
    });
  }
  
  cleanup() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.mediaRecorder = null;
  }
}

// Преобразование аудио в base64 для отправки на сервер
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Убираем префикс data:audio/webm;base64, чтобы получить чистый base64
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Use browser's SpeechSynthesis API to speak text
export const speakText = (text: string): void => {
  // Stop any ongoing speech
  window.speechSynthesis.cancel();
  
  // Clean text from emojis and other special characters
  const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, ''); // Keep only letters, numbers, punctuation and spaces
  
  if (!cleanText.trim()) return;
  
  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Set language
  const language = localStorage.getItem('language') || 'ru';
  utterance.lang = language === 'ru' ? 'ru-RU' : 'en-US';
  
  // Get available voices for the selected language
  const voices = window.speechSynthesis.getVoices();
  const languageVoices = voices.filter(voice => voice.lang.startsWith(language));
  
  // Choose a voice
  if (languageVoices.length > 0) {
    utterance.voice = languageVoices[0];
  }
  
  // Speak the text
  window.speechSynthesis.speak(utterance);
};

// Use the browser's speech recognition API
export const transcribeVoice = (language: string = 'ru'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition not supported in this browser'));
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ru' ? 'ru-RU' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };
    
    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };
    
    recognition.start();
  });
};
