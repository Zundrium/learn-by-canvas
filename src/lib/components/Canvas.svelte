<script lang="ts">
    import { fade } from "svelte/transition";
    import SentenceView from "$lib/components/canvas/SentenceView.svelte";
    import ConversationView from "$lib/components/canvas/ConversationView.svelte";
    import CodeView from "$lib/components/canvas/CodeView.svelte";
    import MermaidDiagramView from "$lib/components/canvas/MermaidDiagramView.svelte";
    import FlashcardDeck from "$lib/components/canvas/FlashcardDeck.svelte";
    import TableView from "$lib/components/canvas/TableView.svelte";
    import MapView from "$lib/components/canvas/MapView.svelte";
    import MathematicalNotationView from "$lib/components/canvas/MathematicalNotationView.svelte";
    import RDKitSmilesView from "$lib/components/canvas/RDKitSmilesView.svelte";

    export let data: { type: string; content: any } | null = null;
</script>

<div
    class="w-full h-full p-8 overflow-auto flex items-center justify-center bg-muted/30"
>
    {#if !data}
        <div
            in:fade
            class="flex flex-col items-center justify-center gap-6 opacity-30 select-none pointer-events-auto"
        >
            <img
                src="/logo.png"
                alt="Learn By Canvas Logo"
                class="w-32 h-32 object-contain grayscale invert dark:invert-0"
            />
            <div
                class="text-4xl font-black tracking-widest text-foreground uppercase text-center"
            >
                Learn By Canvas
            </div>
            <a
                href="https://github.com/Zundrium/learn-by-canvas"
                target="_blank"
                class="text-muted-foreground hover:text-foreground transition-colors text-sm tracking-widest uppercase border-b border-transparent hover:border-foreground"
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
    {:else if data.type === "flashcards"}
        <FlashcardDeck
            deckName={data.content.deckName}
            cards={data.content.cards}
        />
    {:else if data.type === "table"}
        {#key data.content}
            <TableView columns={data.content.columns} />
        {/key}
    {:else if data.type === "map"}
        <MapView content={data.content} />
    {:else if data.type === "mathematical_notation"}
        <MathematicalNotationView
            equation={data.content.equation}
            description={data.content.description}
        />
    {:else if data.type === "smiles"}
        <RDKitSmilesView
            smiles={data.content.smiles}
            description={data.content.description}
            substructure={data.content.substructure}
        />
    {/if}
</div>
