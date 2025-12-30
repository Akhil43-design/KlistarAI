import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/app/lib/api-config';

// Interfaces
interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

// 1. Google Search Implementation (Disabled/Hint only as keys are removed)
async function googleSearch(query: string): Promise<SearchResult[]> {
    // Since keys were removed by user request, we return a hint or fallback.
    // We can't fetch real results without keys.
    const encodedQuery = encodeURIComponent(query);
    return [
        {
            title: `Search Google for "${query}"`,
            url: `https://www.google.com/search?q=${encodedQuery}`,
            snippet: "Real-time search results are currently disabled. Click to search on Google directly."
        }
    ];
}

// 2. Groq AI Summarization Implementation
async function generateSummary(query: string, searchResults: SearchResult[], historyContext: string = ""): Promise<string> {
    const apiKey = API_CONFIG.GROQ_API_KEY;

    if (!apiKey) {
        return "Error: Missing configuration.";
    }

    // Use general knowledge since we might not have search results
    const prompt = `
    You are KlistarAi, an intelligent research assistant. 
    
    PREVIOUS CONTEXT (History):
    ${historyContext}

    Current User Query: "${query}"
    
    Task: Answer the user's query comprehensively using your own knowledge.
    Format: Use Markdown. Be concise, professional, and minimal.
  `;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Updated from decommissioned llama3-8b-8192
                messages: [
                    { role: "system", content: "You are KlistarAi." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 1024
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Groq API Error: ${res.status} ${errorText}`);
        }

        const data = await res.json();
        return data.choices[0]?.message?.content || "Failed to generate summary.";

    } catch (error) {
        console.error("Groq Call Failed:", error);
        return "Error: Unable to contact AI provider. " + error;
    }
}

export async function POST(request: Request) {
    try {
        const { query, context } = await request.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // 1. Perform Search
        const searchResults = await googleSearch(query);

        // 2. Generate Summary (pass search results context + history context)
        const summary = await generateSummary(query, searchResults, context || "");

        // 3. Return Combined Response
        return NextResponse.json({
            summary,
            sources: searchResults.map(r => ({ title: r.title, url: r.url }))
        });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
