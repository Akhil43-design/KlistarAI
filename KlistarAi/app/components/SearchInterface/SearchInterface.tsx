"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import styles from "./SearchInterface.module.css";

// Web Speech API Types
interface IWindow extends Window {
    webkitSpeechRecognition: any;
}

interface SearchInterfaceProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
}

export default function SearchInterface({ onSearch, isLoading = false }: SearchInterfaceProps) {
    const [query, setQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && query.trim() && !isLoading) {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (query.trim()) {
            setHasSearched(true);
            onSearch(query);
        }
    };

    const handleMicClick = () => {
        if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
            const SpeechRecognition = (window as unknown as IWindow).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = "en-US";

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                setIsListening(false);
                // Optionally auto-submit: onSearch(transcript);
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'network') {
                    alert("Speech API Network Error. 📶\n\nGoogle's Speech API requires internet access. Please check your connection.");
                }
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    alert("Microphone denied. 🚫\n\nIf you are on a mobile/network IP, browsers BLOCK the Mic for security (HTTP).\n\nTry:\n1. Use 'localhost' on this PC.\n2. Or enable 'Insecure origins' flag in Chrome.");
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            alert("Voice input is not supported in this browser. Please use Chrome.");
        }
    };

    return (
        <div className={`${styles.container} ${hasSearched ? styles.hasQuery : ""}`}>
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Ask anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    autoFocus
                />
                <div className={styles.actions}>
                    <div className={`${styles.icon} ${isListening ? styles.listening : ''}`} onClick={handleMicClick} title="Voice Input">
                        {isListening ? (
                            <span style={{ color: '#ff4444' }}>●</span>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <div className={styles.icon} onClick={handleSubmit} title="Search">
                        {isLoading ? (
                            <span className={styles.loading}>●</span>
                        ) : (
                            <span>→</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
