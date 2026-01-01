<script lang="ts">
    import { onMount } from "svelte";
    import gsap from "gsap";

    export let lines: Array<{
        speaker: string;
        target: string;
        phonetic: string;
        english: string;
    }>;

    let container: HTMLDivElement;
    let speakers: string[] = [];

    // Determine unique speakers to assign sides
    $: {
        const unique = new Set(lines.map((l) => l.speaker));
        speakers = Array.from(unique);
    }

    onMount(() => {
        const ctx = gsap.context(() => {
            gsap.from(".conversation-bubble", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: "power2.out",
            });
        }, container);

        return () => ctx.revert();
    });
</script>

<div bind:this={container} class="w-full max-w-5xl flex flex-col gap-6 p-4">
    {#each lines as line}
        {@const isLeft = speakers.indexOf(line.speaker) % 2 === 0}
        <div
            class="flex flex-col {isLeft ? 'items-start' : 'items-end'} w-full"
        >
            <span class="text-sm text-gray-400 mb-1 px-2">{line.speaker}</span>
            <div
                class="conversation-bubble relative max-w-[80%] p-4
                {isLeft ? 'text-left' : 'text-right'}"
            >
                <p
                    class="text-4xl font-bold mb-2 leading-relaxed {isLeft
                        ? 'text-blue-400'
                        : 'text-white'}"
                >
                    {line.target}
                </p>
                <div
                    class="flex flex-col gap-1 {isLeft
                        ? 'items-start'
                        : 'items-end'}"
                >
                    <p class="text-lg text-gray-400 font-mono">
                        {line.phonetic}
                    </p>
                    <p class="text-base text-gray-500 italic">{line.english}</p>
                </div>
            </div>
        </div>
    {/each}
</div>
