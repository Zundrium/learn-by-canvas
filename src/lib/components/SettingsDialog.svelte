<script lang="ts">
    import { settings, type Voice } from "$lib/stores/settings";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import * as Select from "$lib/components/ui/select";
    import DarkLightSwitch from "./DarkLightSwitch.svelte";

    export let isOpen = false;
    export let onClose: () => void;

    const voices: Voice[] = [
        "Puck",
        "Charon",
        "Kore",
        "Fenrir",
        "Aoede",
        "Erinome",
    ];

    $: selectedVoice = { value: $settings.voice, label: $settings.voice };

    function handleOpenChange(open: boolean) {
        isOpen = open;
        if (!open) {
            onClose();
        }
    }
</script>

<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Settings</Dialog.Title>
        </Dialog.Header>
        <div class="grid gap-6 py-4">
            <div class="grid gap-3">
                <Label for="api-key">API Key</Label>
                <Input
                    id="api-key"
                    type="password"
                    bind:value={$settings.apiKey}
                    placeholder="Enter your Gemini API Key"
                />
                <p class="text-xs text-muted-foreground">
                    Your key is stored locally in your browser.
                </p>
            </div>

            <div class="grid gap-3">
                <Label>Theme</Label>
                <div class="flex">
                    <DarkLightSwitch />
                </div>
            </div>

            <div class="grid gap-3">
                <Label>Voice</Label>
                <Select.Root type="single" bind:value={$settings.voice}>
                    <Select.Trigger class="w-full">
                        {$settings.voice || "Select a voice"}
                    </Select.Trigger>
                    <Select.Content>
                        {#each voices as voice}
                            <Select.Item value={voice} label={voice}>
                                {voice}
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
                <p class="text-xs text-muted-foreground">
                    Choosing a new voice will apply to the next session.
                </p>
            </div>
        </div>
        <Dialog.Footer>
            <Button onclick={() => handleOpenChange(false)}>Done</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
