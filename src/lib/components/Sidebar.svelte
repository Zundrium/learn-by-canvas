<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { sessions, currentSessionId, chatStore } from "$lib/stores/chat";
    import { slide } from "svelte/transition";

    const dispatch = createEventDispatcher();

    let isExpanded = false;
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

<!-- Sidebar Container -->
<div
    class="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-white/5 transition-all duration-300 ease-in-out relative z-30
    {isExpanded ? 'w-64' : 'w-16'}"
>
    <!-- Header / Toggle -->
    <div class="p-4 flex items-center justify-start h-16 shrink-0">
        <button
            on:click={toggleSidebar}
            class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Toggle sidebar"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><line x1="3" y1="12" x2="21" y2="12"></line><line
                    x1="3"
                    y1="6"
                    x2="21"
                    y2="6"
                ></line><line x1="3" y1="18" x2="21" y2="18"></line></svg
            >
        </button>
    </div>

    <!-- New Chat Button -->
    <div class="px-3 pb-4 shrink-0">
        <button
            on:click={createNewChat}
            class="w-full h-10 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all flex items-center px-3 gap-3 overflow-hidden border border-gray-200 dark:border-white/5 shadow-sm"
        >
            <div class="text-gray-400 dark:text-gray-400 shrink-0">
                <!-- Plus Icon -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><line x1="12" y1="5" x2="12" y2="19"></line><line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                    ></line></svg
                >
            </div>
            {#if isExpanded}
                <span
                    class="whitespace-nowrap font-medium text-sm"
                    transition:slide={{ axis: "x", duration: 200 }}
                    >New chat</span
                >
            {/if}
        </button>
    </div>

    <!-- Scrollable History -->
    <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-3 space-y-6">
        {#if $sessions.length === 0}
            {#if isExpanded}
                <div class="text-gray-500 text-xs text-center py-4">
                    No recent chats
                </div>
            {/if}
        {/if}

        {#each timeKeys as key}
            {#if groupedSessions[key] && groupedSessions[key].length > 0}
                <div class="space-y-1">
                    {#if isExpanded}
                        <div
                            class="text-xs font-semibold text-gray-500 px-3 py-2"
                        >
                            {key}
                        </div>
                    {/if}

                    {#each groupedSessions[key] as session}
                        <div class="group relative">
                            {#if editingSessionId === session.id && isExpanded}
                                <div class="px-3 py-2">
                                    <input
                                        type="text"
                                        value={session.title}
                                        class="w-full bg-white dark:bg-gray-800 border border-blue-500 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none"
                                        autofocus
                                        on:click|stopPropagation
                                        on:blur={(e) =>
                                            saveTitle(
                                                session.id,
                                                e.currentTarget.value,
                                            )}
                                        on:keydown={(e) =>
                                            handleKeydown(
                                                e,
                                                session.id,
                                                e.currentTarget.value,
                                            )}
                                    />
                                </div>
                            {:else}
                                <button
                                    on:click={() => selectChat(session.id)}
                                    class="w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm text-left transition-colors relative
                                    {$currentSessionId === session.id
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 font-medium'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}"
                                >
                                    <div class="shrink-0">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            class="opacity-70"
                                            ><path
                                                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                            ></path></svg
                                        >
                                    </div>
                                    {#if isExpanded}
                                        <span class="truncate pr-16"
                                            >{session.title}</span
                                        >
                                    {/if}
                                </button>

                                <!-- Action Buttons (only visible on hover and if expanded) -->
                                {#if isExpanded}
                                    <div
                                        class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <!-- Edit Button -->
                                        <button
                                            on:click={(e) =>
                                                startEditing(session.id, e)}
                                            class="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-white/10"
                                            title="Rename chat"
                                            aria-label="Rename chat"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                ><path
                                                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                                ></path><path
                                                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                                ></path></svg
                                            >
                                        </button>
                                        <!-- Delete Button -->
                                        <button
                                            on:click={(e) =>
                                                deleteChat(session.id, e)}
                                            class="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-white/10"
                                            title="Delete chat"
                                            aria-label="Delete chat"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                ><polyline points="3 6 5 6 21 6"
                                                ></polyline><path
                                                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                                                ></path></svg
                                            >
                                        </button>
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        {/each}
    </div>

    <!-- Settings Footer -->
    <div class="p-3 shrink-0 border-t border-gray-200 dark:border-white/5">
        <button
            on:click={() => dispatch("openSettings")}
            class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 transition-colors"
        >
            <div class="shrink-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><circle cx="12" cy="12" r="3"></circle><path
                        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                    ></path></svg
                >
            </div>
            {#if isExpanded}
                <span
                    class="text-sm font-medium"
                    transition:slide={{ axis: "x", duration: 200 }}
                    >Settings</span
                >
            {/if}
        </button>
    </div>
</div>
