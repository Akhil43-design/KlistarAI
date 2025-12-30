import { NextResponse } from 'next/server';
import { DBService } from '@/app/lib/db-service';

export async function POST(request: Request) {
    try {
        const { identifier, password } = await request.json();

        if (!identifier || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const user = DBService.findUser(identifier);

        if (!user || user.password !== password) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Return user info for client state
        return NextResponse.json({ success: true, user: { username: user.username, email: user.email } });

    } catch (error) {
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
