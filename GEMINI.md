# Learn By Canvas

## Project Overview
This project is a SvelteKit application called **Learn By Canvas**. It utilizes the **Gemini Multimodal Live API** to create an interactive learning experience. The core interaction model involves the user speaking to Gemini, which then uses various "tools" to display relevant visual content on a canvas.

## Key Technologies
- **SvelteKit**: Frontend framework.
- **shadcn-svelte**: UI component library.
- **Tailwind CSS**: Utility-first CSS framework.
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

5.  **`display_flashcard_deck_srs`**
    -   **Purpose**: Displays a deck of flashcards for spaced repetition practice with flip animation.
    -   **Parameters**: `deckName` (string), `cards` (array of objects with `front`, `back`).

6.  **`display_table`**
    -   **Purpose**: Displays specific information in a tabular format.
    -   **Parameters**: `columns` (array of objects with `header` (string) and `values` (array of strings)).

7.  **`display_location_on_map`**
    -   **Purpose**: Displays an interactive map centered on a specific location with optional markers and shapes (citizens, polygons).
    -   **Parameters**:
        -   `center`: object with `lat`, `lng`
        -   `zoom`: number (optional)
        -   `markers`: array of objects with `lat`, `lng`, `title`, `popupText`
        -   `shapes`: array of objects (optional). Each object supports:
            -   `type`: "circle" or "polygon"
            -   `color`: string (stroke color, optional)
            -   `fillColor`: string (fill color, optional)
            -   `popupText`: string (optional)
            -   For circles: `center` (lat, lng object) and `radius` (number in meters)
            -   For polygons: `points` (array of lat, lng objects)

9.  **`display_mathematical_notation`**
    -   **Purpose**: Displays a mathematical equation using KaTeX.
    -   **Parameters**: `equation` (string, LaTeX format), `description` (string, optional).

10. **`display_smiles`**
    -   **Purpose**: Displays a chemical structure using RDKit.
    -   **Parameters**: `smiles` (string), `description` (string, optional), `substructure` (string, optional - SMILES/SMARTS to highlight).




## Adding New Tools
If you need to add a new tool (function call) to the Gemini session, please refer to the **[NEW_TOOL_README.md](./NEW_TOOL_README.md)** file for detailed instructions, best practices, and the required implementation steps.

## Documentation Maintenance
**Important**: Please update this `GEMINI.md` file whenever new features, tools, or major architectural changes are introduced to the project. Keeping this documentation up-to-date is crucial for understanding the project's current state.
