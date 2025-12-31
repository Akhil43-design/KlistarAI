import sys
import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
try:
    from gravity_agent import GravityAgent
except ImportError:
    from backend.gravity_agent import GravityAgent

from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

# Initialize Gravity Agent (The Brain)
agent = GravityAgent()

# Create Socket.IO Server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    ping_timeout=60, 
    ping_interval=25
)
app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app_socketio = socketio.ASGIApp(sio, app)

@app.get("/status")
async def status():
    return {"status": "running", "brain": "Gravity Agent"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # Use existing agent instance
    result = await agent.process_input(request.message, owner_verified=True)
    # Extract text content from result dict
    reply_text = result.get("content", "Error processing request")
    return {"reply": reply_text}

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio.emit('status', {'msg': 'Connected to KlistarAI Gravity'}, room=sid)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def user_input(sid, data):
    """
    Main communication channel.
    Input: { "text": "Play telugu songs", "owner_verified": true }
    """
    text = data.get('text')
    verified = data.get('owner_verified', True) # Default true for now while manual mode
    
    print(f"[Server] User: {text} (Verified: {verified})")
    
    if not text:
        return

    # 1. Send "Thinking" status
    await sio.emit('status', {'msg': 'Thinking...'}, room=sid)
    
    # 2. Process via Gravity Agent
    result = await agent.process_input(text, owner_verified=verified)
    
    # 3. Handle Result
    # result is { "type": "text"|"play_youtube", "content": "...", "video_id": "..." }
    
    if result["type"] == "text":
        # Send text back for display + TTS
        await sio.emit('response', {
            "type": "text",
            "content": result["content"]
        }, room=sid)
        
    elif result["type"] == "play_youtube":
        # Send command to play video
        await sio.emit('response', {
            "type": "play_youtube",
            "content": result["content"], # "Playing: Song Name"
            "video_id": result["video_id"],
            "title": result["title"]
        }, room=sid)
        
    await sio.emit('status', {'msg': 'Online'}, room=sid)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
