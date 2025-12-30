# KlistarAi 🚀

An intelligent, voice-enabled AI search assistant.

## features
- **AI Search**: Summarizes answers using Groq AI.
- **Voice Interaction**:
  - **Mic Input**: Type with your voice.
  - **Live Mode**: Real-time voice conversation loop (Speech-to-Speech).
- **History Sync**: Automatically saves and syncs chat history + sources across devices.
- **Local Data**: Uses a local file (`data/users.json`) for privacy and simplicity.

## Prerequisites
- **Node.js**: Version 18+ installed on your computer.

## How to Run Locally

1.  **Open Terminal** in the project folder:
    ```bash
    cd d:/KlistarAi
    ```

2.  **Install Dependencies** (First time only):
    ```bash
    npm install
    ```

3.  **Start the Server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    - Go to: [http://localhost:3000](http://localhost:3000)

## Mobile & Network Access

To use on your phone (connected to same WiFi):
1.  Find your PC's Local IP (e.g., `10.76.83.105`).
2.  Open `http://YOUR_IP:3000` on your phone.
3.  **Note on Voice Features**:
    - Browsers **BLOCK** the Microphone on insecure HTTP connections (like IP addresses).
    - To use Voice on Mobile, you must either:
      - Use **Chrome Flags** to allow insecure origins for your IP.
      - Or use a tool like **ngrok** to create a secure HTTPS tunnel.

## Configuration
- API Keys are currently configured in `app/lib/api-config.ts`.
- User data is stored in `data/users.json`.

## Troubleshooting

### PowerShell Error: "Running scripts is disabled"
If you see a red error saying `UnauthorizedAccess` or `cannot be loaded`:
1.  Open **PowerShell** as Administrator (or just normal).
2.  Run this command to allow scripts:
    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```
3.  Type `Y` (Yes) and hit Enter.
4.  Try `npm run dev` again.
