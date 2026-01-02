# Learn By Canvas

## Project Overview
This project is a SvelteKit application called **Learn By Canvas**. It utilizes the **Gemini Multimodal Live API** to create an interactive learning experience. The core interaction model involves the user speaking to Gemini, which then uses various "tools" to display relevant visual content on a canvas.

## Key Technologies
- **SvelteKit**: Frontend framework.
- **Gemini Multimodal Live API**: For real-time voice and video interaction.
- **WebSocket**: Used for communication with the Gemini API.

## Project Structure

### Main Directories
- **`src/lib`**: Contains the core application logic and reusable UI components.
  - **`gemini.ts`**: This is the heart of the application. It handles the **GeminiSession** class, which manages the WebSocket connection, audio streaming (input/output), and tool execution.
  - **`components/`**: UI components like `ChatBox`, `Canvas`, and `AISoundWave`.
  - **`components/canvas/`**: Contains the visual components (views) corresponding to the specific tools (e.g., displaying code, conversations, or mermaid diagrams).
- **`src/routes`**: The main SvelteKit application routes (`+page.svelte` serves as the main interface).

## Current Tools
The `GeminiSession` in `src/lib/gemini.ts` currently supports the following tools for visual output:

1.  **`display_sentence_on_canvas`**
    -   **Purpose**: Displays a single sentence with an optional sub-sentence/translation.
    -   **Parameters**: `text` (string), `subsentence` (string, optional).

2.  **`display_conversation_on_canvas`**
    -   **Purpose**: Visualizes a dialogue between two speakers, intended for language learning.
    -   **Parameters**: `lines` (array of objects containing speaker, target language text, phonetic pronunciation, and English translation).

3.  **`display_code_on_canvas`**
    -   **Purpose**: Shows a code snippet with syntax highlighting.
    -   **Parameters**: `code` (string), `language` (string).

4.  **`display_mermaid_diagram_on_canvas`**
    -   **Purpose**: Renders a Mermaid diagram for visualizing flows or structures.
    -   **Parameters**: `graph` (string).

## Adding New Tools
If you need to add a new tool (function call) to the Gemini session, please refer to the **[NEW_TOOL_README.md](./NEW_TOOL_README.md)** file for detailed instructions, best practices, and the required implementation steps.

## Documentation Maintenance
**Important**: Please update this `GEMINI.md` file whenever new features, tools, or major architectural changes are introduced to the project. Keeping this documentation up-to-date is crucial for understanding the project's current state.
