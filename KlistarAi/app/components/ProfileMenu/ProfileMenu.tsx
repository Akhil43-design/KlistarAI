"use client";

import { useState, useEffect } from "react";
import styles from "./ProfileMenu.module.css";
import { MemoryService, ChatInteraction } from "@/app/services/memory-service";

interface ProfileMenuProps {
    user?: { username: string; email: string };
    onLogout?: () => void;
    onSelectHistoryItem?: (item: ChatInteraction) => void;
}

export default function ProfileMenu({ user, onLogout, onSelectHistoryItem }: ProfileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<ChatInteraction[]>([]);

    // Refresh history when menu opens
    useEffect(() => {
        if (isOpen && user?.username) {
            MemoryService.getHistory(user.username).then(setHistory);
        }
    }, [isOpen, user]);

    const handleClear = async () => {
        if (confirm("Clear local memory?") && user?.username) {
            await MemoryService.clearMemory(user.username);
            setHistory([]);
        }
    };

    const handleRefresh = () => {
        if (user?.username) {
            setHistory([]);
            MemoryService.getHistory(user.username).then(setHistory);
        }
    };

    return (
        <div className={styles.container}>
            {isOpen && (
                <div className={styles.menu}>
                    <div>
                        <div className={styles.sectionTitle}>Account</div>
                        <div className={styles.accountDetail}>Username: {user?.username || "Guest"}</div>
                        {user?.email && <div className={styles.accountDetail}>{user.email}</div>}

                        {onLogout && (
                            <button className={styles.clearButton} onClick={onLogout} style={{ background: '#333', color: '#fff', marginTop: '0.25rem' }}>
                                Log Out
                            </button>
                        )}
                    </div>

                    <div>
                        <div className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Chat History</span>
                            <button onClick={handleRefresh} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem' }} title="Refresh">
                                🔄
                            </button>
                        </div>
                        {history.length === 0 ? (
                            <div style={{ color: '#666', fontSize: '0.8rem' }}>No history yet</div>
                        ) : (
                            <div className={styles.historyList}>
                                {history.map(item => (
                                    <div
                                        key={item.id}
                                        className={styles.historyItem}
                                        title={item.query}
                                        onClick={() => {
                                            if (onSelectHistoryItem) onSelectHistoryItem(item);
                                            setIsOpen(false);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {item.query}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className={styles.sectionTitle}>Settings</div>
                        <button className={styles.clearButton} onClick={handleClear}>
                            Clear Memory
                        </button>
                    </div>
                </div>
            )}

            <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? "×" : "👤"}
            </button>
        </div>
    );
}
