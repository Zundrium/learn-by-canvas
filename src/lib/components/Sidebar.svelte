<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { sessions, currentSessionId, chatStore } from "$lib/stores/chat";
    import { slide } from "svelte/transition";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Separator } from "$lib/components/ui/separator";
    import { cn } from "$lib/utils";
    import {
        PanelLeft,
        PanelLeftClose,
        Plus,
        MessageSquare,
        Edit2,
        Trash2,
        Settings,
    } from "@lucide/svelte";

    const dispatch = createEventDispatcher();

    let isExpanded = false; // Start collapsed by default as per typical mobile-first or unintrusive designs, or match previous default (false)
    let editingSessionId: string | null = null;

    // Formatting helper for date
    function formatDate(timestamp: number) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 3600 * 24),
        );

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return "Previous 7 Days";
        return "Older";
    }

    // Filter and Group sessions by date
    $: groupedSessions = $sessions
        .filter(
            (session) =>
                session.messages.length > 0 || session.id === $currentSessionId,
        )
        .reduce(
            (groups, session) => {
                const key = formatDate(session.lastModified);
                if (!groups[key]) groups[key] = [];
                groups[key].push(session);
                return groups;
            },
            {} as Record<string, typeof $sessions>,
        );

    // Order keys
    const timeKeys = ["Today", "Yesterday", "Previous 7 Days", "Older"];

    function toggleSidebar() {
        isExpanded = !isExpanded;
    }

    function createNewChat() {
        dispatch("newChat");
    }

    function selectChat(id: string) {
        dispatch("selectChat", { id });
    }

    function deleteChat(id: string, e: Event) {
        e.stopPropagation();
        chatStore.deleteSession(id);
    }

    function startEditing(id: string, e: Event) {
        e.stopPropagation();
        editingSessionId = id;
    }

    function saveTitle(id: string, newTitle: string) {
        if (newTitle.trim()) {
            chatStore.updateSessionTitle(id, newTitle.trim());
        }
        editingSessionId = null;
    }

    function handleKeydown(e: KeyboardEvent, id: string, title: string) {
        if (e.key === "Enter") {
            saveTitle(id, title);
        } else if (e.key === "Escape") {
            editingSessionId = null;
        }
    }
</script>

<div
    class={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300 ease-in-out relative z-30",
        isExpanded ? "w-64" : "w-16",
    )}
>
    <!-- Header / Toggle -->
    <div class="p-4 flex items-center justify-start h-16 shrink-0">
        <Button
            variant="ghost"
            size="icon"
            onclick={toggleSidebar}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
            {#if isExpanded}
                <PanelLeftClose class="w-5 h-5" />
            {:else}
                <PanelLeft class="w-5 h-5" />
            {/if}
        </Button>
    </div>

    <!-- New Chat Button -->
    <div class="px-3 pb-4 shrink-0">
        <Button
            variant={isExpanded ? "default" : "ghost"}
            size={isExpanded ? "default" : "icon"}
            class={cn(
                "w-full justify-start gap-2 overflow-hidden",
                !isExpanded && "justify-center",
            )}
            onclick={createNewChat}
            title="New Chat"
        >
            <Plus class="w-5 h-5 shrink-0" />
            {#if isExpanded}
                <span transition:slide={{ axis: "x", duration: 200 }}
                    >New chat</span
                >
            {/if}
        </Button>
    </div>

    <Separator />

    <!-- Scrollable History -->
    <div class="flex-1 overflow-y-auto min-h-0 py-4 space-y-6">
        {#if $sessions.length === 0 && isExpanded}
            <div class="text-muted-foreground text-xs text-center py-4">
                No recent chats
            </div>
        {/if}

        {#each timeKeys as key}
            {#if groupedSessions[key] && groupedSessions[key].length > 0}
                <div class="space-y-1">
                    {#if isExpanded}
                        <div
                            class="text-xs font-semibold text-muted-foreground px-4 py-2"
                        >
                            {key}
                        </div>
                    {/if}

                    {#each groupedSessions[key] as session}
                        <div class="group relative px-2">
                            {#if editingSessionId === session.id && isExpanded}
                                <div class="px-1 py-1">
                                    <Input
                                        value={session.title}
                                        class="h-8 text-sm"
                                        autofocus
                                        onclick={(e) => e.stopPropagation()}
                                        onblur={(e) =>
                                            saveTitle(
                                                session.id,
                                                e.currentTarget.value,
                                            )}
                                        onkeydown={(e) =>
                                            handleKeydown(
                                                e,
                                                session.id,
                                                e.currentTarget.value,
                                            )}
                                    />
                                </div>
                            {:else}
                                <Button
                                    variant={$currentSessionId === session.id
                                        ? "secondary"
                                        : "ghost"}
                                    class={cn(
                                        "w-full justify-start h-9 px-2 gap-3 relative",
                                        !isExpanded && "justify-center px-0",
                                    )}
                                    onclick={() => selectChat(session.id)}
                                    title={session.title}
                                >
                                    <MessageSquare
                                        class="w-4 h-4 shrink-0 opacity-70"
                                    />
                                    {#if isExpanded}
                                        <span
                                            class="truncate pr-8 text-sm font-normal"
                                            transition:slide={{
                                                axis: "x",
                                                duration: 200,
                                            }}
                                        >
                                            {session.title}
                                        </span>
                                    {/if}
                                </Button>

                                <!-- Action Buttons -->
                                {#if isExpanded}
                                    <div
                                        class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-md"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-6 w-6 text-muted-foreground hover:text-foreground"
                                            onclick={(e) =>
                                                startEditing(session.id, e)}
                                            title="Rename"
                                        >
                                            <Edit2 class="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onclick={(e) =>
                                                deleteChat(session.id, e)}
                                            title="Delete"
                                        >
                                            <Trash2 class="w-3 h-3" />
                                        </Button>
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        {/each}
    </div>

    <Separator />

    <!-- Settings Footer -->
    <div class="p-3 shrink-0">
        <Button
            variant="ghost"
            class={cn(
                "w-full justify-start gap-3 h-12",
                !isExpanded && "justify-center",
            )}
            onclick={() => dispatch("openSettings")}
            title="Settings"
        >
            <Settings class="w-5 h-5 shrink-0" />
            {#if isExpanded}
                <span transition:slide={{ axis: "x", duration: 200 }}
                    >Settings</span
                >
            {/if}
        </Button>
    </div>
</div>
