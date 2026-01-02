/**
 * GeminiSession
 * An optimized class for the Gemini Multimodal Live API.
 * Uses AudioWorklets for low-latency and strong typing for API integrity.
 */
import systemInstruction from './SYSTEM_PROMPT.md?raw';

interface GeminiConfig {
    apiKey: string;
    model?: string;
    systemInstruction?: string;
    voice?: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede" | "Erinome";
    history?: Array<{ role: 'user' | 'model' | 'system'; text: string }>;
}

interface RealtimeInput {
    realtimeInput: {
        mediaChunks: Array<{ mimeType: string; data: string }>;
    };
}

interface ServerContent {
    serverContent?: {
        modelTurn?: { parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> };
        interruption?: boolean;
        turnComplete?: boolean;
    };
    // Helper to allow loose typing while keeping the structure we expect
    [key: string]: any;
}

export class GeminiSession {
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private audioWorkletNode: AudioWorkletNode | null = null;
    private nextPlayTime: number = 0;
    private isConnected: boolean = false;

    // Audio Playback Queue to allow for clearing on interruption
    private activeSources: AudioBufferSourceNode[] = [];
    private ignoreModelAudio: boolean = false;

    // Transcription and Tool Callbacks
    public onTranscription: ((text: string, type: 'user' | 'model') => void) | null = null;
    public onTurnComplete: (() => void) | null = null;
    public onInterruption: (() => void) | null = null;

    public onCanvasUpdate: ((data: { type: string, content: any }) => void) | null = null;
    public onToolCall: ((name: string, args: any) => void) | null = null;

    public outputAnalyser: AnalyserNode | null = null;

    constructor(public config: GeminiConfig) {
        this.config.model ??= "models/gemini-2.5-flash-native-audio-preview-12-2025";
        this.config.voice ??= "Erinome";
        this.config.systemInstruction ??= systemInstruction;
    }

    public async start() {
        if (this.isConnected) {
            console.log("Already connected.");
            return;
        }

        console.log("Starting Gemini Session...");
        console.log("Voice config:", this.config.voice);

        this.audioInputChunks = []; // Reset buffer on new session

        // Create AudioContext immediately within the user gesture to avoid autoplay blocking
        this.audioContext = new AudioContext({ sampleRate: 24000 });
        this.outputAnalyser = this.audioContext.createAnalyser();
        this.outputAnalyser.fftSize = 256;
        this.outputAnalyser.smoothingTimeConstant = 0.7;
        this.outputAnalyser.connect(this.audioContext.destination);
        console.log("AudioContext created. State:", this.audioContext.state);

        const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`;
        console.log("Connecting to WebSocket:", url);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log("WebSocket Connected!");
            this.isConnected = true;
            this.sendSetup();
            this.initializeAudio();
        };

        this.ws.onmessage = async (event) => {
            try {
                const data = event.data instanceof Blob ? await event.data.text() : event.data;
                // console.log("Raw WS Message:", data); 
                const message: any = JSON.parse(data);
                this.handleMessage(message);
            } catch (e) {
                console.error("Error parsing WS message:", e);
            }
        };

        this.ws.onerror = (err) => {
            console.error("WebSocket Error:", err);
        };

        this.ws.onclose = (ev) => {
            console.log("WebSocket Closed:", ev.code, ev.reason);
            this.stop();
        };
    }

    private sendSetup() {
        console.log("Sending Setup Config...");
        const setup = {
            setup: {
                model: this.config.model,
                generationConfig: {
                    responseModalities: ["AUDIO"], // don't add "TEXT" here
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: this.config.voice } }
                    }
                },
                tools: [{
                    functionDeclarations: [
                        {
                            name: "display_sentence_on_canvas",
                            description: "Displays a single sentence in the center of the canvas.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    text: { type: "STRING", description: "The sentence to display." },
                                    subsentence: { type: "STRING", description: "An optional smaller sub-sentence or translation displayed below." }
                                },
                                required: ["text"]
                            }
                        },
                        {
                            name: "display_conversation_on_canvas",
                            description: "Displays a practice conversation with the language to learn, a phonetic version, and the english translation.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    lines: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                speaker: { type: "STRING", description: "The name of the speaker (e.g. 'Person A', 'Person B')." },
                                                target: { type: "STRING", description: "The sentence in the target language (e.g. Japanese)." },
                                                phonetic: { type: "STRING", description: "The phonetic pronunciation (e.g. Romaji)." },
                                                english: { type: "STRING", description: "The English translation." },
                                            },
                                            required: ["speaker", "target", "phonetic", "english"]
                                        }
                                    }
                                },
                                required: ["lines"]
                            }
                        },
                        {
                            name: "display_code_on_canvas",
                            description: "Displays a code snippet for explaining code.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    code: { type: "STRING", description: "The code snippet." },
                                    language: { type: "STRING", description: "The programming language (e.g. 'javascript', 'python')." }
                                },
                                required: ["code"]
                            }
                        },
                        {
                            name: "display_mermaid_diagram_on_canvas",
                            description: "Displays a mermaid diagram. Use this to visualize processes, flows, or structures.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    graph: { type: "STRING", description: "The mermaid graph definition (e.g. 'graph TD; A-->B;')." }
                                },
                                required: ["graph"]
                            }
                        },
                        {
                            name: "display_flashcard_deck_srs",
                            description: "Displays a deck of flashcards for spaced repetition practice. Use this when the user wants to memorize terms or concepts.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    deckName: { type: "STRING", description: "The name or topic of the deck." },
                                    cards: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                front: { type: "STRING", description: "The content on the front of the card." },
                                                back: { type: "STRING", description: "The content on the back of the card." },
                                            },
                                            required: ["front", "back"]
                                        }
                                    }
                                },
                                required: ["deckName", "cards"]
                            }
                        },
                        {
                            name: "display_table",
                            description: "Displays a table of data. Use this to organize multiple items with attributes into columns.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    columns: {
                                        type: "ARRAY",
                                        description: "List of columns, where each column has a header and values.",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                header: { type: "STRING", description: "The header/title of the column." },
                                                values: {
                                                    type: "ARRAY",
                                                    description: "The list of string values for this column.",
                                                    items: { type: "STRING" }
                                                }
                                            },
                                            required: ["header", "values"]
                                        }
                                    }
                                },
                                required: ["columns"]
                            }
                        },
                        {
                            name: "display_location_on_map",
                            description: "Displays a map centered on a specific location with optional markers and shapes (citizens, polygons).",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    center: {
                                        type: "OBJECT",
                                        description: "The center of the map.",
                                        properties: {
                                            lat: { type: "NUMBER", description: "Latitude" },
                                            lng: { type: "NUMBER", description: "Longitude" }
                                        },
                                        required: ["lat", "lng"]
                                    },
                                    zoom: { type: "NUMBER", description: "Zoom level (default 13)." },
                                    markers: {
                                        type: "ARRAY",
                                        description: "List of markers to place on the map.",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                lat: { type: "NUMBER", description: "Latitude" },
                                                lng: { type: "NUMBER", description: "Longitude" },
                                                title: { type: "STRING", description: "Hover title for the marker." },
                                                popupText: { type: "STRING", description: "Text to display in a popup when clicked." }
                                            },
                                            required: ["lat", "lng"]
                                        }
                                    },
                                    shapes: {
                                        type: "ARRAY",
                                        description: "List of shapes (circles, polygons) to draw on the map.",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                type: { type: "STRING", description: "Type of shape: 'circle' or 'polygon'." },
                                                color: { type: "STRING", description: "Stroke color (e.g., 'red', '#ff0000')." },
                                                fillColor: { type: "STRING", description: "Fill color." },
                                                popupText: { type: "STRING", description: "Text to display in a popup when clicked." },
                                                // Circle properties
                                                center: {
                                                    type: "OBJECT",
                                                    description: "Center for circle.",
                                                    properties: {
                                                        lat: { type: "NUMBER" },
                                                        lng: { type: "NUMBER" }
                                                    }
                                                },
                                                radius: { type: "NUMBER", description: "Radius in meters for circle." },
                                                // Polygon properties
                                                points: {
                                                    type: "ARRAY",
                                                    description: "List of points for polygon.",
                                                    items: {
                                                        type: "OBJECT",
                                                        properties: {
                                                            lat: { type: "NUMBER" },
                                                            lng: { type: "NUMBER" }
                                                        },
                                                        required: ["lat", "lng"]
                                                    }
                                                }
                                            },
                                            required: ["type"]
                                        }
                                    }
                                },
                                required: ["center"]
                            }
                        },




                        {
                            name: "display_mathematical_notation",
                            description: "Displays a mathematical equation using KaTeX. Use this to show formulas, equations, or mathematical expressions.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    equation: { type: "STRING", description: "The mathematical equation in LaTeX format (e.g. 'E = mc^2')." },
                                    description: { type: "STRING", description: "A description or explanation of the equation." }
                                },
                                required: ["equation"]
                            }
                        },
                        {
                            name: "display_smiles",
                            description: "Displays a chemical structure from a SMILES string using RDKit.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    smiles: { type: "STRING", description: "The SMILES string of the molecule." },
                                    description: { type: "STRING", description: "A description of the molecule." },
                                    substructure: { type: "STRING", description: "Optional SMILES or SMARTS string to highlight a substructure." }
                                },
                                required: ["smiles"]
                            }
                        }
                    ]
                }],
                inputAudioTranscription: {},
                outputAudioTranscription: {}, // leave this empty
                systemInstruction: { parts: [{ text: this.buildSystemInstruction() }] }
            }
        };
        this.send(setup);
    }

    private buildSystemInstruction(): string {
        let instruction = this.config.systemInstruction || "";
        if (this.config.history && this.config.history.length > 0) {
            instruction += "\n\n--- PREVIOUS SESSION CONTEXT ---\n";
            instruction += this.config.history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n");
            instruction += "\n--- END CONTEXT ---\n";
        }
        return instruction;
    }

    private async initializeAudio() {
        console.log("Initializing Audio Input...");
        // Ensure AudioContext is ready
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            console.log("Resuming suspended AudioContext...");
            await this.audioContext.resume();
        }

        // Create AudioWorklet on the fly to avoid external file dependencies
        const workletCode = `
      class RecorderProcessor extends AudioWorkletProcessor {
        process(inputs) {
          const input = inputs[0][0];
          if (input) {
            this.port.postMessage(input);
          }
          return true;
        }
      }
      registerProcessor('recorder-processor', RecorderProcessor);
    `;
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);

        try {
            await this.audioContext.audioWorklet.addModule(url);
            console.log("AudioWorklet loaded.");
        } catch (e) {
            console.error("AudioWorklet failed:", e);
        }

        if (!this.audioContext) return; // Check if stopped during await

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Microphone access granted.");
        } catch (e) {
            console.error("Microphone access denied or failed", e);
            this.stop(); // Ensure cleanup if mic fails
            return;
        }
        if (!this.audioContext) return; // Check if stopped during getUserMedia

        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'recorder-processor');

        this.audioWorkletNode.port.onmessage = (e) => {
            if (!this.isConnected) return; // Don't send if not connected
            this.processAndSendAudio(e.data);
        };

        source.connect(this.audioWorkletNode);
        console.log("Audio pipeline setup complete.");
    }

    private audioInputChunks: Float32Array[] = [];
    private readonly BUFFER_SIZE_SAMPLES = 2400; // ~100ms at 24kHz

    private processAndSendAudio(float32Array: Float32Array) {
        this.audioInputChunks.push(float32Array);

        // Calculate total size
        const totalSize = this.audioInputChunks.reduce((acc, chunk) => acc + chunk.length, 0);

        if (totalSize >= this.BUFFER_SIZE_SAMPLES) {
            this.sendAudioChunks();
        }
    }

    private sendAudioChunks() {
        const totalSize = this.audioInputChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const merged = new Float32Array(totalSize);
        let offset = 0;
        for (const chunk of this.audioInputChunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }

        const pcm16 = this.floatTo16BitPCM(merged);
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16)));

        const payload: RealtimeInput = {
            realtimeInput: {
                mediaChunks: [{ mimeType: "audio/pcm;rate=24000", data: base64 }]
            }
        };
        this.send(payload);
        this.audioInputChunks = [];
    }

    private handleMessage(message: any) {
        const serverContent = message.serverContent;
        // console.log("Server Content:", serverContent);

        // Handle Tool Calls
        if (message.toolCall) {
            this.handleToolCall(message.toolCall);
        }

        if (!serverContent) return;

        if (serverContent.interrupted) {
            console.log("Interruption received");
            this.ignoreModelAudio = true; // Set gate
            this.stopAllPlayback();
            this.onInterruption?.();
            return;
        }

        if (serverContent.modelTurn?.parts) {
            // Logic: Only play if we haven't been told to ignore this turn
            serverContent.modelTurn.parts.forEach((part: any) => {
                if (part.inlineData?.data && !this.ignoreModelAudio) {
                    this.queueAudio(part.inlineData.data);
                }
            });
        }

        if (serverContent.outputTranscription) {
            this.onTranscription?.(serverContent.outputTranscription.text, 'model');
        }

        if (serverContent.inputTranscription) {
            this.onTranscription?.(serverContent.inputTranscription.text, 'user');
        }

        if (serverContent.turnComplete) {
            this.ignoreModelAudio = false; // Reset gate ONLY when turn is fully finished
            this.onTurnComplete?.();
        }
    }

    private handleToolCall(toolCall: any) {
        const functionCalls = toolCall.functionCalls;
        if (!functionCalls || functionCalls.length === 0) return;

        const toolResponses = [];

        for (const call of functionCalls) {
            console.log("Tool Call:", call.name, call.args);

            if (this.onCanvasUpdate) {
                if (call.name === "display_sentence_on_canvas") {
                    this.onCanvasUpdate({ type: 'sentence', content: call.args });
                } else if (call.name === "display_conversation_on_canvas") {
                    this.onCanvasUpdate({ type: 'conversation', content: call.args });
                } else if (call.name === "display_code_on_canvas") {
                    this.onCanvasUpdate({ type: 'code', content: call.args });
                } else if (call.name === "display_mermaid_diagram_on_canvas") {
                    this.onCanvasUpdate({ type: 'mermaid', content: call.args });
                } else if (call.name === "display_flashcard_deck_srs") {
                    this.onCanvasUpdate({ type: 'flashcards', content: call.args });
                } else if (call.name === "display_table") {
                    this.onCanvasUpdate({ type: 'table', content: call.args });
                } else if (call.name === "display_location_on_map") {
                    this.onCanvasUpdate({ type: 'map', content: call.args });
                } else if (call.name === "display_mathematical_notation") {
                    this.onCanvasUpdate({ type: 'mathematical_notation', content: call.args });
                } else if (call.name === "display_smiles") {
                    this.onCanvasUpdate({ type: 'smiles', content: call.args });



                } else {
                    console.warn("Unknown tool called:", call.name);
                }

                // Notify about tool call for UI
                this.onToolCall?.(call.name, call.args);

                // Always respond with success for now to keep the flow going
                toolResponses.push({
                    id: call.id,
                    name: call.name,
                    response: { result: "ok" }
                });
            }
        }

        // Send tool response back to Gemini to acknowledge the action
        const responsePayload = {
            toolResponse: {
                functionResponses: toolResponses
            }
        };
        this.send(responsePayload);
    }


    private queueAudio(base64: string) {
        if (!this.audioContext || this.ignoreModelAudio) return; // Strict gate

        const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
        const float32Data = this.int16ToFloat32(new Int16Array(arrayBuffer));

        const buffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        if (this.outputAnalyser) {
            source.connect(this.outputAnalyser);
        } else {
            source.connect(this.audioContext.destination);
        }

        const now = this.audioContext.currentTime;
        this.nextPlayTime = Math.max(this.nextPlayTime, now);
        source.start(this.nextPlayTime);
        this.nextPlayTime += buffer.duration;

        this.activeSources.push(source);
        source.onended = () => {
            this.activeSources = this.activeSources.filter(s => s !== source);
            source.disconnect();
        };
    }

    private stopAllPlayback() {
        console.log("Stopping all playback.");
        this.activeSources.forEach(s => {
            try { s.stop(); } catch (e) { }
        });
        this.activeSources = [];
        this.nextPlayTime = 0;
    }

    public stop() {
        console.log("Stopping session.");
        this.isConnected = false;
        this.ws?.close();
        this.mediaStream?.getTracks().forEach(t => t.stop());
        this.audioContext?.close();
        this.stopAllPlayback();
        this.audioContext = null; // Reset context
    }

    private send(data: object) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket not open, cannot send message.");
        }
    }

    private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
        const buffer = new ArrayBuffer(input.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        return buffer;
    }

    private int16ToFloat32(input: Int16Array): Float32Array {
        const output = new Float32Array(input.length);
        for (let i = 0; i < input.length; i++) {
            output[i] = input[i] / 32768.0;
        }
        return output;
    }
}