<script lang="ts">
    import { fade } from "svelte/transition";

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
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
            {deckName}
        </h2>
        <div class="text-sm text-gray-500 dark:text-gray-400 font-mono">
            Card {currentIndex + 1} of {cards.length}
        </div>
    </div>

    <!-- Card Container -->
    <div class="relative w-full aspect-[3/2] perspective">
        <!-- The Card -->
        <button
            class="w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer outline-none focus:ring-4 ring-blue-500/30 rounded-2xl"
            class:rotate-y-180={isFlipped}
            on:click={flipCard}
        >
            <!-- Front -->
            <div
                class="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-8 text-center"
            >
                <div class="text-3xl font-medium text-gray-900 dark:text-white">
                    {cards[currentIndex]?.front}
                </div>
                <div
                    class="absolute bottom-4 text-xs uppercase tracking-widest text-gray-400"
                >
                    Front
                </div>
            </div>

            <!-- Back -->
            <div
                class="absolute inset-0 backface-hidden rotate-y-180 bg-blue-50 dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-blue-200 dark:border-blue-900 flex flex-col items-center justify-center p-8 text-center"
            >
                <div class="text-2xl text-gray-800 dark:text-blue-100">
                    {cards[currentIndex]?.back}
                </div>
                <div
                    class="absolute bottom-4 text-xs uppercase tracking-widest text-blue-400"
                >
                    Back
                </div>
            </div>
        </button>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-4">
        <button
            class="p-4 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-50 transition-colors"
            on:click={prevCard}
            disabled={currentIndex === 0}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="m15 18-6-6 6-6" />
            </svg>
        </button>

        <button
            class="px-8 py-3 rounded-full font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 shadow-lg transition-transform active:scale-95"
            on:click={flipCard}
        >
            Flip
        </button>

        <button
            class="p-4 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-50 transition-colors"
            on:click={nextCard}
            disabled={currentIndex === cards.length - 1}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="m9 18 6-6-6-6" />
            </svg>
        </button>
    </div>
</div>

<style>
    .perspective {
        perspective: 1000px;
    }
    .preserve-3d {
        transform-style: preserve-3d;
    }
    .backface-hidden {
        backface-visibility: hidden;
    }
    .rotate-y-180 {
        transform: rotateY(180deg);
    }
</style>
