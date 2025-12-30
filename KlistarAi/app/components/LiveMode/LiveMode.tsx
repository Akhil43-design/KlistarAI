"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./LiveMode.module.css";
import { MemoryService } from "@/app/services/memory-service";

interface LiveModeProps {
    user?: { username: string };
    onClose: () => void;
}

type Mode = "listening" | "processing" | "speaking" | "idle";

interface IWindow extends Window {
    webkitSpeechRecognition: any;
}

export default function LiveMode({ user, onClose }: LiveModeProps) {
    const [mode, setMode] = useState<Mode>("idle");
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        // Init Speech API
        if (typeof window !== "undefined") {
            if ("webkitSpeechRecognition" in window) {
                const SpeechRecognition = (window as unknown as IWindow).webkitSpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = "en-US";

                recognitionRef.current.onresult = handleSpeechResult;
                recognitionRef.current.onerror = (e: any) => {
                    console.error("Speech error", e.error);
                    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                        alert("Microphone denied. 🚫\n\nIf you are using a Mobile/Network IP, browsers BLOCK the Mic on HTTP.\n\nUse 'localhost' on PC, or enable HTTPS.");
                    }
                    setMode("idle");
                };
            }

            if ("speechSynthesis" in window) {
                synthesisRef.current = window.speechSynthesis;
            }

            // Auto start
            startListening();
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (synthesisRef.current) synthesisRef.current.cancel();
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setMode("listening");
                setTranscript("Listening...");
            } catch (e) {
                // Already started
            }
        }
    };

    const handleSpeechResult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(`You: "${text}"`);
        setMode("processing");

        // Call AI
        await processAI(text);
    };

    const processAI = async (query: string) => {
        try {
            const historyContext = user ? await MemoryService.getRecentContext(user.username) : "";

            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, context: historyContext }),
            });

            const data = await res.json();
            const answer = data.summary;

            // Save history
            if (user) {
                await MemoryService.saveInteraction(user.username, query, answer, data.sources);
            }

            // Speak
            setTranscript(`AI: "${answer.substring(0, 100)}..."`);
            speak(answer);

        } catch (e) {
            setTranscript("Error connecting to AI.");
            setMode("idle");
        }
    };

    const speak = (text: string) => {
        if (!synthesisRef.current) return;

        // Clean text (remove markdown mostly)
        const cleanText = text.replace(/[*#]/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        setMode("speaking");

        utterance.onend = () => {
            // Loop back to listening
            startListening();
        };

        synthesisRef.current.speak(utterance);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.status}>
                {mode === "listening" && "Listening..."}
                {mode === "processing" && "Thinking..."}
                {mode === "speaking" && "Speaking..."}
                {mode === "idle" && "Tap to start"}
            </div>

            <div className={`${styles.visualizer} ${styles[`mode-${mode}`]}`}>
                <div className={styles.circle}></div>
            </div>

            <div className={styles.transcript}>{transcript}</div>

            <div className={styles.controls}>
                <button className={`${styles.btn} ${styles.btnEnd}`} onClick={onClose}>
                    ✕
                </button>
                {mode === "idle" && (
                    <button className={styles.btn} onClick={startListening} style={{ background: 'white', color: 'black' }}>
                        🎤
                    </button>
                )}
            </div>
        </div>
    );
}
