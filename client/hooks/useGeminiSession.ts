import {
  ActivityHandling,
  GoogleGenAI,
  LiveConnectConfig,
  Session as LiveSession,
  MediaResolution,
  Modality,
  Type,
} from "@google/genai";
import { useRef, useState } from "react";
import { Language } from "../utils/languages.js";
import { TokenUsage } from "../utils/models.js";
import { Session, SessionEvent, TranslationSegment } from "../utils/session.js";
import { useLocalStorage } from "../utils/useLocalStorage.js";
import { useWakeLock } from "./useWakeLock.js";

// Constants
const TARGET_SAMPLE_RATE = 16000; // Gemini requires 16kHz audio

// Audio Worklet for processing and sending audio chunks
const AudioRecordingWorklet = `
class AudioProcessingWorklet extends AudioWorkletProcessor {
    buffer = new Int16Array(2048); // Buffer for 2048 int16 samples
    bufferWriteIndex = 0;

    constructor() {
        super();
    }

    process(inputs, outputs, parameters) {
        // We expect one input, with one channel (mono)
        if (inputs.length > 0 && inputs[0].length > 0) {
            const channelData = inputs[0][0]; // Float32Array
            this.processChunk(channelData);
        }
        return true; // Keep processor alive
    }

    sendAndClearBuffer() {
        if (this.bufferWriteIndex > 0) {
            // Send only the portion of the buffer that has data
            const dataToSend = this.buffer.slice(0, this.bufferWriteIndex);
            this.port.postMessage({
                eventType: "audioData",
                audioData: dataToSend.buffer // Send ArrayBuffer
            }, [dataToSend.buffer]); // Transfer buffer ownership for efficiency
            this.bufferWriteIndex = 0; // Reset buffer index
        }
    }

    processChunk(float32Array) {
        for (let i = 0; i < float32Array.length; i++) {
            // Clamp value between -1.0 and 1.0
            const clampedValue = Math.max(-1.0, Math.min(1.0, float32Array[i]));
            // Convert to 16-bit PCM
            const int16Value = Math.floor(clampedValue * 32767);
            this.buffer[this.bufferWriteIndex++] = int16Value;

            // If buffer is full, send it
            if (this.bufferWriteIndex >= this.buffer.length) {
                this.sendAndClearBuffer();
            }
        }
    }
}
registerProcessor('audio-processing-worklet', AudioProcessingWorklet);
`;

// Using shared types from models.ts

// TODO: Define a Gemini specific ModelOption if needed, or ensure ModelOption can accommodate Gemini models
export function useGeminiSession(
  currentLanguage1: Language,
  currentLanguage2: Language,
  modelName: string = "gemini-2.0-flash-live-001",
): Session {
  const [geminiApiKey] = useLocalStorage<string | null>(
    "App:geminiApiKey",
    null,
  );
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [translationSegments, setTranslationSegments] = useLocalStorage<
    TranslationSegment[]
  >("translationSegments", []);
  // TokenUsage for Gemini is TBD - stubbed for now
  const [tokenUsage, setTokenUsage] = useLocalStorage<TokenUsage | null>(
    "tokenUsage",
    null,
  );

  const genAiClientRef = useRef<GoogleGenAI | null>(null);
  const liveSessionRef = useRef<LiveSession | null>(null); // Type from @google/genai for LiveSession
  const sentChunksRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);

  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const storeEvent = (
    eventDataOrObject: string | object,
    direction: "sent" | "received" | "internal",
  ): SessionEvent => {
    let event: SessionEvent;

    if (typeof eventDataOrObject === "string") {
      try {
        event = JSON.parse(eventDataOrObject) as SessionEvent;
      } catch (error) {
        event = {
          type: "raw_unparseable_data",
          event_id: `err_${crypto.randomUUID()}`,
          data: eventDataOrObject,
          error: (error as Error).message,
        };
      }
    } else {
      event = eventDataOrObject as SessionEvent;
    }

    if (!event.timestamp) {
      event.timestamp = new Date().toLocaleTimeString();
    }
    if (!event.event_id) {
      event.event_id = `${direction}_${crypto.randomUUID()}`;
    }
    event._direction = direction;
    setEvents((prev) => [event, ...prev.slice(0, 199)]); // Keep last 200 events
    return event;
  };

  const startSession = async () => {
    if (!geminiApiKey) {
      storeEvent(
        {
          type: "error_session_start",
          message: "Gemini API key not available.",
        },
        "internal",
      );
      return;
    }
    if (isSessionActive || liveSessionRef.current) {
      console.warn("Gemini session is already active or starting.");
      return;
    }

    console.log(
      "Attempting to start Gemini session with languages:",
      currentLanguage1.name,
      currentLanguage2.name,
      "and model:",
      modelName,
    );
    storeEvent(
      {
        type: "info_gemini_session_starting",
        languages: [currentLanguage1.name, currentLanguage2.name],
        model: modelName,
      },
      "internal",
    );
    setEvents([]); // Clear previous events
    setIsSessionActive(false); // Will be true once connection and audio are ready

    await requestWakeLock();
    storeEvent({ type: "info_wake_lock_acquired" }, "internal");

    try {
      genAiClientRef.current = new GoogleGenAI({ apiKey: geminiApiKey });

      const model = "models/gemini-2.5-flash-preview-native-audio-dialog";

      const tools = [
        {
          functionDeclarations: [
            {
              name: "transcribe",
              description: `Return the speaker's words translated into ${currentLanguage1.name} and ${currentLanguage2.name}. Never respond any other way.`,
              parameters: {
                type: Type.OBJECT,
                required: [
                  "speaker",
                  currentLanguage1.code,
                  currentLanguage2.code,
                ],
                properties: {
                  speaker: {
                    type: Type.NUMBER,
                    description:
                      "A unique number representing the voice of the person speaking, to distinguish them from other speakers in the UI. Multiple people may be speaking and each should have their own (stable) numbers, starting at 1 and incrementing by 1 for each new speaker.",
                  },
                  [currentLanguage1.code]: {
                    type: Type.STRING,
                    description: `The entire utterance, fully translated (or transcribed) into ${
                      currentLanguage1.name
                    }. ${currentLanguage1.annotationInstructions ?? ""}`,
                  },
                  [currentLanguage2.code]: {
                    type: Type.STRING,
                    description: `The entire utterance, fully translated (or transcribed) into ${
                      currentLanguage2.name
                    }. ${currentLanguage2.annotationInstructions ?? ""}`,
                  },
                },
              },
            },
          ],
        },
      ];

      const config = {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Zephyr",
            },
          },
        },
        realtimeInputConfig: {
          // turnCoverage: TurnCoverage.TURN_INCLUDES_ALL_INPUT,
          activityHandling: ActivityHandling.NO_INTERRUPTION,
          // automaticActivityDetection: {
          // disabled: true,
          // silenceDurationMs: 0,
          // },
        },
        contextWindowCompression: {
          triggerTokens: "25600",
          slidingWindow: { targetTokens: "12800" },
        },
        tools,
        systemInstruction: {
          parts: [
            {
              text: `You are a passive translator named Iso. Please only respond with the text of any speech you hear, transcribed and/or translated into both ${currentLanguage1.name} and ${currentLanguage2.name}. Respond only with tool calls.`,
            },
          ],
        },
      } satisfies LiveConnectConfig;

      liveSessionRef.current = await genAiClientRef.current.live.connect({
        model,
        // audioConfig: { targetSampleRate: TARGET_SAMPLE_RATE },
        config,
        callbacks: {
          onopen: () => {
            storeEvent({ type: "info_gemini_connected" }, "internal");
            // Audio setup will complete, then setIsSessionActive(true)
          },
          onmessage: (message: any) => {
            storeEvent({ type: "server_message", message }, "received");

            // Handle tool calls from Gemini
            if (message.toolCall?.functionCalls?.length > 0) {
              const functionCall = message.toolCall.functionCalls[0];
              if (functionCall.name === "transcribe") {
                const args = functionCall.args;
                if (
                  args &&
                  typeof args.speaker === "number" &&
                  args[currentLanguage1.code] !== undefined &&
                  args[currentLanguage2.code] !== undefined
                ) {
                  const { speaker, ...langTranslations } = args;
                  const newSegment: TranslationSegment = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    speaker: speaker as number,
                    translations: langTranslations as Record<string, string>,
                    language1: currentLanguage1,
                    language2: currentLanguage2,
                  };
                  setTranslationSegments((prev) => [...prev, newSegment]);
                }

                // Send blank result.
                liveSessionRef.current?.sendToolResponse({
                  functionResponses: {
                    id: functionCall.id,
                    name: "transcribe",
                    response: {},
                  },
                });
              }
            }
            if (message.inputTranscription) {
              storeEvent(
                {
                  type: "gemini_input_transcription",
                  text: message.inputTranscription,
                },
                "internal",
              );
            }
            if (message.error) {
              storeEvent(
                {
                  type: "error_gemini_message",
                  detail:
                    message.error.message || JSON.stringify(message.error),
                },
                "internal",
              );
            }
            if (
              message.usageMetadata &&
              Object.keys(message.usageMetadata).length > 0 // Sometimes we get an empty object
            ) {
              // Process Gemini usage metadata
              const { promptTokenCount, totalTokenCount, promptTokensDetails } =
                message.usageMetadata;

              // Calculate output tokens
              const outputTokenCount = totalTokenCount - promptTokenCount;

              // Parse input token breakdown by modality
              let inputTextTokens = 0;
              let inputAudioTokens = 0;
              let outputTextTokens = 0;
              let outputAudioTokens = 0;

              if (promptTokensDetails) {
                for (const detail of promptTokensDetails) {
                  if (detail.modality === "TEXT") {
                    inputTextTokens = detail.tokenCount;
                  } else if (detail.modality === "AUDIO") {
                    inputAudioTokens = detail.tokenCount;
                  }
                }
              }

              // For now, assume all output is text since Gemini doesn't provide output breakdown
              // This could be enhanced if Gemini provides output token details by modality
              outputTextTokens = outputTokenCount;

              setTokenUsage((usage) => {
                return {
                  model: "gemini-2.5-flash-native-audio" as const,
                  total_tokens: (usage?.total_tokens ?? 0) + totalTokenCount,
                  input_tokens: (usage?.input_tokens ?? 0) + promptTokenCount,
                  output_tokens: (usage?.output_tokens ?? 0) + outputTokenCount,
                  input_token_details: {
                    text_tokens:
                      (usage?.input_token_details?.text_tokens ?? 0) +
                      inputTextTokens,
                    audio_tokens:
                      (usage?.input_token_details?.audio_tokens ?? 0) +
                      inputAudioTokens,
                    cached_tokens: 0, // Gemini doesn't have cached tokens
                    cached_tokens_details: {
                      text_tokens: 0,
                      audio_tokens: 0,
                    },
                  },
                  output_token_details: {
                    text_tokens:
                      (usage?.output_token_details?.text_tokens ?? 0) +
                      outputTextTokens,
                    audio_tokens:
                      (usage?.output_token_details?.audio_tokens ?? 0) +
                      outputAudioTokens,
                  },
                };
              });
            }
          },
          onerror: (errorEvent: any) => {
            const errorMessage =
              errorEvent instanceof Error
                ? errorEvent.message
                : JSON.stringify(errorEvent);
            storeEvent(
              { type: "error_gemini_connection", detail: errorMessage },
              "internal",
            );
            stopSession();
          },
          onclose: (closeEvent: any) => {
            if (isSessionActive) {
              // Only if it was an unexpected close
              storeEvent(
                {
                  type: "info_gemini_connection_closed_unexpectedly",
                  detail: closeEvent,
                },
                "internal",
              );
              stopSession();
            } else {
              storeEvent(
                { type: "info_gemini_connection_closed", detail: closeEvent },
                "internal",
              );
            }
          },
        },
      });

      // Start audio capture
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: TARGET_SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      audioContextRef.current = new AudioContext({
        sampleRate: TARGET_SAMPLE_RATE,
      });
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      audioSourceRef.current = audioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current,
      );

      const workletBlob = new Blob([AudioRecordingWorklet], {
        type: "application/javascript",
      });
      const workletURL = URL.createObjectURL(workletBlob);
      await audioContextRef.current.audioWorklet.addModule(workletURL);
      URL.revokeObjectURL(workletURL); // Clean up blob URL

      audioWorkletNodeRef.current = new AudioWorkletNode(
        audioContextRef.current,
        "audio-processing-worklet",
      );

      audioWorkletNodeRef.current.port.onmessage = (event) => {
        if (event.data.eventType === "audioData" && liveSessionRef.current) {
          const audioDataBuffer = event.data.audioData; // This is an ArrayBuffer
          const base64AudioData = btoa(
            String.fromCharCode(...new Uint8Array(audioDataBuffer)),
          );

          try {
            if (sentChunksRef.current === 0) {
              // console.log("sending activity start");
              // liveSessionRef.current.sendRealtimeInput({
              //   activityStart: {},
              // });
            }
            sentChunksRef.current++;
            liveSessionRef.current.sendRealtimeInput({
              media: {
                data: base64AudioData,
                mimeType: `audio/pcm;rate=${TARGET_SAMPLE_RATE}`,
              },
            });
          } catch (sendError) {
            storeEvent(
              {
                type: "error_gemini_send_audio",
                detail: (sendError as Error).message,
              },
              "internal",
            );
          }
        }
      };

      audioSourceRef.current.connect(audioWorkletNodeRef.current);
      // The worklet node does not need to connect to destination if it only posts messages.
      // If you want to hear the audio (e.g., for loopback testing, connect to destination)
      // audioWorkletNodeRef.current.connect(audioContextRef.current.destination);

      setInterval(() => {
        if (liveSessionRef.current) {
          if (sentChunksRef.current > 0) {
            // console.log("sending activity end");
            // liveSessionRef.current.sendRealtimeInput({
            //   activityEnd: {},
            // });
            sentChunksRef.current = 0;
          }
        }
      }, 3000);

      setIsSessionActive(true);
      storeEvent({ type: "info_gemini_session_active" }, "internal");
    } catch (error) {
      console.error("Failed to start Gemini session:", error);
      storeEvent(
        {
          type: "error_gemini_session_start_failed",
          detail: (error as Error).message,
        },
        "internal",
      );
      await releaseWakeLock();
      // Clean up any partial setup
      if (liveSessionRef.current) liveSessionRef.current.close();
      if (mediaStreamRef.current)
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== "closed")
        await audioContextRef.current.close();
      liveSessionRef.current = null;
      mediaStreamRef.current = null;
      audioContextRef.current = null;
      audioSourceRef.current = null;
      audioWorkletNodeRef.current = null;
      setIsSessionActive(false);
    }
  };

  const stopSession = async () => {
    console.log("Stopping Gemini session...");
    storeEvent({ type: "info_gemini_session_stopping" }, "internal");

    setIsSessionActive(false); // Set immediately

    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.close();
      } catch (e) {
        storeEvent(
          { type: "error_gemini_session_close", detail: (e as Error).message },
          "internal",
        );
      }
      liveSessionRef.current = null;
    }

    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.onmessage = null;
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        await audioContextRef.current.close();
      } catch (e) {
        storeEvent(
          {
            type: "error_gemini_audiocontext_close",
            detail: (e as Error).message,
          },
          "internal",
        );
      }
      audioContextRef.current = null;
    }

    genAiClientRef.current = null;

    await releaseWakeLock();
    storeEvent({ type: "info_wake_lock_released" }, "internal");
    storeEvent({ type: "info_gemini_session_stopped" }, "internal");
  };

  // useEffect(() => {
  //   // This cleanup effect is intended to run when the component unmounts.
  //   // stopSession is memoized and should be stable.
  //   return () => {
  //     // Check liveSessionRef.current because isSessionActive might be stale
  //     // or the session might be partially set up when unmounting.
  //     // The stopSession function itself is idempotent and will handle actual state.
  //     if (liveSessionRef.current || isSessionActive) {
  //       // isSessionActive check is a fallback
  //       console.log(
  //         "useGeminiSession hook is unmounting, ensuring session (if any) is stopped.",
  //       );
  //       stopSession();
  //     }
  //   };
  // }, []); // Only depends on stopSession, which should be stable

  return {
    isSessionActive,
    events,
    translationSegments,
    tokenUsage, // Stubbed for Gemini
    startSession,
    stopSession,
    mediaStream: mediaStreamRef.current,
  };
}
