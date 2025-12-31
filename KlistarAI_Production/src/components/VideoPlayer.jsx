import React, { useState } from 'react';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';

export default function VideoPlayer({ videoId, title, onClose, onEnd }) {
    if (!videoId) return null;

    const [playerState, setPlayerState] = useState('loading'); // loading, playing, paused, error

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 1,
            origin: window.location.origin,
            playsinline: 1, // Crucial for mobile to play inline not fullscreen
            rel: 0,
            modestbranding: 1
        },
    };

    const onReady = (event) => {
        // Player Ready
        console.log("YouTube Player Ready");
        setPlayerState('ready');
    };

    const onError = (event) => {
        console.error("YouTube Player Error:", event.data);
        setPlayerState('error');
    };

    const onStateChange = (event) => {
        // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued).
        const stateCode = event.data;
        if (stateCode === 1) setPlayerState('playing');
        if (stateCode === 2) setPlayerState('paused');
        if (stateCode === 0 && onEnd) onEnd(); // Video Ended
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            className="fixed z-50 bg-gray-900/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl w-[90vw] md:w-[480px] max-w-lg cursor-move"
            style={{ bottom: '100px', right: '20px', margin: '0' }} // Bottom right default
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
        >
            <div className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-md cursor-grab active:cursor-grabbing handle">
                <div className="flex flex-col overflow-hidden mr-2 pointer-events-none">
                    <span className="text-sm font-bold text-white/90 truncate">{title || "Now Playing"}</span>
                    <span className="text-[10px] text-green-400 font-mono tracking-wider uppercase mt-0.5">{playerState === 'playing' ? '▶ Playing' : playerState}</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                    onPointerDownCapture={(e) => e.stopPropagation()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="relative w-full pb-[56.25%] bg-black" onPointerDownCapture={(e) => e.stopPropagation()}>
                <div className="absolute inset-0">
                    <YouTube
                        videoId={videoId}
                        opts={opts}
                        onReady={onReady}
                        onError={onError}
                        onStateChange={onStateChange}
                        className="w-full h-full"
                        iframeClassName="w-full h-full"
                    />
                </div>
            </div>

            {playerState === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center">
                    <span className="text-red-400 font-bold mb-1">Playback Error</span>
                    <span className="text-xs text-gray-400">Video may be restricted or unavailable.</span>
                    <button onClick={onClose} className="mt-3 text-xs bg-white/10 px-3 py-1 rounded-md hover:bg-white/20">Close Player</button>
                </div>
            )}
        </motion.div>
    );
}
