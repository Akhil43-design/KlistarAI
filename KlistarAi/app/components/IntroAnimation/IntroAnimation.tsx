"use client";

import { useEffect, useState } from "react";
import styles from "./IntroAnimation.module.css";

interface IntroAnimationProps {
    onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
    const [isVisible, setIsVisible] = useState(true);

    const [comets, setComets] = useState<any[]>([]);

    useEffect(() => {
        // Generate random comets only on client side to avoid hydration mismatch
        const newComets = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`, // Vertical scatter
            left: `${Math.random() * 50 - 20}%`, // Start slightly off-left or mid-left
            angle: `${25 + Math.random() * 40}deg`, // Varies between 25deg and 65deg (Diagonal scatter)
            delay: `${Math.random() * 3}s`,
            duration: `${3 + Math.random() * 3}s`, // Slower (3s to 6s)
            scale: 0.5 + Math.random() * 0.7
        }));
        setComets(newComets);

        // Timer for sequence
        const timer = setTimeout(() => {
            setIsVisible(false);
            onComplete();
        }, 3500); // 3.5s duration

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className={styles.container}>
            <div className={styles.cometContainer}>
                {comets.map((comet) => (
                    <div
                        key={comet.id}
                        className={styles.comet}
                        style={{
                            top: comet.top,
                            left: comet.left,
                            // @ts-ignore
                            '--angle': comet.angle, // Pass CSS variable
                            animationName: 'flyShoot',
                            animationDuration: comet.duration,
                            animationTimingFunction: 'cubic-bezier(0.2, 0.5, 0.2, 1)',
                            animationFillMode: 'forwards',
                            animationDelay: comet.delay,
                            // Transform is handled in keyframes using --angle
                        }}
                    ></div>
                ))}
            </div>
            {/* Title moved to page.tsx for continuous animation */}
        </div>
    );
}
