"use client";

import { useState } from "react";
import styles from "./AuthScreen.module.css";

interface AuthScreenProps {
    onAuthenticated: (user: any) => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
        const payload = isLogin
            ? { identifier: email.trim(), password }
            : { username: username.trim(), email: email.trim(), password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Authentication failed");
                setIsLoading(false);
                return;
            }

            // Success
            onAuthenticated(data.user);

        } catch (err: any) {
            setError("Connection failed: " + (err.message || "Unknown error"));
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{isLogin ? "Welcome Back" : "Join KlistarAi"}</h2>

            {error && <div style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

            <form className={styles.form} onSubmit={handleSubmit}>
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Username"
                        className={styles.input}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                    />
                )}
                <input
                    type="text"
                    placeholder={isLogin ? "Email or Username" : "Email"}
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                />
                <div className={styles.passwordWrapper}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoCapitalize="none"
                    />
                    <button
                        type="button"
                        className={styles.eyeIcon}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1} // Skip tab index for icon
                    >
                        {showPassword ? (
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>

                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? "Processing..." : (isLogin ? "Log In" : "Sign Up")}
                </button>
            </form>

            <div className={styles.toggle} onClick={() => { setIsLogin(!isLogin); setError(""); }}>
                {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
            </div>
        </div>
    );
}
