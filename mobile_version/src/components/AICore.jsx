import React from 'react';
import { motion } from 'framer-motion';
import { AudioLines } from 'lucide-react';

export default function AICore({ status, isSpeaking }) {
    return (
        <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            {/* Outer Ring */}
            <div className={`absolute w-64 h-64 rounded-full border border-white/10 ${isSpeaking ? 'scale-110 opacity-50' : 'scale-100 opacity-20'} transition-all duration-700`} />
            {/* Active Speaking Ripple Effect */}
            {isSpeaking && (
                <>
                    <div className="absolute w-40 h-40 rounded-full border border-white/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                    <div className="absolute w-40 h-40 rounded-full border border-white/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
                    <div className="absolute w-64 h-64 rounded-full bg-white/5 blur-xl animate-pulse" />
                </>
            )}

            <div className={`absolute w-56 h-56 rounded-full border border-dashed border-white/10 ${isSpeaking ? 'animate-[spin_4s_linear_infinite] border-white/30' : ''} transition-colors duration-300`} />

            {/* Inner Ring */}
            <div className="absolute w-40 h-40 rounded-full border border-white/20 flex items-center justify-center">
                {/* Visualizer Icon / Center */}
                <div className="flex flex-col items-center gap-1">
                    <h2 className={`text-lg font-bold tracking-[0.2em] text-white ${isSpeaking ? 'animate-pulse' : ''}`}>
                        KLISTAR
                    </h2>
                    <span className="text-[9px] font-medium tracking-[0.2em] text-white/60">
                        {status === 'Online' ? 'AI ASSISTANT' : status.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
}
