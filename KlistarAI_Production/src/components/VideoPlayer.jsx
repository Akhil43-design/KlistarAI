import React, { useRef, useState } from 'react';
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
            origin: window.location.origin
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
            className="fixed z-50 bg-black/90 border border-white/20 rounded-xl overflow-hidden shadow-2xl w-64 md:w-[600px] cursor-move"
            style={{ top: '5px', right: '5px', margin: '5px' }}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
        >
            <div className="flex justify-between items-center p-2 bg-white/10 backdrop-blur-sm handle">
                <div className="flex flex-col overflow-hidden max-w-[200px] pointer-events-none">
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wide truncate">{title || "Now Playing"}</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">{playerState}</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white p-1"
                    onPointerDownCapture={(e) => e.stopPropagation()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div className="relative pt-[56.25%] bg-black" onPointerDownCapture={(e) => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-full">
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center text-xs">
                    <span className="text-red-400">Play Error. Try another song.</span>
                </div>
            )}
        </motion.div>
    );
}
