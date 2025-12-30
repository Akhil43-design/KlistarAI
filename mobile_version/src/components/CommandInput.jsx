import React from 'react';
import { Mic, Send, Globe, Box, Home, Printer, AudioLines, History, Settings, Wifi, Search, Camera, Hand } from 'lucide-react';

export default function CommandInput({ value, onChange, onSend, isListening, onMicToggle, onNavigate, currentView, isOnline, onPowerToggle, showCamera, onCameraToggle, isHandTracking, onHandTrackingToggle }) {
    const isHistory = currentView === 'history';

    return (
        <div className="bg-black p-4 pb-8 sticky bottom-0 z-50 flex flex-col gap-4">

            {/* Control Pill */}
            <div className="relative mx-auto flex items-center bg-[#111] rounded-full px-6 py-3 border border-white/10 shadow-lg">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onPowerToggle}
                        className={`${isOnline ? 'text-green-500' : 'text-red-500'} hover:scale-110 transition-all`}
                    >
                        <Power size={18} />
                    </button>
                    <button
                        onClick={() => onNavigate('home')}
                        className={`${currentView === 'home' ? 'text-white' : 'text-white/40'} hover:text-white transition-colors`}
                    >
                        <AudioLines size={18} />
                    </button>
                    <button
                        onClick={() => onNavigate('history')}
                        className={`${currentView === 'history' ? 'text-white' : 'text-white/40'} hover:text-white transition-colors`}
                    >
                        <History size={18} />
                    </button>
                    <button
                        onClick={() => onNavigate('settings')}
                        className={`${currentView === 'settings' ? 'text-white' : 'text-white/40'} hover:text-white transition-colors`}
                    >
                        <Settings size={18} />
                    </button>
                </div>

                <div className="w-[1px] h-4 bg-white/10 mx-6"></div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onNavigate('network')}
                        className={`${currentView === 'network' ? 'text-blue-400' : 'text-blue-400/50'} hover:text-blue-300 transition-colors bg-blue-500/10 p-2 rounded-full border border-blue-500/20`}
                    >
                        <Wifi size={18} />
                    </button>
                    <button
                        onClick={onCameraToggle}
                        className={`${showCamera ? 'text-green-400' : 'text-white/40'} hover:text-green-300 transition-colors p-2`}
                        title="Toggle Camera"
                    >
                        <Camera size={18} />
                    </button>
                    <button
                        onClick={onHandTrackingToggle}
                        className={`${isHandTracking ? 'text-purple-400' : 'text-white/40'} hover:text-purple-300 transition-colors p-2`}
                        title="Toggle Hand Tracking"
                    >
                        <Hand size={18} />
                    </button>
                </div>
            </div>

            {/* Input Field */}
            <div className="relative w-full max-w-md mx-auto">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onKeyDown={(e) => e.key === 'Enter' && onSend()}
                    placeholder={isHistory ? "Search logs..." : "Type or speak a command..."}
                    className="w-full bg-[#111] text-white/80 rounded-full px-6 py-4 border border-white/10 focus:border-white/30 outline-none text-sm placeholder:text-white/20"
                />
                <button
                    onClick={isHistory ? onSend : onMicToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                >
                    {isHistory ? (
                        <Search size={20} className="text-white/60" />
                    ) : (
                        <Mic size={20} className={isListening ? 'text-red-500 fill-current' : ''} />
                    )}
                </button>
            </div>
        </div>
    );
}

function Power({ size }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg> }


function QuickAction({ icon: Icon, label }) {
    return (
        <button className="flex flex-col items-center gap-1 min-w-[60px] opacity-60 hover:opacity-100 transition-opacity">
            <div className="p-3 rounded-full bg-white/5 border border-white/10">
                <Icon size={20} />
            </div>
            <span className="text-[10px] uppercase tracking-wider">{label}</span>
        </button>
    )
}
