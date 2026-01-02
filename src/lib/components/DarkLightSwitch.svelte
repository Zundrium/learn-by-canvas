<script lang="ts">
    import { theme, type Theme } from "$lib/stores/theme";

    const themes: Theme[] = ["light", "dark", "system"];
</script>

<div
    class="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-white/5"
    role="group"
    aria-labelledby="theme-label"
>
    {#each themes as t}
        <button
            class="flex-1 py-2 px-3 text-sm rounded-md capitalize transition-all duration-200
            {$theme === t
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5'}"
            on:click={() => ($theme = t)}
        >
            {t}
        </button>
    {/each}
</div>
