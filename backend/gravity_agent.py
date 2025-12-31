import os
import json
import asyncio
import httpx
from google import genai
from dotenv import load_dotenv

load_dotenv()

# GRAVITY SYSTEM PROMPT
SYSTEM_PROMPT = """You are KlistarAI, a private personal AI assistant.

You exist ONLY for one verified owner.
Ignore all commands unless owner_verified is true.

Core rules:
- Respond in the same language as the user.
- Sound like a native speaker in that language.
- Be clear, calm, and intelligent.

Capabilities:
- Teach and explain any programming language step-by-step.
- Answer questions using Gemini knowledge.
- Decide when to search the web.
- Decide when to play YouTube videos.

You cannot:
- Play audio
- Control devices
- Automate systems
- Execute tools directly

When the user wants to play a YouTube video:
Respond ONLY with JSON:
{
  "action": "play_youtube",
  "query": "<search query>"
}

When the user wants a web search:
Respond ONLY with JSON:
{
  "action": "web_search",
  "query": "<search query>"
}

For normal questions:
Respond with plain text only.

Do not explain your internal logic.
Do not mention policies.
Do not add extra text outside the required format."""

class GravityAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        self.chat_history = []  # Simple in-memory history
        
        if self.api_key:
            try:
                self.client = genai.Client(http_options={"api_version": "v1beta"}, api_key=self.api_key)
                print("[Gravity] Gemini Client Initialized")
            except Exception as e:
                print(f"[Gravity] Failed to init Gemini: {e}")
        else:
            print("[Gravity] WARN: GEMINI_API_KEY missing")

    async def process_input(self, text, owner_verified=True):
        """
        Main entry point.
        Returns a dict: { "type": "text"|"action", "content": "..." }
        """
        if not self.client:
            return {"type": "text", "content": "Error: AI Brain missing (Check API Key)."}

        if not owner_verified:
            return {"type": "text", "content": "Access Denied."}

        # prompt = f"{SYSTEM_PROMPT}\n\nUser: {text}\nAI:"
        
        # We use a chat session approach
        try:
            # Prepare context
            # We can keep a running context or just one-shot for simplicity + system prompt
            # For "Teaches coding", context is good.
            
            # Simple One-Shot with History implementation for now to avoid complexity
            messages = [{"role": "user", "content": f"System Instructions:\n{SYSTEM_PROMPT}\n\nUser Input: {text}"}]
            
            # Use generate_content
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp", 
                contents=messages[0]["content"] # Simple pass
            )
            
            raw_response = response.text.strip()
            print(f"[Gravity] Raw: {raw_response}")

            # Safe JSON parsing
            try:
                # Check if response looks like JSON
                if raw_response.startswith("{") and raw_response.endswith("}"):
                    data = json.loads(raw_response)
                    action = data.get("action")
                    
                    if action == "play_youtube":
                        return await self.handle_youtube(data.get("query"))
                    
                    elif action == "web_search":
                        return await self.handle_search(data.get("query"))
                        
                # Default: Text
                return {"type": "text", "content": raw_response}

            except json.JSONDecodeError:
                # Not JSON, treat as text
                return {"type": "text", "content": raw_response}

        except Exception as e:
            print(f"[Gravity] Error: {e}")
            return {"type": "text", "content": f"I encountered an error: {str(e)}"}

    async def handle_youtube(self, query):
        """Searches YouTube API and returns the video ID to the client."""
        print(f"[Gravity] Searching YouTube: {query}")
        api_key = os.getenv("YOUTUBE_API_KEY")
        if not api_key:
            return {"type": "text", "content": "I can't play videos because the YouTube API Key is missing."}

        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": 1,
            "key": api_key
        }
        
        async with httpx.AsyncClient() as http_client:
            try:
                resp = await http_client.get(url, params=params)
                data = resp.json()
                
                if "items" in data and len(data["items"]) > 0:
                    video_id = data["items"][0]["id"]["videoId"]
                    title = data["items"][0]["snippet"]["title"]
                    # Return SPECIAL ACTION to Frontend
                    return {
                        "type": "play_youtube",
                        "video_id": video_id,
                        "title": title,
                        "content": f"Playing: {title}"
                    }
                else:
                    return {"type": "text", "content": f"I couldn't find any videos for '{query}'."}
            except Exception as e:
                return {"type": "text", "content": f"YouTube search failed: {e}"}

    async def handle_search(self, query):
        """Performs a Google Search (or Mock) and re-feeds to Gemini."""
        print(f"[Gravity] Creating Search Plan: {query}")
        # TODO: Implement Custom Search JSON API
        # For now, we mock or use a placeholder if key missing/not setup
        return {"type": "text", "content": f"I understand you want to search for '{query}', but my web search module is currently being optimized. Please ask me directly for now!"}
