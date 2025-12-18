# 👁️ Manual Overlord

> **"Productivity through Social Shame."**

Manual Overlord is an AI-powered productivity agent that watches your screen while you work. If it catches you distracted (e.g., watching YouTube instead of coding), it locks your screen and—optionally—texts your ex-partner to tell them you aren't working.

## 🏗️ Architecture

This is a **Hybrid Agentic System** composed of two parts:

1.  **The Body (Electron App):** A desktop application that captures screenshots, handles the "Lock Screen" Kiosk mode, and polls for forgiveness.
2.  **The Brain (Python Judge Server):** A FastAPI/MCP server that holds your API keys, analyzes screenshots using OpenAI (GPT-4o), and triggers punishments (SMS via Poke API).

This separation ensures your API keys stay secure on your server and allows for flexible "Brains" (e.g., swapping OpenAI for local Ollama/Llama 3.2).

## 🚀 Getting Started

To run Manual Overlord, you need to set up both the **Server** (Brain) and the **Client** (Body).

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   An OpenAI API Key
*   (Optional) A Poke API Key for SMS punishments

---

### Step 1: Set Up "The Brain" (Judge Server)

1.  Navigate to the server directory:
    ```bash
    cd judge-server
    ```

2.  Create a virtual environment & install dependencies:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  Create a `.env` file in `judge-server/` with your credentials:
    ```env
    OPENAI_API_KEY=sk-your-openai-key-here
    POKE_API_KEY=pk_your-poke-key-here
    ```

4.  Run the server:
    ```bash
    fastmcp run server.py
    # OR for production
    uvicorn server:app --host 0.0.0.0 --port 8000
    ```
    *Your server is now running at `http://localhost:8000`*

---

### Step 2: Set Up "The Body" (Electron App)

1.  Open a new terminal in the project root.

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the app:
    ```bash
    npm run dev
    ```

4.  **Configure the Connection:**
    *   Click the **⚙️ Gear Icon** in the top-right corner of the app.
    *   Enter your Judge Server URL.
    *   If running locally, use: `http://localhost:8000`
    *   If you deployed the server to Render/Vercel, use your cloud URL (e.g., `https://my-judge.onrender.com`).

---

### 🎮 How to Use

1.  **Enter a Directive:** Tell the Overlord what you are supposed to be doing (e.g., *"Writing the technical blog post"*).
2.  **Set Duration:** How long do you need to focus? (e.g., 30 minutes).
3.  **Start:** The window will shrink to the corner.
4.  **Work:** Every 30 seconds, the Eye takes a screenshot.
    *   **Verdict YES:** The timer continues.
    *   **Verdict NO:**
        *   Your screen gets **LOCKED** (Kiosk Mode).
        *   A text is sent to your accountability partner (if configured).
        *   You must wait for the "Agent" (or your friend) to unlock you via the server.

---

### 🛠️ Advanced: Deploying Your Own Judge

If you want to use this on multiple computers or share it with friends, you should deploy the Python Server to the cloud.

**Deploy to Render:**
1.  Push this repo to GitHub.
2.  Create a new **Web Service** on Render.
3.  Root Directory: `judge-server`.
4.  Build Command: `pip install -r requirements.txt`.
5.  Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`.
6.  Add your `OPENAI_API_KEY` in the Environment Variables settings.

---

### 🤝 Contributing

This project is a Proof of Concept for **Personal Accountability Agents**.
Ideas for improvement:
*   [ ] Add Local LLM support (Ollama/Llama 3.2) for privacy & $0 cost.
*   [ ] Add WebSocket support for real-time locking (instead of polling).
*   [ ] Add a "Focus Score" dashboard.

### 📜 License

MIT License. Use at your own risk (and sanity).
