import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Header from './components/Header';
import AICore from './components/AICore';
import ChatPanel from './components/ChatPanel';
import CommandInput from './components/CommandInput';
import ConfirmationModal from './components/ConfirmationModal';
import SettingsPage from './components/SettingsPage';
import HistoryPage from './components/HistoryPage';

import { motion } from 'framer-motion';
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

function App() {
  const [backendUrl, setBackendUrlState] = useState(getDefaultUrl());
  const [socket, setSocket] = useState(null);

  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Offline (Tap Network to Connect)'); // Default status
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [confirmationRequest, setConfirmationRequest] = useState(null);
  const [view, setView] = useState('home');


  // Audio Streaming State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Power / Connection State
  const [isOnline, setIsOnline] = useState(false);

  // Video State
  const [videoData, setVideoData] = useState(null);
  const [videoQueue, setVideoQueue] = useState([]);
  const videoDataRef = useRef(videoData); // Ref to track current video for event listener

  // Keep ref in sync
  useEffect(() => { videoDataRef.current = videoData; }, [videoData]);

  // Gesture State
  const [gesture, setGesture] = useState(null);
  const [isHandTracking, setIsHandTracking] = useState(false);

  // Camera State
  const [cameraFrame, setCameraFrame] = useState(null);
  // Camera state - Default ON as requested
  const [showCamera, setShowCamera] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  // Initialize Socket when URL changes
  useEffect(() => {
    if (!backendUrl) {
      setStatus('Offline (Setup Required)');
      return;
    }
    console.log("Initializing socket with URL:", backendUrl);
    setStatus(`Connecting to ${backendUrl}...`);

    // Force WebSocket for stability
    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionAttempts: 20,
      timeout: 60000, // 60s timeout for Render Cold Start
      transports: ['websocket']
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [backendUrl]);

  const handleUpdateBackendUrl = (newUrl) => {
    // Basic normalization
    let formatted = newUrl;
    if (!formatted.startsWith('http')) {
      formatted = `http://${formatted}`;
    }

    // Only append port 8000 if it's HTTP (unsecured local) and missing port
    // HTTPS (like localtunnel) usually usually implies 443 or is specified
    if (formatted.startsWith('http:') && (formatted.match(/:/g) || []).length < 2) {
      formatted = `${formatted}:8000`;
    }

    localStorage.setItem('klistar_backend_url', formatted);
    setBackendUrlState(formatted);
    setView('home'); // Go back to home after saving
  };


  // Capture Local Camera and Stream to Backend
  useEffect(() => {
    if (!showCamera || !socket || !isOnline) return;

    let videoStream;
    let intervalId;

    const startCamera = async () => {
      try {
        setCameraError(null);

        // Explicitly check for API support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          // Allow skipping camera on non-secure contexts (like basic http IP access) with a warning
          console.warn("Camera API not available (Requires HTTPS or Localhost)");
          setCameraError("HTTPS Required");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 320,
            height: 240,
            facingMode: 'user' // Selfie camera by default
          }
        });

        videoStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Streaming Interval (10 FPS to save bandwidth)
        intervalId = setInterval(() => {
          if (videoRef.current && canvasRef.current && socket.connected) {
            const context = canvasRef.current.getContext('2d');
            // Draw video to canvas
            context.drawImage(videoRef.current, 0, 0, 320, 240);
            // Convert to Base64 (JPEG 0.5 quality)
            const imageData = canvasRef.current.toDataURL('image/jpeg', 0.5);
            // Send to server (strip prefix)
            const base64Data = imageData.split(',')[1];
            socket.emit('video_frame', { image: base64Data });
          }
        }, 100); // 100ms = 10 FPS

      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError(err.message || "Camera access failed");
        setMessages(prev => [...prev, { sender: 'System', text: `Camera Error: ${err.message}` }]);
      }
    };

    startCamera();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, socket, isOnline]);


  useEffect(() => {
    if (!socket) return;

    // Socket Event Listeners
    socket.on('connect', () => {
      setStatus('Online');
      setIsOnline(true);
      // Auto-start audio to initialize Gemini Session (uses Host PC mic for now)
      socket.emit('start_audio', { device_index: null });
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

    // Video Command
    socket.on('play_video', (data) => {
      console.log("Video Command Received:", data);

      if (videoDataRef.current) {
        // If a video is currently playing, add to queue
        console.log("Video playing, adding to queue:", data.title);
        setVideoQueue(prev => [...prev, data]);
        setMessages(prev => [...prev, { sender: 'System', text: `Queued: ${data.title}` }]);
      } else {
        // Play immediately
        setVideoData(data);
      }
    });

    // Gesture Event
    socket.on('gesture', (data) => {
      console.log("Gesture:", data.name);
      setGesture(data.name);
      // Clear after 2 seconds
      setTimeout(() => setGesture(null), 2000);
    });

    // Toggle Commands from Backend
    socket.on('toggle_camera', (data) => {
      setShowCamera(data.state);
    });

    socket.on('toggle_hand_tracking', (data) => {
      setIsHandTracking(data.state);
    });

    // Camera Frame
    socket.on('video_frame', (data) => {
      setCameraFrame(data.image);
    });

    // Transcription (Streaming)
    socket.on('transcription', (data) => {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === data.sender) {
          // Update last message
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { ...lastMsg, text: lastMsg.text + data.text };
          return newMsgs;
        } else {
          // New message
          return [...prev, { sender: data.sender, text: data.text }];
        }
      });

      // Simple pulse trigger if ADA is sending text
      if (data.sender === 'ADA') {
        setIsSpeaking(true);
        // Clear speaking flag after a delay if no more text comes
        clearTimeout(speakingTimeout.current);
        speakingTimeout.current = setTimeout(() => setIsSpeaking(false), 500);
      }
    });

    // Handle tool confirmation
    socket.on('tool_confirmation_request', (data) => {
      console.log("Confirmation Requested:", data);
      setConfirmationRequest(data);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('status');
      socket.off('transcription');
      socket.off('tool_confirmation_request');
      socket.off('video_frame');
    };
  }, [socket]);

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

  const speakingTimeout = useRef(null);

  const handleSend = () => {
    if (!inputText.trim() || !socket) return;

    // Optimistic UI update
    setMessages(prev => [...prev, { sender: 'User', text: inputText }]);

    // Emit to backend
    socket.emit('user_input', { text: inputText });
    setInputText('');
  };

  const toggleMic = () => {
    if (!socket) return;
    if (isListening) {
      socket.emit('stop_audio'); // or pause
      setIsListening(false);
    } else {
      socket.emit('start_audio', { device_index: null });
      setIsListening(true);
    }
  };

  const handleConfirmTool = () => {
    if (!confirmationRequest || !socket) return;
    socket.emit('confirm_tool', { id: confirmationRequest.id, confirmed: true });
    setConfirmationRequest(null);
    setMessages(prev => [...prev, { sender: 'System', text: `Approved: ${confirmationRequest.tool}` }]);
  };

  const handleDenyTool = () => {
    if (!confirmationRequest || !socket) return;
    socket.emit('confirm_tool', { id: confirmationRequest.id, confirmed: false });
    setConfirmationRequest(null);
    setMessages(prev => [...prev, { sender: 'System', text: `Denied: ${confirmationRequest.tool}` }]);
  };

  const handleVideoEnd = () => {
    console.log("Video Ended. Checking Queue...", videoQueue);
    if (videoQueue.length > 0) {
      const nextVideo = videoQueue[0];
      setVideoQueue(prev => prev.slice(1));
      setVideoData(nextVideo);
      console.log("Playing next in queue:", nextVideo.title);
    } else {
      setVideoData(null); // Close player if empty
    }
  };

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

      {/* Gesture Notification */}
      {gesture && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-600/80 text-white px-4 py-2 rounded-full backdrop-blur-md z-50 animate-pulse">
          ✋ {gesture}
        </div>
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
        showCamera={showCamera}
        onCameraToggle={() => setShowCamera(!showCamera)}
        isHandTracking={isHandTracking}
        onHandTrackingToggle={() => setIsHandTracking(!isHandTracking)}
      />

      <ConfirmationModal
        request={confirmationRequest}
        onConfirm={handleConfirmTool}
        onDeny={handleDenyTool}
      />

      <VideoPlayer
        videoId={videoData?.videoId}
        title={videoData?.title}
        onClose={() => setVideoData(null)}
        onEnd={handleVideoEnd}
      />

      {/* Camera Feed - Draggable local preview */}
      {showCamera && (
        <motion.div
          drag
          className="fixed top-[10px] left-[10px] w-[250px] h-[200px] bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-lg z-30 cursor-move"
        >
          {/* Debug Overlay */}
          <div className="absolute top-0 left-0 bg-black/50 text-[10px] text-green-400 p-1 z-10 font-mono pointer-events-none">
            {cameraError ? "ERR: Blocked" : "Status: Active"}
          </div>
          {cameraError ? (
            <div className="flex flex-col items-center justify-center h-full p-2 text-center bg-gray-900">
              <span className="text-red-500 text-xs font-bold">CAMERA BLOCKED</span>
              <span className="text-white/[0.6] text-[10px] leading-tight mt-1">HTTPS Required for Mobile</span>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          )}

          {/* Overlay Canvas for Visual Tracking */}
          <canvas
            ref={overlayCanvasRef}
            width="320"
            height="240"
            className="absolute top-0 left-0 w-full h-full pointer-events-none transform scale-x-[-1]" // Match video mirror
          />

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} width="320" height="240" className="hidden" />

          {/* Status Dot */}
          <div className="absolute bottom-1 right-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </motion.div>
      )}

    </div>
  );
}

export default App;
