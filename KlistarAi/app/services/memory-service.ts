export interface ChatInteraction {
    id: string;
    query: string;
    response: string;
    sources?: any[];
    timestamp: string;
}

const getKey = (username: string) => `klistar_memory_${username}`;

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// generateId helper is preserved above this block

export const MemoryService = {
    saveInteraction: async (username: string, query: string, response: string, sources?: any[]) => {
        if (!username) return;

        const interaction: ChatInteraction = {
            id: generateId(),
            query,
            response,
            sources,
            timestamp: new Date().toISOString()
        };

        try {
            await fetch('/api/user/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, interaction })
            });
        } catch (e) {
            console.error("Failed to save history remotely", e);
        }
    },

    getHistory: async (username: string): Promise<ChatInteraction[]> => {
        if (!username) return [];

        try {
            const res = await fetch(`/api/user/history?username=${encodeURIComponent(username)}`);
            if (res.ok) {
                const data = await res.json();
                return data.history || [];
            }
        } catch (e) {
            console.error("Failed to fetch history", e);
        }
        return [];
    },

    getRecentContext: async (username: string, limit = 5): Promise<string> => {
        if (!username) return "";
        const history = await MemoryService.getHistory(username);
        // Slice to get recent, then reverse to chronological order (Old -> New)
        return history.slice(0, limit).reverse().map(h => `User: ${h.query}\nAI: ${h.response}`).join('\n\n');
    },

    clearMemory: async (username: string) => {
        if (!username) return;
        try {
            await fetch('/api/user/history', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
        } catch (e) {
            console.error("Failed to clear history", e);
        }
    }
};
