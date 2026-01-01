<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { settings } from "$lib/stores/settings";
	import { browser } from "$app/environment";

	let { children } = $props();

	$effect(() => {
		if (!browser) return;

		const updateTheme = () => {
			const isDark =
				$settings.theme === "dark" ||
				($settings.theme === "system" &&
					window.matchMedia("(prefers-color-scheme: dark)").matches);

			document.documentElement.classList.toggle("dark", isDark);
		};

		updateTheme();

		// Listen for system changes if mode is system
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if ($settings.theme === "system") updateTheme();
		};
		mediaQuery.addEventListener("change", handleChange);

		return () => mediaQuery.removeEventListener("change", handleChange);
	});

	// React to store changes
	$effect(() => {
		// Just dependencies to trigger re-run of updateTheme logic if it was reactive,
		// but explicit subscription is better.
		// Actually $settings is a store, so reading it in $effect makes it a dependency.
		if (browser) {
			const isDark =
				$settings.theme === "dark" ||
				($settings.theme === "system" &&
					window.matchMedia("(prefers-color-scheme: dark)").matches);
			document.documentElement.classList.toggle("dark", isDark);
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
