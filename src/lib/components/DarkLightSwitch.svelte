<script lang="ts">
    import { theme } from "$lib/stores/theme";
    import { Button } from "$lib/components/ui/button";
    import { Sun, Moon, Monitor } from "@lucide/svelte";
</script>

<div class="flex items-center gap-1 p-1 border rounded-lg bg-background">
    <Button
        variant={$theme === "light" ? "secondary" : "ghost"}
        size="icon"
        onclick={() => ($theme = "light")}
        class="w-8 h-8"
        title="Light Mode"
    >
        <Sun class="w-4 h-4" />
        <span class="sr-only">Light</span>
    </Button>
    <Button
        variant={$theme === "dark" ? "secondary" : "ghost"}
        size="icon"
        onclick={() => ($theme = "dark")}
        class="w-8 h-8"
        title="Dark Mode"
    >
        <Moon class="w-4 h-4" />
        <span class="sr-only">Dark</span>
    </Button>
    <Button
        variant={$theme === "system" ? "secondary" : "ghost"}
        size="icon"
        onclick={() => ($theme = "system")}
        class="w-8 h-8"
        title="System Theme"
    >
        <Monitor class="w-4 h-4" />
        <span class="sr-only">System</span>
    </Button>
</div>
