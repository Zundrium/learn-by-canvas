<script lang="ts">
    import mermaid from "mermaid";
    import { onMount, afterUpdate } from "svelte";
    import { fade } from "svelte/transition";

    export let graph: string = "";

    let container: HTMLDivElement;
    let renderId = 0;

    async function renderDiagram() {
        if (!container || !graph) return;

        try {
            renderId++;
            const currentRenderId = renderId;
            // Clear previous content slightly differently to avoid conflicts
            container.innerHTML = `<div class="mermaid" id="mermaid-${currentRenderId}">${graph}</div>`;

            // Wait for DOM to update
            await new Promise((r) => setTimeout(r, 0));

            await mermaid.run({
                nodes: [
                    container.querySelector(
                        `#mermaid-${currentRenderId}`,
                    ) as HTMLElement,
                ],
            });
        } catch (error) {
            console.error("Mermaid render error:", error);
            if (container) {
                container.innerHTML = `<div class="text-red-400 p-4 rounded bg-red-900/10">
                    <p class="font-bold mb-2">Failed to render diagram</p>
                    <pre class="text-xs overflow-auto">${error}</pre>
                </div>`;
            }
        }
    }

    onMount(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
        });
        renderDiagram();
    });

    // Re-render when graph changes
    $: if (graph) {
        renderDiagram();
    }
</script>

<div
    class="w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden"
>
    <div
        bind:this={container}
        in:fade
        class="w-full h-full flex items-center justify-center p-4"
    >
        <!-- Diagram will be injected here -->
    </div>
</div>

<style>
    :global(.mermaid) {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :global(.mermaid svg) {
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
    }
</style>
