import { NextResponse } from 'next/server';
import { DBService } from '@/app/lib/db-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const history = DBService.getHistory(username);
    return NextResponse.json({ history });
}

export async function POST(request: Request) {
    try {
        const { username, interaction } = await request.json();

        if (!username || !interaction) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        DBService.addHistory(username, interaction);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { username } = await request.json(); // Or searchParams

        if (!username) {
            return NextResponse.json({ error: "Username required" }, { status: 400 });
        }

        DBService.clearHistory(username);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
    }
}
