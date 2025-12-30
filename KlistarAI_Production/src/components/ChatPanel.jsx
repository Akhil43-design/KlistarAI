import React, { useEffect, useRef } from 'react';

export default function ChatPanel({ messages }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2 space-y-4 mask-image-gradient">
            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'User' ? 'items-end' : 'items-start'}`}
                >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm border ${msg.sender === 'User'
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-white border-white/20'
                        }`}>
                        {msg.text}
                    </div>
                    <span className="text-[10px] text-white/30 mt-1 px-1">
                        {msg.sender}
                    </span>
                </div>
            ))}
            <div ref={bottomRef} className="h-4" />
        </div>
    );
}
