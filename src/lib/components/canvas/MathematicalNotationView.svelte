<script lang="ts">
    import katex from "katex";
    import "katex/dist/katex.min.css";
    import { onMount } from "svelte";

    export let equation: string;
    export let description: string = "";

    let mathContainer: HTMLElement;

    $: if (mathContainer && equation) {
        try {
            katex.render(equation, mathContainer, {
                throwOnError: false,
                displayMode: true,
            });
        } catch (e) {
            console.error("KaTeX rendering error:", e);
            mathContainer.innerText = equation; // Fallback
        }
    }
</script>

<div class="flex flex-col items-center justify-center gap-6 p-6 w-full h-full">
    <div
        bind:this={mathContainer}
        class="text-3xl dark:text-white w-full overflow-x-auto text-center"
    >
        <!-- Math renders here -->
    </div>

    {#if description}
        <div
            class="text-black/80 dark:text-white/80 text-lg font-light text-center leading-relaxed"
        >
            {description}
        </div>
    {/if}
</div>
