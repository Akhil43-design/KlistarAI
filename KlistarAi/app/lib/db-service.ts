import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

export interface User {
    username: string;
    email: string;
    password: string; // Plain text for prototype
    createdAt: string;
    history?: any[];
}

// Internal helper to ensure DB exists
function ensureDB() {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([]));
    }
}

export const DBService = {
    getUsers: (): User[] => {
        ensureDB();
        try {
            const data = fs.readFileSync(DB_PATH, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    },

    saveUser: (user: User) => {
        const users = DBService.getUsers();
        users.push(user);
        fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
    },

    findUser: (identifier: string): User | undefined => {
        const users = DBService.getUsers();
        return users.find(u => u.email === identifier || u.username === identifier);
    },

    createUser: (user: Omit<User, 'createdAt' | 'history'>): User => {
        const users = DBService.getUsers();
        if (users.find(u => u.username === user.username || u.email === user.email)) {
            throw new Error("User already exists");
        }

        const newUser: User = {
            ...user,
            createdAt: new Date().toISOString(),
            history: []
        };

        users.push(newUser);
        fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
        return newUser;
    },

    addHistory: (username: string, interaction: any) => {
        const users = DBService.getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex !== -1) {
            if (!users[userIndex].history) users[userIndex].history = [];

            // Limit to last 50
            const currentHistory = users[userIndex].history || [];
            const updatedHistory = [interaction, ...currentHistory].slice(0, 50);

            users[userIndex].history = updatedHistory;
            fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
        }
    },

    getHistory: (username: string): any[] => {
        const user = DBService.findUser(username);
        return user?.history || [];
    },

    clearHistory: (username: string) => {
        const users = DBService.getUsers();
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex !== -1) {
            users[userIndex].history = [];
            fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
        }
    }
};
