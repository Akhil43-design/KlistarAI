"use client";

import { useEffect, useState } from "react";
import styles from "./IntroAnimation.module.css"; // Reuse intro styles

export default function BackgroundComets() {
    const [comets, setComets] = useState<any[]>([]);

    useEffect(() => {
        // Create 8 background comets (between 5 and 10)
        const initialComets = Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100 - 50}%`,
            angle: `${25 + Math.random() * 40}deg`,
            delay: `${Math.random() * 10}s`, // Long initial delays to spread them out
            duration: `${4 + Math.random() * 4}s`, // Very slow background comets
            scale: 0.3 + Math.random() * 0.5
        }));
        setComets(initialComets);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0, // Behind everything
            overflow: 'hidden'
        }}>
            {comets.map((comet) => (
                <div
                    key={comet.id}
                    className={styles.comet} // Reuse the comet class
                    style={{
                        top: comet.top,
                        left: comet.left,
                        // @ts-ignore
                        '--angle': comet.angle,
                        animationName: 'flyShoot', // Use global flyShoot
                        animationDuration: comet.duration,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite', // Loop forever
                        animationDelay: comet.delay,
                        opacity: 0.5 // Slightly fainter for background
                    }}
                ></div>
            ))}
        </div>
    );
}
