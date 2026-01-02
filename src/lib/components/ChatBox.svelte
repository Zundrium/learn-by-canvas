<script lang="ts">
    import { afterUpdate, createEventDispatcher } from "svelte";
    import gsap from "gsap";

    const dispatch = createEventDispatcher();

    export let messages: Array<{
        role: "user" | "model" | "system";
        text: string;
        toolCall?: {
            name: string;
            args: any;
        };
    }> = [];

    let scrollContainer: HTMLDivElement;

    afterUpdate(() => {
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    });

    function slideIn(node: Element) {
        gsap.from(node, {
            y: 20,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
        });
    }

    function animateWord(node: Element) {
        gsap.from(node, {
            opacity: 0,
            y: 5,
            duration: 0.3,
            ease: "power1.out",
        });
    }
</script>

<div class="flex flex-col h-full w-full bg-white dark:bg-gray-900">
    <!-- Messages Area -->
    <div
        class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        bind:this={scrollContainer}
    >
        {#each messages as msg}
            <div
                use:slideIn
                class="flex w-full gap-2 md:gap-4 xl:gap-6 {msg.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'}"
            >
                {#if msg.role === "model"}
                    <div
                        class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400 shrink-0"
                    >
                        AI
                    </div>
                {/if}

                <div
                    class="max-w-[80%] text-base leading-relaxed flex flex-col gap-2 {msg.role ===
                    'user'
                        ? 'items-end'
                        : 'items-start'}"
                >
                    <div
                        class={msg.role === "user"
                            ? "text-gray-900 dark:text-white"
                            : msg.role === "system"
                              ? "text-gray-500 dark:text-gray-600 italic text-center w-full max-w-[90%]"
                              : "text-blue-700 dark:text-blue-400"}
                    >
                        {#if msg.role === "system"}
                            <div class="flex items-center justify-center gap-2">
                                <span>{msg.text}</span>
                            </div>
                        {:else}
                            {#each msg.text.split(/(\s+)/) as word, i (i)}
                                <span
                                    use:animateWord
                                    class="inline-block whitespace-pre-wrap"
                                    >{word}</span
                                >
                            {/each}
                        {/if}
                    </div>

                    <!-- Tool Call Indicator -->
                    {#if msg.toolCall}
                        <button
                            class="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors group cursor-pointer"
                            on:click={() =>
                                dispatch("toolReplay", msg.toolCall)}
                            title="Click to show on canvas"
                        >
                            <div
                                class="w-2 h-2 rounded-full bg-red-500 animate-pulse group-hover:scale-110 transition-transform"
                            ></div>
                            <span class="opacity-70 group-hover:opacity-100"
                                >Updated Canvas</span
                            >
                        </button>
                    {/if}
                </div>

                {#if msg.role === "user"}
                    <div
                        class="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0"
                    >
                        U
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>
