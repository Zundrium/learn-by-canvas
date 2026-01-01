<script lang="ts">
    import { onMount } from "svelte";
    import gsap from "gsap";

    export let code: string;
    export let language: string = "";

    let container: HTMLDivElement;

    onMount(() => {
        const ctx = gsap.context(() => {
            gsap.from(container, {
                scale: 0.95,
                opacity: 0,
                duration: 0.8,
                ease: "power4.out",
            });
            gsap.from("pre", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out",
            });
        }, container);

        return () => ctx.revert();
    });
</script>

<div
    bind:this={container}
    class="w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden transform transition-transform"
>
    {#if language}
        <div
            class="bg-gray-800/80 backdrop-blur px-6 py-3 text-sm font-mono text-blue-300 uppercase tracking-[0.2em] font-bold"
        >
            {language}
        </div>
    {/if}
    <pre
        class="p-8 overflow-x-auto text-lg font-mono text-gray-200 leading-relaxed whitespace-pre-wrap tracking-tight"><code
            >{code}</code
        ></pre>
</div>
