import React, { useState, useEffect } from 'react';
import { Activity, Wifi, ArrowUp, ArrowDown, Shield, Server, Edit2, Save, X } from 'lucide-react';

export default function NetworkPage({ currentUrl, onSave, status }) {
    // Mock data for the bar chart
    const bars = Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 20);

    const [editMode, setEditMode] = useState(false);
    const [inputValue, setInputValue] = useState(currentUrl || '');

    useEffect(() => {
        setInputValue(currentUrl || '');
    }, [currentUrl]);

    const handleSave = () => {
        if (onSave) {
            onSave(inputValue);
            setEditMode(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col px-6 pt-8 pb-24 overflow-y-auto scrollbar-hide animate-fade-in relative">

            {/* Status Header */}
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative mb-4">
                    <div className={`w-4 h-4 rounded-full shadow-[0_0_20px_white] ${status === 'Online' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div className={`absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-50 ${status === 'Online' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
                <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-2">{status || 'Unknown State'}</h2>
                <div className="flex items-center gap-2">
                    {status === 'Online' ? (
                        <>
                            <div className="w-1 h-1 rounded-full bg-green-500"></div>
                            <span className="text-[10px] text-green-400 uppercase tracking-[0.3em]">Secure Link Active</span>
                            <div className="w-1 h-1 rounded-full bg-green-500"></div>
                        </>
                    ) : (
                        <span className="text-[10px] text-yellow-400 uppercase tracking-widest">Searching for Server...</span>
                    )}
                </div>
            </div>

            {/* Connection Config */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Server Address</span>
                    {!editMode ? (
                        <button onClick={() => setEditMode(true)} className="text-blue-400 hover:text-blue-300">
                            <Edit2 size={16} />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setEditMode(false)} className="text-red-400 hover:text-red-300">
                                <X size={16} />
                            </button>
                            <button onClick={handleSave} className="text-green-400 hover:text-green-300">
                                <Save size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {editMode ? (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g. 192.168.1.5:8000"
                        className="w-full bg-black/50 border border-white/30 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                ) : (
                    <div className="font-mono text-sm text-white/80 break-all">
                        {currentUrl || 'Not Configured'}
                    </div>
                )}
                {editMode && (
                    <p className="text-[10px] text-white/40 mt-2">
                        Enter the Local IP of your PC (e.g. 192.168.0.x:8000).
                        Do not use 'localhost' if running on Mobile.
                    </p>
                )}
            </div>

            {/* Network Activity Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Network Activity</span>
                    <span className="text-[10px] text-white/60 font-bold uppercase animate-pulse">Live</span>
                </div>

                <div className="flex items-end justify-between h-24 gap-1">
                    {bars.map((height, i) => (
                        <div
                            key={i}
                            className="w-1 bg-white/20 rounded-t-sm transition-all duration-500 hover:bg-white/60"
                            style={{ height: `${height}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <StatCard
                    icon={Activity}
                    label="Latency"
                    value={status === 'Online' ? '24' : '--'}
                    unit="ms"
                    barValue={status === 'Online' ? 80 : 0}
                />
                <StatCard
                    icon={Shield}
                    label="Stability"
                    value={status === 'Online' ? '98' : '0'}
                    unit="%"
                    barValue={status === 'Online' ? 98 : 0}
                />
                <StatCard
                    icon={ArrowDown}
                    label="Download"
                    value="--"
                    unit="Mbps"
                />
                <StatCard
                    icon={ArrowUp}
                    label="Upload"
                    value="--"
                    unit="Mbps"
                />
            </div>

            {/* Connection Details */}
            <div className="border-t border-white/10 pt-6 mt-2">
                <div className="flex items-center gap-2 mb-4">
                    <Server size={14} className="text-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Connected Node</span>
                    <span className="ml-auto text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60 border border-white/5">PRIMARY</span>
                </div>

                <div className="space-y-3">
                    <DetailRow label="Protocol" value="Socket.IO (Websocket)" />
                    <DetailRow label="Transport" value={status} />
                </div>
            </div>

        </div>
    );
}

function StatCard({ icon: Icon, label, value, unit, barValue }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between min-h-[100px]">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-white/40" />
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
            </div>
            <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    <span className="text-xs text-white/40">{unit}</span>
                </div>
                {barValue !== undefined && (
                    <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${barValue}%` }} />
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-white/30 uppercase tracking-wider">{label}</span>
            <span className="text-white/60">{value}</span>
        </div>
    );
}
