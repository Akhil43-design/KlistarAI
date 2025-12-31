import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Header from './components/Header';
import AICore from './components/AICore';
import ChatPanel from './components/ChatPanel';
import CommandInput from './components/CommandInput';
import ConfirmationModal from './components/ConfirmationModal';
import SettingsPage from './components/SettingsPage';
import HistoryPage from './components/HistoryPage';

import NetworkPage from './components/NetworkPage';
import VideoPlayer from './components/VideoPlayer';

// Helper to determine default URL
const getDefaultUrl = () => {
  // 1. Environment Variable (Priority for APK builds)
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && envUrl.startsWith('http')) return envUrl;

  // 2. User Preference (LocalStorage)
  const stored = localStorage.getItem('klistar_backend_url');
  if (stored) return stored;

  // 3. Fallback (Offline)
  return null;
};

// --- VOICE RECOGNITION SETUP (Web Speech API) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US'; // Auto-detect usually works, but default EN
}

function App() {
  const [backendUrl, setBackendUrlState] = useState(getDefaultUrl());
  const [socket, setSocket] = useState(null);

  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Offline (Tap Network to Connect)');
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [view, setView] = useState('home');

  // Audio/TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Power / Connection State
  const [isOnline, setIsOnline] = useState(false);

  // Video State
  const [videoData, setVideoData] = useState(null);

  // Initialize Socket when URL changes
  useEffect(() => {
    if (!backendUrl) {
      setStatus('Offline (Setup Required)');
      return;
    }
    console.log("Initializing socket with URL:", backendUrl);
    setStatus(`Connecting to ${backendUrl}...`);

    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionAttempts: 20,
      timeout: 60000,
      transports: ['websocket']
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [backendUrl]);

  const handleUpdateBackendUrl = (newUrl) => {
    let formatted = newUrl;
    if (!formatted.startsWith('http')) {
      formatted = `http://${formatted}`;
    }
    if (formatted.startsWith('http:') && (formatted.match(/:/g) || []).length < 2) {
      formatted = `${formatted}:8000`;
    }
    localStorage.setItem('klistar_backend_url', formatted);
    setBackendUrlState(formatted);
    setView('home');
  };

  useEffect(() => {
    if (!socket) return;

    // --- SOCKET EVENT HANDLERS ---

    socket.on('connect', () => {
      setStatus('Online (Gravity Core)');
      setIsOnline(true);
    });

    socket.on('connect_error', (err) => {
      setStatus(`Connection Failed: ${err.message}`);
      setIsOnline(false);
    });

    socket.on('disconnect', () => {
      setStatus('Offline');
      setIsOnline(false);
    });

    socket.on('status', (data) => {
      setStatus(data.msg);
    });

    // Handle Responses from Gravity Agent
    socket.on('response', (data) => {
      console.log("Gravity Response:", data);

      if (data.type === 'text') {
        // Text Response
        addMessage('ADA', data.content);
        speakText(data.content);
      }
      else if (data.type === 'play_youtube') {
        // YouTube Response
        addMessage('ADA', data.content); // "Playing: X"
        setVideoData({ videoId: data.video_id, title: data.title });
        speakText(`Playing ${data.title}`);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('status');
      socket.off('response');
    };
  }, [socket]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  // --- TTS FUNCTION ---
  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    // Stop previous
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Simple voice selection (native)
    // utterance.lang = 'te-IN'; // Could auto-detect later

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handlePowerToggle = () => {
    if (!socket) return;
    if (isOnline) {
      socket.disconnect();
      setIsOnline(false);
      setStatus('System Offline');
    } else {
      socket.connect();
      setStatus('Connecting...');
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !socket) return;

    // UI Update
    addMessage('User', inputText);

    // Send to Backend
    socket.emit('user_input', {
      text: inputText,
      owner_verified: true // Assuming local device is trusted for now
    });

    setInputText('');
  };

  // --- VOICE INPUT HANDLERS ---
  const toggleMic = () => {
    if (!recognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Voice Result Handling
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      // Optional: Auto-send on voice end?
      // handleSend(); // Let's keep manual send for review for now, or populate input
    };

    recognition.onend = () => {
      if (isListening) setIsListening(false);
    }

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
    }
  }, [isListening]);


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white font-mono">
      <Header />

      {view === 'home' ? (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <AICore status={status} isSpeaking={isSpeaking} />
          <ChatPanel messages={messages} />
        </div>
      ) : view === 'settings' ? (
        <SettingsPage />
      ) : view === 'history' ? (
        <HistoryPage messages={messages} />
      ) : (
        <NetworkPage
          currentUrl={backendUrl}
          onSave={handleUpdateBackendUrl}
          status={status}
        />
      )}

      <CommandInput
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onSend={handleSend}
        isListening={isListening}
        onMicToggle={toggleMic}
        onNavigate={setView}
        currentView={view}
        isOnline={isOnline}
        onPowerToggle={handlePowerToggle}
        // Removed Camera/Hand Tracking props for Gravity Architecture
        showCamera={false}
        onCameraToggle={() => { }}
        isHandTracking={false}
        onHandTrackingToggle={() => { }}
      />

      {/* Video Player */}
      <VideoPlayer
        videoId={videoData?.videoId}
        title={videoData?.title}
        onClose={() => setVideoData(null)}
        onEnd={() => setVideoData(null)}
      />

    </div>
  );
}

export default App;
