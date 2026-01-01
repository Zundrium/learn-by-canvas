<div align="center">
  <img src="static/logo.png" alt="Learn By Canvas Logo" width="120" />
</div>

# Learn By Canvas

**Learn By Canvas** is an interactive, multimodal learning application powered by Google's Gemini Multimodal Live API. It combines real-time voice conversation with a dynamic visual canvas to create an immersive tutoring experience.

## Overview

The core idea is to simulate a "live session" where an AI tutor behaves like a human teacher. It can speak to you in real-time and, crucially, use a digital whiteboard (Canvas) to illustrate concepts, write sentences, simulate conversations, or draw diagrams.

## Features

-   **Real-time Voice Interaction**: Talk to the AI naturally with low-latency audio streaming using AudioWorklets.
-   **Dynamic Canvas**: The AI can execute tools to render visual content on the right side of the screen.
-   **Specialized Tools**:
    -   `display_sentence_on_canvas`: Highlights specific sentences with translations (great for language learning).
    -   `display_conversation_on_canvas`: key for role-playing scenarios, showing speakers, target language, phonetics, and English translations.
    -   `display_code_on_canvas`: Renders code snippets with syntax highlighting.
    -   `display_mermaid_diagram_on_canvas`: Visualizes processes and flows using Mermaid graphs.
-   **Smart UI**:
    -   **Sound Wave**: Visualizes the AI's voice activity.
    -   **Chat History**: Keeps a transcript of the conversation.
    -   **Session Management**: Create new chats, switch between history, and resume sessions.
-   **Customization**:
    -   **Voices**: Choose from Gemini's preset voices (Puck, Charon, Kore, Fenrir, Aoede, Erinome).

## Prerequisites

-   Use a modern browser (Chrome/Edge recommended for AudioWorklet support).
-   **Node.js** (v18+ recommended).
-   A **Google Gemini API Key** with access to the Multimodal Live API.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd learn-by-canvas
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory (copy from `.env.example` if available) and add your API key:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

    > **Warning**: Never commit your `.env` file to version control.

## Usage

1.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

2.  **Open the App**:
    Navigate to `http://localhost:5173` (or the URL shown in your terminal).

3.  **Start Learning**:
    -   Click the **Start Session** button to connect to Gemini.
    -   Allow microphone access when prompted.
    -   Start talking! Ask the AI to teach you a language, explain a coding concept, or draw a diagram.

    **Example prompts:**
    -   *"Teach me how to introduce myself in Japanese"* (Triggers `display_conversation_on_canvas`)
    -   *"Explain how a React `useEffect` hook works with code"* (Triggers `display_code_on_canvas`)
    -   *"Draw a flowchart of a login process"* (Triggers `display_mermaid_diagram_on_canvas`)

4.  **Settings**:
    -   Click the gear icon in the sidebar to change the AI's voice.

## Tech Stack

-   **Framework**: SvelteKit
-   **Language**: TypeScript
-   **Styling**: TailwindCSS
-   **AI**: Google Gemini Multimodal Live API
-   **Visuals**: Mermaid.js (diagrams), Highlight.js (code), Canvas API.

## License

[MIT]
