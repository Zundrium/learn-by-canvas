<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import { theme } from "$lib/stores/theme";
    import "leaflet/dist/leaflet.css";

    export let content: {
        center: { lat: number; lng: number };
        zoom?: number;
        markers?: Array<{
            lat: number;
            lng: number;
            title?: string;
            popupText?: string;
        }>;
        shapes?: Array<{
            type: "circle" | "polygon";
            color?: string;
            fillColor?: string;
            popupText?: string;
            center?: { lat: number; lng: number }; // For circle
            radius?: number; // For circle
            points?: Array<{ lat: number; lng: number }>; // For polygon
        }>;
    };

    let mapContainer: HTMLElement;
    let map: any; // Leaflet map instance
    let markerGroup: any; // LayerGroup for markers
    let shapeGroup: any; // LayerGroup for shapes
    let L: any;
    let isDark = false;
    let mediaQuery: MediaQueryList;

    function updateTheme() {
        if (!browser) return;
        if (!mediaQuery) {
            mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        }

        if ($theme === "system") {
            isDark = mediaQuery.matches;
        } else {
            isDark = $theme === "dark";
        }
    }

    onMount(async () => {
        if (browser) {
            mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            mediaQuery.addEventListener("change", updateTheme);
            updateTheme(); // Initial check

            const leaflet = await import("leaflet");
            L = leaflet.default;

            // Fix for default marker icons in Leaflet with bundlers
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                iconUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                shadowUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            });

            initMap();
        }
    });

    // Reactive update when content changes
    $: if (map && L && content) {
        updateMap();
    }

    // React to theme changes
    $: {
        const _ = $theme;
        updateTheme();
    }

    function initMap() {
        if (!mapContainer || map) return;

        map = L.map(mapContainer).setView(
            [content.center.lat, content.center.lng],
            content.zoom || 13,
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            className: "map-tiles",
        }).addTo(map);

        // Initialize LayerGroups
        markerGroup = L.layerGroup().addTo(map);
        shapeGroup = L.layerGroup().addTo(map);

        updateMap();
    }

    function updateMap() {
        if (!map) return;

        // Update view
        map.setView(
            [content.center.lat, content.center.lng],
            content.zoom || 13,
        );

        // Clear existing layers
        if (markerGroup) markerGroup.clearLayers();
        if (shapeGroup) shapeGroup.clearLayers();

        // Add new markers
        if (content.markers) {
            content.markers.forEach((m: any) => {
                const marker = L.marker([m.lat, m.lng], {
                    title: m.title,
                }).addTo(markerGroup);
                if (m.popupText) {
                    marker.bindPopup(m.popupText);
                }
            });
        }

        // Add new shapes
        if (content.shapes) {
            content.shapes.forEach((s: any) => {
                let layer;
                const options: any = {
                    color: s.color || "#3388ff",
                    fillColor: s.fillColor || s.color || "#3388ff",
                    fillOpacity: 0.2,
                };

                if (s.type === "circle" && s.center && s.radius) {
                    layer = L.circle([s.center.lat, s.center.lng], {
                        ...options,
                        radius: s.radius,
                    });
                } else if (s.type === "polygon" && s.points) {
                    const latLngs = s.points.map((p: any) => [p.lat, p.lng]);
                    layer = L.polygon(latLngs, options);
                }

                if (layer) {
                    layer.addTo(shapeGroup);
                    if (s.popupText) {
                        layer.bindPopup(s.popupText);
                    }
                }
            });
        }

        // Invalidate size in case of container resize
        setTimeout(() => map.invalidateSize(), 100);
    }

    onDestroy(() => {
        if (map) {
            map.remove();
        }
        if (browser && mediaQuery) {
            mediaQuery.removeEventListener("change", updateTheme);
        }
    });
</script>

<div
    class="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 z-0 relative"
    class:dark-map={isDark}
    bind:this={mapContainer}
></div>

<style>
    /* Force Leaflet container to be transparent so our div background shows through */
    :global(.leaflet-container) {
        background-color: transparent !important;
    }

    /* CSS Filter for Dark Mode on Tiles */
    :global(.dark-map .map-tiles) {
        filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
    }

    /* Dark mode for Leaflet popups */
    :global(html.dark .leaflet-popup-content-wrapper),
    :global(html.dark .leaflet-popup-tip) {
        background-color: #1f2937; /* gray-800 */
        color: #f3f4f6; /* gray-100 */
        box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
    }
</style>
