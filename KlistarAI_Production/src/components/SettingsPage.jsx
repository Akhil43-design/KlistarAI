import React from 'react';
import { User, Sliders, Bell, EyeOff, Shield, Activity, Info, ChevronRight, Fingerprint } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="flex-1 flex flex-col px-6 pt-4 pb-24 overflow-y-auto scrollbar-hide animate-fade-in">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-8 border-l-2 border-white/50 pl-4 py-1">
                <span className="text-[10px] tracking-[0.2em] text-white/60 uppercase">System Configuration</span>
            </div>

            {/* Settings List */}
            <div className="space-y-4">
                <SettingsItem
                    icon={User}
                    title="Account"
                    subtitle="USER_ID: K-4921"
                />

                <SettingsItem
                    icon={Sliders}
                    title="Preferences"
                    subtitle="INTERFACE // AUDIO"
                />

                <SettingsItem
                    icon={Bell}
                    title="Notifications"
                    subtitle="ALERTS: ACTIVE"
                />

                <SettingsItem
                    icon={EyeOff}
                    title="Stealth Mode"
                    subtitle="DISABLE ALL SOUNDS"
                    type="toggle"
                />

                <SettingsItem
                    icon={Shield}
                    title="Security"
                    subtitle="2FA // BIOMETRICS"
                />

                <SettingsItem
                    icon={Activity}
                    title="Core Sync"
                    subtitle="AUTO-UPLOAD LOGS"
                    type="toggle"
                    initialValue={true}
                />

                <SettingsItem
                    icon={Info}
                    title="About KlistarAi"
                    subtitle="SYS VER 2.4.0"
                />
            </div>

            {/* Footer / Biometric */}
            <div className="mt-auto pt-12 flex flex-col items-center gap-4 opacity-50">
                <Fingerprint size={48} strokeWidth={1} />
                <span className="text-[8px] uppercase tracking-[0.3em]">Secure Access Point</span>
            </div>
        </div>
    );
}

function SettingsItem({ icon: Icon, title, subtitle, type = 'arrow', initialValue = false }) {
    const [active, setActive] = React.useState(initialValue);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-all">
            <div className="p-3 bg-white/5 rounded-xl text-white/80">
                <Icon size={20} />
            </div>

            <div className="flex-1">
                <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono mt-1">{subtitle}</p>
            </div>

            <div className="text-white/40">
                {type === 'toggle' ? (
                    <button
                        onClick={() => setActive(!active)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-white' : 'bg-white/10'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-black transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                ) : (
                    <ChevronRight size={18} />
                )}
            </div>
        </div>
    );
}
