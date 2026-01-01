<script lang="ts">
    import { fade } from "svelte/transition";
    import SentenceView from "$lib/components/canvas/SentenceView.svelte";
    import ConversationView from "$lib/components/canvas/ConversationView.svelte";
    import CodeView from "$lib/components/canvas/CodeView.svelte";

    import MermaidDiagramView from "$lib/components/canvas/MermaidDiagramView.svelte";

    export let data: { type: string; content: any } | null = null;
</script>

<div class="w-full h-full p-8 overflow-auto flex items-center justify-center">
    {#if !data}
        <div
            in:fade
            class="text-8xl font-black tracking-[0.2em] text-gray-800/50 select-none drop-shadow-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
            CANVAS
        </div>
    {:else if data.type === "sentence"}
        <SentenceView
            text={data.content.text}
            subsentence={data.content.subsentence}
        />
    {:else if data.type === "conversation"}
        <ConversationView lines={data.content.lines} />
    {:else if data.type === "code"}
        <CodeView code={data.content.code} language={data.content.language} />
    {:else if data.type === "mermaid"}
        <MermaidDiagramView graph={data.content.graph} />
    {/if}
</div>
