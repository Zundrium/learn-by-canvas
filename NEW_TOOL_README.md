# Adding a New Tool to Learn By Canvas

This guide outlines the best practices and steps required to add a new tool method to the Gemini Live session in the **Learn By Canvas** application.

## Overview

Tools allow the AI model to interact with the application interface, such as displaying content on the canvas. Adding a new tool involves three main steps:
1.  **Define the Tool Interface**: Tell Gemini what the tool does and what arguments it expects.
2.  **Handle the Tool Logic**: Implement the specialized behavior when Gemini calls the tool.
3.  **Update the UI**: Ensure the frontend reacts appropriately to the tool's output.

---

## Step 1: Define the Tool Interface

Tools are defined in `src/lib/gemini.ts`. You must look for the `sendSetup()` method and add your new tool definition to the `functionDeclarations` array inside the setup payload.

### Best Practices:
*   **Descriptive Name**: Use a clear, action-oriented name (e.g., `display_table_on_canvas`).
*   **Clear Description**: Explain *what* the tool does and *when* it should be used.
*   **Strict Schema**: Define parameters precisely. The AI relies on this schema to generate valid JSON.

### Example:
```typescript
{
    name: "display_my_new_widget",
    description: "Displays a custom widget for visualizing [X].",
    parameters: {
        type: "OBJECT",
        properties: {
            title: {
                type: "STRING",
                description: "The title of the widget."
            },
            data_points: {
                type: "ARRAY",
                items: { type: "NUMBER" },
                description: "List of data points to visualize."
            }
        },
        required: ["title", "data_points"]
    }
}
```

---

## Step 2: Handle the Tool Logic

In `src/lib/gemini.ts`, the `handleToolCall` method processes incoming requests from the AI.

1.  **Add a Case**: Add a new `else if` block for your tool name.
2.  **Trigger Update**: Call the `this.onCanvasUpdate` callback with a unique `type` and the `content` (arguments).
3.  **Log Warning**: Ensure unknown tools trigger a warning (handled by the final `else` block).

```typescript
// Inside handleToolCall(toolCall)
const functionCalls = toolCall.functionCalls;
for (const call of functionCalls) {
    if (call.name === "display_sentence_on_canvas") {
        this.onCanvasUpdate({ type: 'sentence', content: call.args });
    } 
    // ... other existing tools ...
    
    // ADD YOUR NEW TOOL HERE:
    else if (call.name === "display_my_new_widget") {
        this.onCanvasUpdate({ type: 'my_widget', content: call.args });
    }
}
```

> **Note**: The `handleToolCall` method automatically sends a "success" response back to Gemini to keep the conversation flowing. You generally don't need to return data *to* the model for successful canvas updates.

---

## Step 3: Update the UI

The frontend listens for updates in `src/routes/+page.svelte`.

1.  **Receive Data**: The `onCanvasUpdate` callback in `+page.svelte` updates the reactive `canvasData` variable.
2.  **Create Component**: Create your new Svelte component in `src/lib/components/canvas/` (e.g., `MyWidget.svelte`).
3.  **Update Canvas**: Import your specific component in `src/lib/components/Canvas.svelte` and add a conditional block to render it.

In `src/lib/components/Canvas.svelte`:

```svelte
<script>
    import MyWidget from "$lib/components/canvas/MyWidget.svelte";
    // ...
</script>

<!-- ... inside the main block ... -->
{#if data.type === "sentence"}
    <SentenceView ... />
{:else if data.type === "conversation"}
    <ConversationView ... />
{:else if data.type === "code"}
    <CodeView ... />
{:else if data.type === "mermaid"}
    <MermaidDiagramView ... />
{:else if data.type === "my_widget"}
    <!-- Pass specific properties from data.content to your component -->
    <MyWidget title={data.content.title} dataPoints={data.content.data_points} />
{/if}
```

---

## Step 4: Enable Tool Replay

The chat interface allows users to "replay" a tool call by clicking on an indicator in the chat history. To make this work for your new tool, you must update the mapping in `src/routes/+page.svelte`.

1.  Find the `handleToolReplay` function in `src/routes/+page.svelte`.
2.  Add a mapping from your *tool definition name* to your *canvas type*.

```typescript
function handleToolReplay(event: CustomEvent) {
    const { name, args } = event.detail;
    if (!name) return;

    let type = "";
    if (name === "display_sentence_on_canvas") type = "sentence";
    else if (name === "display_conversation_on_canvas") type = "conversation";
    else if (name === "display_code_on_canvas") type = "code";
    else if (name === "display_mermaid_diagram_on_canvas") type = "mermaid";
    
    // ADD YOUR NEW TOOL HERE
    else if (name === "display_my_new_widget") type = "my_widget"; 

    if (type) {
        canvasData = { type, content: args };
    }
}
```

---

## Step 5: Update System Instructions

The `GeminiSession` is initialized in `src/routes/+page.svelte` with a `systemInstruction` string. This string often explicitly lists the tools available to the model to encourage their use.

1.  Locate the `onMount` block in `src/routes/+page.svelte`.
2.  Update the `systemInstruction` string to include your new tool name.

```typescript
session = new GeminiSession({
    apiKey: API_KEY,
    // Update the tool count (e.g., "5 tools") and add your tool name to the list
    systemInstruction: "You are a helpful tutor... You have access to 5 tools: ..., 'display_my_new_widget'. Use them when...",
    // ...
});
```

---

## History Management

The application maintains a conversation history to provide context to the AI across sessions or page reloads.

*   **Structure**: History is an array of message objects: `{ role: 'user' | 'model' | 'system', text: string }`.
*   **Storage**: Messages are stored in a Svelte store (`chatStore` in `$lib/stores/chat`) and persisted to `localStorage`.
*   **Injection**: When a session starts, `src/routes/+page.svelte` passes the current history to `GeminiSession`.
*   **Context**: Inside `GeminiSession.ts`, the `buildSystemInstruction()` method appends specific previous messages to the system prompt so the model "remembers" what happened.

### Best Practice for Tools in History
When a tool is called, the system effectively "acts" on it. While the *result* (visuals) isn't strictly text history, the *intent* (the tool call itself) is preserved in the model's memory during the active session. If you need persistent memory of *what was drawn*, you might consider summarizing tool actions into the chat history as system messages (e.g., *"[System: User is now viewing a table of data]"*).

---

## Summary Checklist

- [ ] **Define** tool in `sendSetup()` function declarations (`gemini.ts`).
- [ ] **Handle** tool name in `handleToolCall()` (`gemini.ts`).
- [ ] **Create** new UI component (e.g. `src/lib/components/canvas/MyWidget.svelte`).
- [ ] **Import & Render** component in `Canvas.svelte`.
- [ ] **Update** `handleToolReplay` logic in `src/routes/+page.svelte`.
- [ ] **Update** `systemInstruction` in `src/routes/+page.svelte` to mention the new tool.
- [ ] **Test** with a prompt that specifically targets your tool description.
