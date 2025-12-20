# Overlord

> **"The Final Productivity Tool."**

Overlord is an AI-powered productivity agent that watches your screen while you work. If it catches you distracted (e.g., watching YouTube instead of coding), it locks your screen and forces you to handwrite apologies to unlock your screen.

## 🏗️ Architecture

This is a **Hybrid Agentic System** composed of two parts:

1.  **Electron App:** A desktop application that captures screenshots, handles the "Lock Screen" Kiosk mode, and polls for forgiveness.
2.  **Python Judge Server:** A FastAPI/MCP server that holds your API keys, analyzes screenshots using OpenAI (GPT-4o), and triggers punishments (SMS via Poke API).

This separation ensures your API keys stay secure on your server.

## 🚀 Getting Started

To run Manual Overlord, you need to set up both the **Server**  and the **Client**.

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   An OpenAI API Key
*   A Poke API Key for SMS punishments (visit poke.com!)

---

### Step 1: Set Up Judge Server on Render

Since the Electron app is built for distribution, the recommended way to run the Judge Server is by deploying it to **Render** (or any cloud provider).

1.  **Fork/Clone this Repo:** Make sure you have your own copy of this repository on GitHub.
2.  **Create a Render Service:**
    *   Go to [dashboard.render.com](https://dashboard.render.com).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.
3.  **Configure Build Settings:**
    *   **Root Directory:** `judge-server`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
4.  **Add Environment Variables:**
    *   Scroll down to the "Environment" section.
    *   Add `OPENAI_API_KEY`: `sk-...` (Your OpenAI Key)
    *   Add `POKE_API_KEY`: `pk_...` (Your Poke API Key)
5.  **Deploy:** Click "Create Web Service". Render will give you a URL like `https://manual-overlord-judge.onrender.com`. **Copy this URL.**

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
    *   Enter your **Render URL** from Step 1 (e.g., `https://manual-overlord-judge.onrender.com`).
    *   Click Save.

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
