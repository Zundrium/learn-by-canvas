<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import type { GeminiSession } from "$lib/gemini";

    export let session: GeminiSession | undefined = undefined;

    let canvas: HTMLCanvasElement;
    let gl: WebGLRenderingContext | null = null;
    let animationId: number;
    let program: WebGLProgram;

    // Shader sources
    const vertexShaderSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_audio[64];

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            uv = uv * 2.0 - 1.0;
            // Removed aspect ratio correction to stretch wave across full width
            
            // Map uv.x (-1..1) to 0..20 (subset of data for simpler, wider wave)
            float x = (uv.x + 1.0) * 0.5 * 20.0;
            float idx = floor(x);
            float fractX = fract(x);

            float v1 = 0.0, v2 = 0.0;
            for (int i = 0; i < 64; i++) {
                if (float(i) == idx) v1 = u_audio[i];
                if (float(i) == idx + 1.0) v2 = u_audio[i];
            }
            
            // Cubic interpolation for smoother line
            float t = fractX * fractX * (3.0 - 2.0 * fractX);
            float val = mix(v1, v2, t);
            
            // Apply Windowing: flatten edges
            float mask = cos(uv.x * 1.57);
            
            float y = (val - 0.5) * 2.0 * mask;
            
            float dist = abs(uv.y - y);
            
            // Solid line with anti-aliasing
            float thickness = 0.05; 
            float alpha = 1.0 - smoothstep(thickness * 0.5, thickness, dist);

            vec3 baseColor = vec3(0.4, 0.7, 1.0);
            
            gl_FragColor = vec4(baseColor * alpha, alpha);
        }
    `;

    function createShader(
        gl: WebGLRenderingContext,
        type: number,
        source: string,
    ) {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function initWebGL() {
        if (!canvas) return;
        gl = canvas.getContext("webgl", { alpha: true }); // Enable alpha context
        if (!gl) return;

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Premultiplied alpha blending

        const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vs || !fs) return;

        program = gl.createProgram() as WebGLProgram;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW,
        );

        const posLoc = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }

    function render(time: number) {
        if (!gl || !program || !canvas) return;

        if (
            canvas.width !== canvas.clientWidth ||
            canvas.height !== canvas.clientHeight
        ) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }

        // Clear with transparent black
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const uRes = gl.getUniformLocation(program, "u_resolution");
        const uTime = gl.getUniformLocation(program, "u_time");
        const uAudio = gl.getUniformLocation(program, "u_audio");

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, time * 0.001);

        const data = new Float32Array(64);
        if (session && session.outputAnalyser) {
            const raw = new Uint8Array(256);
            session.outputAnalyser.getByteTimeDomainData(raw);
            for (let i = 0; i < 64; i++) {
                data[i] = raw[i * 4] / 255.0;
            }
        } else {
            for (let i = 0; i < 64; i++) {
                data[i] = (128 + Math.sin(time * 0.002 + i * 0.1) * 5) / 255.0; // Reduced idle amplitude too
            }
        }

        gl.uniform1fv(uAudio, data);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationId = requestAnimationFrame(render);
    }

    onMount(() => {
        initWebGL();
        animationId = requestAnimationFrame(render);
    });

    onDestroy(() => {
        if (typeof window !== "undefined") {
            cancelAnimationFrame(animationId);
        }
    });
</script>

<canvas bind:this={canvas} class="w-full h-full block"></canvas>

<style>
    canvas {
        background: transparent;
    }
</style>
