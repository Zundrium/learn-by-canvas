<script lang="ts">
    import { onMount } from "svelte";
    import gsap from "gsap";
    export let text: string;
    export let subsentence: string = "";

    let h1: HTMLHeadingElement;
    let p: HTMLParagraphElement;

    onMount(() => {
        const tl = gsap.timeline();

        tl.from(h1, {
            scale: 0.9,
            opacity: 0,
            duration: 1,
            ease: "expo.out",
        });

        if (subsentence && p) {
            tl.from(
                p,
                {
                    y: 10,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                },
                "-=0.6",
            );
        }
    });
</script>

<div class="text-center px-8 flex flex-col items-center gap-6">
    <h1
        bind:this={h1}
        class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 leading-tight drop-shadow-2xl tracking-tight"
    >
        {text}
    </h1>
    {#if subsentence}
        <p
            bind:this={p}
            class="text-3xl text-gray-400 font-light tracking-wider"
        >
            {subsentence}
        </p>
    {/if}
</div>
