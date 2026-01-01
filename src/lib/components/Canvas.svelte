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
            class="flex flex-col items-center justify-center gap-6 opacity-30 select-none pointer-events-auto"
        >
            <img
                src="/logo.png"
                alt="Learn By Canvas Logo"
                class="w-32 h-32 object-contain"
            />
            <div
                class="text-4xl font-black tracking-widest text-white uppercase text-center"
            >
                Learn By Canvas
            </div>
            <a
                href="https://github.com/Zundrium/learn-by-canvas"
                target="_blank"
                class="text-white/50 hover:text-white transition-colors text-sm tracking-widest uppercase border-b border-transparent hover:border-white"
            >
                github.com/Zundrium/learn-by-canvas
            </a>
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
