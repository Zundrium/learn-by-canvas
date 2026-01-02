<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { theme } from "$lib/stores/theme";

	let { children } = $props();

	$effect(() => {
		// Just mounting the store to ensure it runs is enough for now,
		// but ideally we just import it in a top-level component.
		// Since we imported it above, the code in theme.ts runs.
		// But let's subscribe just to be safe and reactive if needed later.
		const unsubscribe = theme.subscribe(() => {});
		return unsubscribe;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
