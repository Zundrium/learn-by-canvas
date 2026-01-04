<script lang="ts">
    import { afterUpdate, createEventDispatcher } from "svelte";
    import gsap from "gsap";
    import { cn } from "$lib/utils";
    import { Button } from "$lib/components/ui/button";

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

<div class="flex flex-col h-full w-full bg-background">
    <!-- Messages Area -->
    <div
        class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        bind:this={scrollContainer}
    >
        {#each messages as msg}
            <div
                use:slideIn
                class={cn(
                    "flex w-full gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                )}
            >
                {#if msg.role === "model"}
                    <div
                        class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0"
                    >
                        AI
                    </div>
                {/if}

                <div
                    class={cn(
                        "flex flex-col gap-2 max-w-[80%]",
                        msg.role === "system" &&
                            "w-full max-w-none items-center",
                        msg.role === "user" && "items-end",
                    )}
                >
                    <div
                        class={cn(
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                            msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : msg.role === "system"
                                  ? "bg-transparent text-muted-foreground italic text-center text-xs shadow-none"
                                  : "bg-muted text-foreground rounded-bl-sm",
                        )}
                    >
                        {#if msg.role === "system"}
                            <span>{msg.text}</span>
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

                    <!-- Tool Call Indicator (as a small chip/button below) -->
                    {#if msg.toolCall}
                        <Button
                            variant="ghost"
                            size="sm"
                            class="h-6 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-2"
                            onclick={() => dispatch("toolReplay", msg.toolCall)}
                        >
                            <span
                                class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
                            ></span>
                            Show Output
                        </Button>
                    {/if}
                </div>

                {#if msg.role === "user"}
                    <div
                        class="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0"
                    >
                        U
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>
