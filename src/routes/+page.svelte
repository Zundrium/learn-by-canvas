<script lang="ts">
    import { onMount } from "svelte";
    import ChatBox from "$lib/components/ChatBox.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import { GeminiSession } from "$lib/gemini";
    import Canvas from "$lib/components/Canvas.svelte";
    import AISoundWave from "$lib/components/AISoundWave.svelte";
    import SettingsDialog from "$lib/components/SettingsDialog.svelte";
    import {
        sessions,
        currentSessionId,
        chatStore,
        type Message,
    } from "$lib/stores/chat";
    import { settings } from "$lib/stores/settings";
    import { Button } from "$lib/components/ui/button";
    import { Loader2, Mic } from "@lucide/svelte";
    import { cn } from "$lib/utils";

    // DO NOT hardcode the API key here in production!
    // API Key is now in settings

    let session: GeminiSession | null = null;
    let messages: Message[] = [];
    let isSessionActive = false;
    let canvasData: { type: string; content: any } | null = null;
    let showSettings = false;

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
            session.config.apiKey = $settings.apiKey;
            session.config.voice = $settings.voice;
            session.config.history = messages;
            // session.config.model = ... (if we had model selection)

            if (!session.config.apiKey) {
                showSettings = true;
                return;
            }

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
            apiKey: $settings.apiKey,
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
        else if (name === "display_flashcard_deck_srs") type = "flashcards";
        else if (name === "display_table") type = "table";
        else if (name === "display_location_on_map") type = "map";
        else if (name === "display_mathematical_notation")
            type = "mathematical_notation";
        else if (name === "display_smiles") type = "smiles";

        if (type) {
            canvasData = { type, content: args };
        }
    }
</script>

<div
    class="flex h-screen w-full bg-background font-sans overflow-hidden text-foreground"
>
    <!-- Sidebar -->
    <Sidebar
        on:newChat={handleNewChat}
        on:selectChat={onSidebarSelectChat}
        on:openSettings={() => (showSettings = true)}
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex min-w-0">
        <!-- Chat Section -->
        <div
            class="w-full md:w-[450px] lg:w-[500px] xl:w-[600px] h-full flex flex-col relative border-r bg-background shrink-0"
        >
            <!-- Visualization Top -->
            <div class="h-24 w-full relative z-10 bg-background shrink-0">
                {#if session}
                    <AISoundWave {session} />
                {/if}
            </div>

            <div class="flex-1 min-h-0 w-full relative">
                <ChatBox {messages} on:toolReplay={handleToolReplay} />
            </div>

            <!-- Controls -->
            <div
                class="flex justify-center shrink-0 w-full bg-background/95 backdrop-blur z-20 border-t p-4 pb-6"
            >
                <Button
                    size="lg"
                    variant={isSessionActive
                        ? "destructive"
                        : !$settings.apiKey
                          ? "secondary"
                          : "default"}
                    class={cn(
                        "w-full h-14 text-lg font-semibold uppercase tracking-wide shadow-lg transition-all",
                        isSessionActive && "animate-pulse", // Subtle pulse when active
                    )}
                    onclick={toggleSession}
                >
                    {#if isSessionActive}
                        <Loader2 class="w-5 h-5 mr-3 animate-spin" />
                        Stop Session
                    {:else if !$settings.apiKey}
                        Set API Key to Start
                    {:else if messages.length > 0}
                        <Mic class="w-5 h-5 mr-3" />
                        Resume Session
                    {:else}
                        <Mic class="w-5 h-5 mr-3" />
                        Start Session
                    {/if}
                </Button>
            </div>
        </div>

        <!-- Canvas Section -->
        <div
            class="flex-1 hidden md:flex items-center justify-center bg-muted/20 relative overflow-hidden"
        >
            <!-- Abstract Background Element -->
            <div
                class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/50 via-background to-background pointer-events-none"
            ></div>

            <div
                class="relative z-10 flex flex-col items-center gap-4 w-full h-full"
            >
                <Canvas data={canvasData} />
            </div>
        </div>
    </div>
</div>

<SettingsDialog isOpen={showSettings} onClose={() => (showSettings = false)} />
