import { NextResponse } from 'next/server';
import { DBService, User } from '@/app/lib/db-service';

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existing = DBService.findUser(email);
        if (existing) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        const newUser: User = {
            id: crypto.randomUUID(),
            username,
            email,
            password, // Warning: Storing plain text password as per prototype
            createdAt: new Date().toISOString()
        };

        DBService.saveUser(newUser);

        return NextResponse.json({ success: true, user: { username: newUser.username, email: newUser.email } });

    } catch (error) {
        return NextResponse.json({ error: "Signup failed" }, { status: 500 });
    }
}
