import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmationModal({ request, onConfirm, onDeny }) {
    if (!request) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-black border border-white/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                >
                    {/* Header */}
                    <div className="bg-white/5 p-4 border-b border-white/10 flex items-center gap-3">
                        <AlertCircle className="text-white" size={24} />
                        <h3 className="text-lg font-mono font-bold text-white tracking-wide">
                            SYSTEM REQUEST
                        </h3>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <p className="text-white/60 text-sm font-mono">
                            The AI is requesting permission to execute:
                        </p>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-white font-bold font-mono text-center mb-1 uppercase">
                                {request.tool}
                            </div>
                            {/* Optional: Show args if useful, or keep it simple */}
                            <pre className="text-[10px] text-white/40 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(request.args, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-white/5">
                        <button
                            onClick={onDeny}
                            className="flex items-center justify-center gap-2 p-4 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        >
                            <X size={20} />
                            <span>DENY</span>
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex items-center justify-center gap-2 p-4 bg-white text-black font-bold hover:bg-white/90 transition-colors"
                        >
                            <Check size={20} />
                            <span>APPROVE</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
