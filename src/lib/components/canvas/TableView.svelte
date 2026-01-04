<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { Card } from "$lib/components/ui/card";

    export let columns: { header: string; values: string[] }[] = [];

    // Determine the number of rows based on the longest column
    $: rowCount = columns.reduce(
        (max, col) => Math.max(max, col.values.length),
        0,
    );

    function getValue(colIndex: number, rowIndex: number): string {
        return columns[colIndex]?.values[rowIndex] || "";
    }
</script>

<div
    class="w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
    in:fade={{ duration: 300 }}
>
    <div class="w-full max-w-4xl" in:fly={{ y: 20, duration: 500, delay: 200 }}>
        <Card class="w-full overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b bg-muted/50 transition-colors">
                            {#each columns as col}
                                <th
                                    class="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                                >
                                    {col.header}
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        {#each Array.from({ length: rowCount }) as _, rowIndex}
                            <tr
                                class="hover:bg-muted/50 transition-colors data-[state=selected]:bg-muted"
                            >
                                {#each columns as _, colIndex}
                                    <td
                                        class="p-4 align-middle whitespace-nowrap"
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
                                    class="p-8 text-center text-muted-foreground"
                                >
                                    No data available
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</div>
