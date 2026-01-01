<script lang="ts">
    import { createEventDispatcher, onMount, tick } from "svelte";
    import ChatBox from "$lib/components/ChatBox.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import { GeminiSession } from "$lib/gemini";
    import Canvas from "$lib/components/Canvas.svelte";
    import AISoundWave from "$lib/components/AISoundWave.svelte";
    import {
        sessions,
        currentSessionId,
        chatStore,
        type Message,
    } from "$lib/stores/chat";
    import { settings } from "$lib/stores/settings";

    // DO NOT hardcode the API key here in production!
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

    let session: GeminiSession | null = null;
    let messages: Message[] = [];
    let isSessionActive = false;
    let canvasData: { type: string; content: any } | null = null;

    // Reactive statement to sync messages to the current session store
    $: if ($currentSessionId) {
        // We only want to WRITE to the store when messages change from the UI/transcription
        // But we also need to READ from the store when the session ID changes.
        // This circular dependency needs care.
        // Best approach: "messages" is a local representation.
        // When $currentSessionId changes, we load into "messages".
        // When "handleTranscription" happens, we update "messages" AND the store.
    }

    // React to session ID changes (User selected a chat)
    let previousSessionId: string | null = null;
    $: if ($currentSessionId !== previousSessionId) {
        previousSessionId = $currentSessionId;
        loadSession($currentSessionId);
    }

    async function loadSession(id: string | null) {
        if (!id) {
            messages = [];
            canvasData = null;
            return;
        }

        const sess = chatStore.get(id);
        if (sess) {
            // STOP current session if running
            if (isSessionActive && session) {
                session.stop();
                isSessionActive = false;
            }

            messages = [...sess.messages]; // Copy
            // canvasData = sess.canvasData || null; // Restore canvas if we saved it (not implementing save yet for canvas)
            canvasData = null; // Clear canvas on chat switch for now
        }
    }

    function handleTranscription(text: string, type: "user" | "model") {
        if (!$currentSessionId) return;

        // If the last message is of the same type and not a system message, append to it.
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === type) {
                lastMsg.text += text;
                messages = messages; // Trigger Svelte update
                chatStore.updateSessionMessages($currentSessionId, messages);
                return;
            }
        }

        // New message
        messages = [...messages, { role: type, text }];
        chatStore.updateSessionMessages($currentSessionId, messages);
    }

    function handleInterruption() {
        if (!$currentSessionId) return;
        messages = [...messages, { role: "system", text: "— Interrupted —" }];
        chatStore.updateSessionMessages($currentSessionId, messages);
    }

    async function toggleSession() {
        if (!session) return;

        if (isSessionActive) {
            session.stop();
            isSessionActive = false;
        } else {
            // Ensure we have a current session created if none exists
            if (!$currentSessionId) {
                handleNewChat();
            }

            // Apply settings from store
            session.config.voice = $settings.voice;
            session.config.history = messages;
            // session.config.model = ... (if we had model selection)

            await session.start();
            isSessionActive = true;
        }
    }

    function handleNewChat() {
        chatStore.createNewSession();
        // The reactive block for $currentSessionId will handle loading the empty state
    }

    function onSidebarSelectChat(event: CustomEvent) {
        currentSessionId.set(event.detail.id);
    }

    onMount(() => {
        // Initialize Gemini Session helper
        session = new GeminiSession({
            apiKey: API_KEY,
            systemInstruction:
                "You are a helpful tutor. Be concise. You have access to 4 tools: 'display_sentence_on_canvas', 'display_conversation_on_canvas', 'display_code_on_canvas', and 'display_mermaid_diagram_on_canvas'. Use them when appropriate to visualize your explanation. Defaults to plain text if not specified.",
            voice: $settings.voice,
        });

        session.onTranscription = (text, type) => {
            handleTranscription(text, type);
        };

        session.onInterruption = () => {
            handleInterruption();
        };

        session.onCanvasUpdate = (data) => {
            canvasData = data;
        };

        session.onToolCall = (name, args) => {
            if (!$currentSessionId) return;
            // Append tool call info to the last message if it's from model
            // Or create a new message if needed, but usually tool calls come with text
            // We'll attach it to the key message.
            if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                if (lastMsg.role === "model") {
                    lastMsg.toolCall = { name, args };
                    messages = messages; // update UI
                    chatStore.updateSessionMessages(
                        $currentSessionId,
                        messages,
                    );
                }
            }
        };

        // If no session exists, create one
        if (!$currentSessionId && $sessions.length === 0) {
            chatStore.createNewSession();
        } else if (!$currentSessionId && $sessions.length > 0) {
            // Select the most recent one
            currentSessionId.set($sessions[0].id);
        } else if ($currentSessionId) {
            // Just load it (handled by reactive block)
            loadSession($currentSessionId);
        }

        return () => {
            session?.stop();
        };
    });

    function handleToolReplay(event: CustomEvent) {
        const { name, args } = event.detail;
        if (!name) return;

        let type = "";
        if (name === "display_sentence_on_canvas") type = "sentence";
        else if (name === "display_conversation_on_canvas")
            type = "conversation";
        else if (name === "display_code_on_canvas") type = "code";
        else if (name === "display_mermaid_diagram_on_canvas") type = "mermaid";

        if (type) {
            canvasData = { type, content: args };
        }
    }
</script>

<div
    class="flex h-screen w-full bg-gray-950 font-sans overflow-hidden text-white"
>
    <!-- Sidebar -->
    <Sidebar on:newChat={handleNewChat} on:selectChat={onSidebarSelectChat} />

    <!-- Main Content Area -->
    <div class="flex-1 flex min-w-0">
        <!-- Chat Section (1/3) -->
        <div
            class="w-1/3 h-full flex flex-col relative border-r border-white/5 bg-gray-900"
        >
            <!-- Visualization Top -->
            <div class="h-24 w-full relative z-10 bg-gray-900 shrink-0">
                {#if session}
                    <AISoundWave {session} />
                {/if}
            </div>

            <div class="flex-1 min-h-0 w-full relative">
                <ChatBox {messages} on:toolReplay={handleToolReplay} />
            </div>

            <!-- Controls -->
            <div
                class="p-6 flex justify-center shrink-0 w-full bg-gray-900/95 backdrop-blur z-20 border-t border-white/5"
            >
                <button
                    class="px-6 py-3 rounded-full font-semibold shadow-lg transition-all transform active:scale-95 flex items-center gap-2
                    {isSessionActive
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20'
                        : 'bg-green-600 hover:bg-green-700 shadow-green-900/20'}"
                    on:click={toggleSession}
                >
                    {#if isSessionActive}
                        <span
                            class="w-2 h-2 rounded-full bg-white animate-pulse"
                        ></span>
                    {/if}
                    {isSessionActive
                        ? "Stop Session"
                        : messages.length > 0
                          ? "Resume Session"
                          : "Start Session"}
                </button>
            </div>
        </div>

        <!-- Canvas Section (2/3) -->
        <div
            class="w-2/3 flex items-center justify-center bg-gray-950 relative overflow-hidden"
        >
            <!-- Abstract Background Element -->
            <div
                class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-gray-950 to-gray-950 pointer-events-none"
            ></div>

            <div
                class="relative z-10 flex flex-col items-center gap-4 w-full h-full"
            >
                <Canvas data={canvasData} />
            </div>
        </div>
    </div>
</div>
