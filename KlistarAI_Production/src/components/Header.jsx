import React from 'react';

export default function Header() {
    return (
        <div className="flex flex-col items-center justify-center pt-8 pb-4 bg-black sticky top-0 z-50">
            <h1 className="text-sm font-bold tracking-[0.3em] text-white uppercase">
                KLISTAR AI
            </h1>
            <div className="w-12 h-[1px] bg-white/30 mt-4"></div>
        </div>
    );
}
