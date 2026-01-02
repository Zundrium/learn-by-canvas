<script lang="ts">
    import { fade, fly } from "svelte/transition";

    export let columns: { header: string; values: string[] }[] = [];

    // Determine the number of rows based on the longest column
    $: rowCount = columns.reduce(
        (max, col) => Math.max(max, col.values.length),
        0,
    );

    // Helper to get value safely
    function getValue(colIndex: number, rowIndex: number): string {
        return columns[colIndex]?.values[rowIndex] || "";
    }
</script>

<div
    class="w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
    in:fade={{ duration: 300 }}
>
    <div
        class="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800"
        in:fly={{ y: 20, duration: 500, delay: 200 }}
    >
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800"
                    >
                        {#each columns as col}
                            <th
                                class="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                            >
                                {col.header}
                            </th>
                        {/each}
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    {#each Array.from({ length: rowCount }) as _, rowIndex}
                        <tr
                            class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                            {#each columns as _, colIndex}
                                <td
                                    class="p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
                                >
                                    {getValue(colIndex, rowIndex)}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                    {#if columns.length === 0}
                        <tr>
                            <td
                                colspan={columns.length || 1}
                                class="p-8 text-center text-gray-400"
                            >
                                No data available
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
