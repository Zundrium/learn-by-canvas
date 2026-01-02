<script lang="ts">
    import { onMount } from "svelte";

    export let smiles: string;
    export let description: string = "";
    export let substructure: string = ""; // SMILES or SMARTS for highlighting

    let svg: string = "";
    let error: string = "";
    let rdkit: any = null;
    let loading = true;

    onMount(async () => {
        try {
            // @ts-ignore
            const module = await import("@rdkit/rdkit");
            const initRDKit = module.default || module;
            // @ts-ignore
            rdkit = await initRDKit({
                locateFile: () => "/RDKit_minimal.wasm",
            });
        } catch (e) {
            console.error("Failed to load RDKit", e);
            error = "Failed to load RDKit library.";
        } finally {
            loading = false;
        }
    });

    $: if (rdkit && smiles) {
        drawMolecule();
    }

    $: if (rdkit && substructure) {
        drawMolecule();
    }

    function drawMolecule() {
        if (!rdkit) return;

        error = "";
        let mol: any = null;
        let qmol: any = null;

        try {
            mol = rdkit.get_mol(smiles);

            if (!mol) {
                error = "Invalid SMILES string.";
                return;
            }

            if (substructure) {
                qmol = rdkit.get_qmol(substructure);
                const match = mol.get_substruct_match(qmol);
                if (match && match.atoms && match.atoms.length > 0) {
                    // Highlighting details need to be strictly typed JSON for RDKit JS typically,
                    // but simple get_svg_with_highlights usually takes a JSON string of options or similar.
                    // Let's rely on standard patterns or simple drawing for now.
                    // Actually, RDKitJS documentation suggests using `mol.get_svg_with_highlights(details)`
                    // We need to construct the details JSON.
                    // Based on RDKitJS examples:

                    const details = JSON.stringify({
                        atoms: match.atoms,
                        // bonds: match.bonds // if we had bond indices
                    });
                    svg = mol.get_svg_with_highlights(details);
                } else {
                    svg = mol.get_svg();
                }
            } else {
                svg = mol.get_svg();
            }
        } catch (e: any) {
            console.error("Error drawing molecule", e);
            error = "Error rendering molecule: " + e.message;
            svg = "";
        } finally {
            if (mol) mol.delete();
            if (qmol) qmol.delete();
        }
    }
</script>

<div
    class="flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto"
>
    {#if loading}
        <div class="flex items-center justify-center h-64">
            <span class="loading loading-spinner loading-lg text-primary"
            ></span>
        </div>
    {:else if error}
        <div class="alert alert-error">
            <span>{error}</span>
        </div>
    {:else}
        <div class="overflow-hidden flex justify-center rounded-lg">
            {@html svg}
        </div>
        {#if description}
            <p class="mt-4 text-gray-700 dark:text-gray-300 text-center">
                {description}
            </p>
        {/if}
    {/if}
</div>

<style>
    :global(svg) {
        max-width: 100%;
        height: auto;
    }
</style>
