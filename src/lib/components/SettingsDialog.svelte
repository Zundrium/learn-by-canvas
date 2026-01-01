<script lang="ts">
    import { settings, type Theme, type Voice } from "$lib/stores/settings";
    import { fade, scale } from "svelte/transition";

    export let isOpen = false;
    export let onClose: () => void;

    // Available Voices
    const voices: Voice[] = [
        "Puck",
        "Charon",
        "Kore",
        "Fenrir",
        "Aoede",
        "Erinome",
    ];
    const themes: Theme[] = ["light", "dark", "system"];

    function close() {
        onClose();
    }
</script>

{#if isOpen}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-default w-full h-full border-0"
        on:click={close}
        on:keydown={(e) => e.key === "Escape" && close()}
        transition:fade={{ duration: 200 }}
        aria-label="Close settings"
        tabindex="-1"
    >
        <!-- Modal Content -->
        <div
            class="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md ring-1 ring-white/10 overflow-hidden cursor-auto text-left"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            on:click|stopPropagation={() => {}}
            on:keydown|stopPropagation={() => {}}
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <div
                class="p-6 border-b border-white/5 flex justify-between items-center"
            >
                <h2
                    id="settings-title"
                    class="text-xl font-semibold text-white"
                >
                    Settings
                </h2>
                <button
                    on:click={close}
                    class="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><line x1="18" y1="6" x2="6" y2="18"></line><line
                            x1="6"
                            y1="6"
                            x2="18"
                            y2="18"
                        ></line></svg
                    >
                </button>
            </div>

            <div class="p-6 space-y-6">
                <!-- Theme Section -->
                <div class="space-y-3">
                    <span
                        class="text-sm font-medium text-gray-300"
                        id="theme-label">Theme</span
                    >
                    <div
                        class="flex bg-gray-900/50 p-1 rounded-lg border border-white/5"
                        role="group"
                        aria-labelledby="theme-label"
                    >
                        {#each themes as theme}
                            <button
                                class="flex-1 py-2 px-3 text-sm rounded-md capitalize transition-all duration-200
                                {$settings.theme === theme
                                    ? 'bg-gray-700 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'}"
                                on:click={() => ($settings.theme = theme)}
                            >
                                {theme}
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Voice Section -->
                <div class="space-y-3">
                    <label
                        for="voice-select"
                        class="text-sm font-medium text-gray-300">Voice</label
                    >
                    <div class="relative">
                        <select
                            id="voice-select"
                            bind:value={$settings.voice}
                            class="w-full bg-gray-900/50 border border-white/10 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none appearance-none cursor-pointer hover:bg-gray-900/80 transition-colors"
                        >
                            {#each voices as voice}
                                <option value={voice}>{voice}</option>
                            {/each}
                        </select>
                        <!-- Custom Arrow -->
                        <div
                            class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                ><path d="m6 9 6 6 6-6" /></svg
                            >
                        </div>
                    </div>
                    <p class="text-xs text-gray-500">
                        Choosing a new voice will apply to the next session.
                    </p>
                </div>
            </div>

            <div
                class="p-6 border-t border-white/5 bg-black/20 flex justify-end"
            >
                <button
                    on:click={close}
                    class="px-5 py-2.5 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Done
                </button>
            </div>
        </div>
    </div>
{/if}
