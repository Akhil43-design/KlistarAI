import React from 'react';
import { Trash2, Search, Circle, Terminal } from 'lucide-react';

export default function HistoryPage({ messages }) {
    return (
        <div className="flex-1 flex flex-col px-6 pt-4 pb-24 overflow-y-auto scrollbar-hide animate-fade-in">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-white/60" />
                    <span className="text-[12px] tracking-[0.2em] text-white uppercase font-bold">System Logs</span>
                </div>
                <button className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <Trash2 size={12} className="text-white/60" />
                    <span className="text-[10px] text-white/60 uppercase tracking-wider">Purge</span>
                </button>
            </div>

            {/* Timeline Content */}
            <div className="space-y-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-[5px] top-2 bottom-0 w-[1px] bg-white/10" />

                <TimeSection label="SESSION LOGS">
                    {messages && messages.length > 0 ? (
                        [...messages].reverse().map((msg, index) => (
                            <LogItem
                                key={index}
                                time={new Date().toLocaleTimeString()}
                                id={`MSG-${messages.length - index}`}
                                command={msg.sender === 'User' ? 'User Input' : 'System Response'}
                                details={msg.text}
                                active={index === 0}
                                isUser={msg.sender === 'User'}
                            />
                        ))
                    ) : (
                        <div className="pl-8 text-white/20 text-xs italic">No logs available.</div>
                    )}
                </TimeSection>
            </div>

            {/* Search Bar - Fixed or inline? Screenshot shows it at bottom, similar to command input area but for search */}
            {/* Note: The command input pill is persistent across views in the screenshot, but the search bar seems to be part of the page content or overlaying the bottom area? 
                 In the screenshot, the pill navigation IS present at the bottom. The "Search logs..." input looks like a replacement for the main command input, OR it's just a field at the bottom of the list.
                 Given the user's "make it like this" request which includes the pill navigation in the screenshot, but distinct input...
                 actually the screenshot shows the Search Bar *above* the navigation pill area (which is cut off/blacked out at bottom but visible indicators remain).
                 Let's place it at the bottom of the scroll view for now, or sticky bottom of this view.
             */}
        </div>
    );
}

function TimeSection({ label, children }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 pl-8">
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">{label}</span>
                <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>
            <div className="space-y-8">
                {children}
            </div>
        </div>
    );
}

function LogItem({ time, id, command, details, active }) {
    return (
        <div className="relative pl-8 group">
            {/* Dot */}
            <div className={`absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full border-2 bg-black z-10 ${active ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-white/20'}`} />

            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 font-mono">{time}</span>
                <span className="text-[10px] text-white/20 border border-white/10 px-1 rounded">{id ? `ID: ${id}` : 'ID: ---'}</span>
            </div>

            <div className="text-sm font-bold text-white mb-3">
                <span className="text-white/40 mr-2">&gt;</span>
                {command}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-xs text-white/60 font-mono leading-relaxed">
                {details}
            </div>
        </div>
    );
}
