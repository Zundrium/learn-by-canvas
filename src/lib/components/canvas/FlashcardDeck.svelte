<script lang="ts">
    import { fade } from "svelte/transition";
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { ChevronLeft, ChevronRight, RotateCw } from "@lucide/svelte";
    import { cn } from "$lib/utils";

    export let deckName: string = "Flashcards";
    export let cards: Array<{
        front: string;
        back: string;
    }> = [];

    let currentIndex = 0;
    let isFlipped = false;

    function nextCard() {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
            isFlipped = false;
        }
    }

    function prevCard() {
        if (currentIndex > 0) {
            currentIndex--;
            isFlipped = false;
        }
    }

    function flipCard() {
        isFlipped = !isFlipped;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "ArrowRight") nextCard();
        if (event.key === "ArrowLeft") prevCard();
        if (event.code === "Space" || event.key === "Enter") {
            event.preventDefault(); // Prevent scrolling
            flipCard();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div
    class="flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto gap-8"
>
    <!-- Header -->
    <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold text-foreground">
            {deckName}
        </h2>
        <div class="text-sm text-muted-foreground font-mono">
            Card {currentIndex + 1} of {cards.length}
        </div>
    </div>

    <!-- Card Container -->
    <div class="relative w-full aspect-[3/2] perspective">
        <!-- The Card -->
        <button
            class="w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer outline-none focus-visible:ring-4 ring-primary/30 rounded-xl"
            class:rotate-y-180={isFlipped}
            on:click={flipCard}
        >
            <!-- Front -->
            <Card
                class="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 text-center"
            >
                <div class="text-3xl font-medium text-foreground">
                    {cards[currentIndex]?.front}
                </div>
                <div
                    class="absolute bottom-4 text-xs uppercase tracking-widest text-muted-foreground"
                >
                    Front
                </div>
            </Card>

            <!-- Back -->
            <Card
                class="absolute inset-0 backface-hidden rotate-y-180 w-full h-full flex flex-col items-center justify-center p-8 text-center bg-secondary"
            >
                <div class="text-2xl text-foreground">
                    {cards[currentIndex]?.back}
                </div>
                <div
                    class="absolute bottom-4 text-xs uppercase tracking-widest text-secondary-foreground/70"
                >
                    Back
                </div>
            </Card>
        </button>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-4">
        <Button
            variant="outline"
            size="icon"
            onclick={prevCard}
            disabled={currentIndex === 0}
            class="rounded-full h-12 w-12"
        >
            <ChevronLeft class="w-6 h-6" />
        </Button>

        <Button
            variant="default"
            size="lg"
            onclick={flipCard}
            class="rounded-full px-8 gap-2"
        >
            <RotateCw class="w-4 h-4" />
            Flip
        </Button>

        <Button
            variant="outline"
            size="icon"
            onclick={nextCard}
            disabled={currentIndex === cards.length - 1}
            class="rounded-full h-12 w-12"
        >
            <ChevronRight class="w-6 h-6" />
        </Button>
    </div>
</div>

<style>
    .perspective {
        perspective: 1000px;
    }
    .preserve-3d {
        transform-style: preserve-3d;
    }
    :global(.backface-hidden) {
        backface-visibility: hidden;
    }
    .rotate-y-180 {
        transform: rotateY(180deg);
    }
</style>
