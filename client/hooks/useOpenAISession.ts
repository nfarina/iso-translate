import { useCallback, useEffect, useRef, useState } from "react";
import { getTranslatorSessionUpdate } from "../translatorTool.js";
import { Language } from "../utils/languages.js";
import { ModelOption, TokenUsage } from "../utils/models.js";
import { Session, SessionEvent, TranslationSegment } from "../utils/session.js";
import { useLocalStorage } from "../utils/useLocalStorage.js";
import { useWakeLock } from "./useWakeLock.js";

// Represents the expected structure from the AI after JSON.parse
// It will have dynamic keys based on language codes.
interface ParsedTranslationPayload {
  speaker: number;
  [langCode: string]: string | number; // Accommodates speaker and dynamic lang codes as strings
}

// Using shared types from models.ts

export function useOpenAISession(
  apiKey: string | null,
  currentLanguage1: Language,
  currentLanguage2: Language,
  modelName: ModelOption = "gpt-4o-mini-realtime-preview",
): Session {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [translationSegments, setTranslationSegments] = useLocalStorage<
    TranslationSegment[]
  >("translationSegments", []);
  const [tokenUsage, setTokenUsage] = useLocalStorage<TokenUsage | null>(
    "tokenUsage",
    null,
  );

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const lastTextRef = useRef("");

  // Use the new wake lock hook
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const storeEvent = useCallback(
    (
      eventDataOrObject: string | object,
      direction: "sent" | "received" | "internal",
    ) => {
      let event: SessionEvent;
      if (typeof eventDataOrObject === "string") {
        try {
          event = JSON.parse(eventDataOrObject) as SessionEvent;
        } catch (error) {
          console.error(
            "Error parsing event JSON:",
            error,
            "Raw data:",
            eventDataOrObject,
          );
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
      setEvents((prev) => [event, ...prev]);
      return event;
    },
    [],
  );

  const processIncomingEventText = useCallback(
    (text: string) => {
      if (text === lastTextRef.current) {
        return;
      }
      lastTextRef.current = text;

      let parsed: ParsedTranslationPayload | null = null;
      try {
        parsed = JSON.parse(text) as ParsedTranslationPayload;
      } catch (error) {
        // console.error(
        //   "Error parsing translation JSON from event.part.text:",
        //   error,
        //   "Text was:",
        //   text,
        // );
        storeEvent(
          {
            type: "error_parsing_translation",
            message: (error as Error).message,
            text_payload: text,
          },
          "internal",
        );
        return;
      }

      if (
        parsed &&
        typeof parsed.speaker === "number" &&
        parsed[currentLanguage1.code] !== undefined && // Check if expected lang codes are present
        parsed[currentLanguage2.code] !== undefined
      ) {
        const { speaker, ...langTranslations } = parsed;
        const newSegment: TranslationSegment = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          speaker: speaker as number,
          translations: langTranslations as Record<string, string>,
          language1: currentLanguage1,
          language2: currentLanguage2,
        };
        setTranslationSegments((prev) => {
          return [...prev, newSegment];
        });
      } else {
        console.warn(
          "Parsed translation object is not in the expected format or missing language keys:",
          parsed,
          "Expected codes:",
          currentLanguage1.code,
          currentLanguage2.code,
        );
        storeEvent(
          {
            type: "warn_invalid_translation_format",
            payload: parsed,
            expectedCodes: [currentLanguage1.code, currentLanguage2.code],
          },
          "internal",
        );
      }
    },
    [storeEvent, currentLanguage1, currentLanguage2], // Add language dependencies
  );

  const sendClientEvent = useCallback(
    async (
      message: Omit<SessionEvent, "timestamp" | "event_id" | "_direction"> & {
        event_id?: string;
      },
    ) => {
      if (
        dataChannelRef.current &&
        dataChannelRef.current.readyState === "open"
      ) {
        const eventToSend = { ...message };
        if (!eventToSend.event_id) {
          eventToSend.event_id = `c_${crypto.randomUUID()}`;
        }

        const messageString = JSON.stringify(eventToSend);
        dataChannelRef.current.send(messageString);
        storeEvent(eventToSend, "sent");
      } else {
        console.error(
          "Failed to send message - data channel not available or not open",
          message,
        );
        storeEvent(
          {
            type: "error_sending_message",
            message: "Data channel not available or not open.",
            payload: message,
          },
          "internal",
        );
      }
    },
    [storeEvent],
  );

  const startSession = useCallback(async () => {
    setEvents([]);

    if (!apiKey) {
      console.error("API key is not available. Cannot start session.");
      storeEvent(
        { type: "error_session_start", message: "API key not available." },
        "internal",
      );
      return;
    }
    if (isSessionActive || peerConnectionRef.current) {
      console.warn("Session is already active or starting.");
      return;
    }

    console.log(
      "Attempting to start session with languages:",
      currentLanguage1.name,
      currentLanguage2.name,
      "and model:",
      modelName,
    );
    storeEvent(
      {
        type: "info_session_starting",
        languages: [currentLanguage1.name, currentLanguage2.name],
        model: modelName,
      },
      "internal",
    );
    setIsSessionActive(false);
    lastTextRef.current = "";

    // Request wake lock to keep screen on during the session
    await requestWakeLock();
    storeEvent({ type: "info_wake_lock_acquired" }, "internal");

    try {
      const tokenResponse = await fetch(
        "https://api.openai.com/v1/realtime/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            voice: "verse",
          }),
        },
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse
          .json()
          .catch(() => ({ message: "Failed to parse error response" }));
        const errorMessage = `Failed to get ephemeral key: ${
          errorData.message || tokenResponse.statusText
        }`;
        console.error(
          "Failed to get ephemeral key:",
          tokenResponse.status,
          errorData,
        );
        storeEvent(
          {
            type: "error_session_start",
            message: errorMessage,
            detail: errorData,
          },
          "internal",
        );
        throw new Error(errorMessage);
      }

      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
        audioElementRef.current.autoplay = true;
      }
      pc.ontrack = (e) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, mediaStream));

      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      dc.onopen = () => {
        console.log("Data channel opened.");
        storeEvent({ type: "info_datachannel_open" }, "internal");
        setIsSessionActive(true);
        setEvents((prev) =>
          prev.filter(
            (e) =>
              e.type === "info_datachannel_open" ||
              e.type === "info_session_starting",
          ),
        );
        lastTextRef.current = "";
        // Send the dynamically generated translator session update
        sendClientEvent(
          getTranslatorSessionUpdate(currentLanguage1, currentLanguage2),
        );
      };

      dc.onmessage = (e) => {
        const event = storeEvent(e.data as string, "received");
        if (
          event &&
          event.type === "response.content_part.done" &&
          event.output_index === 0 &&
          event.part?.type === "text"
        ) {
          processIncomingEventText(event.part.text);
        } else if (event && event.type === "response.done") {
          console.log("Token usage:", event.response.usage);
          setTokenUsage((usage) => {
            return {
              model: modelName,
              total_tokens:
                (usage?.total_tokens ?? 0) + event.response.usage.total_tokens,
              input_tokens:
                (usage?.input_tokens ?? 0) + event.response.usage.input_tokens,
              output_tokens:
                (usage?.output_tokens ?? 0) +
                event.response.usage.output_tokens,
              input_token_details: {
                audio_tokens:
                  (usage?.input_token_details?.audio_tokens ?? 0) +
                  event.response.usage.input_token_details.audio_tokens,
                cached_tokens:
                  (usage?.input_token_details?.cached_tokens ?? 0) +
                  event.response.usage.input_token_details.cached_tokens,
                text_tokens:
                  (usage?.input_token_details?.text_tokens ?? 0) +
                  event.response.usage.input_token_details.text_tokens,
                cached_tokens_details: {
                  audio_tokens:
                    (usage?.input_token_details?.cached_tokens_details
                      ?.audio_tokens ?? 0) +
                    event.response.usage.input_token_details
                      .cached_tokens_details.audio_tokens,
                  text_tokens:
                    (usage?.input_token_details?.cached_tokens_details
                      ?.text_tokens ?? 0) +
                    event.response.usage.input_token_details
                      .cached_tokens_details.text_tokens,
                },
              },
              output_token_details: {
                audio_tokens:
                  (usage?.output_token_details?.audio_tokens ?? 0) +
                  event.response.usage.output_token_details.audio_tokens,
                text_tokens:
                  (usage?.output_token_details?.text_tokens ?? 0) +
                  event.response.usage.output_token_details.text_tokens,
              },
            };
          });
        }
      };

      dc.onclose = () => {
        console.log("Data channel closed.");
        storeEvent({ type: "info_datachannel_closed" }, "internal");
      };
      dc.onerror = (err) => {
        console.error("Data channel error:", err);
        storeEvent({ type: "error_datachannel", detail: err }, "internal");
      };

      pc.onconnectionstatechange = () => {
        console.log("Peer connection state:", pc.connectionState);
        storeEvent(
          {
            type: "info_peerconnection_statechange",
            state: pc.connectionState,
          },
          "internal",
        );
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected" ||
          pc.connectionState === "closed"
        ) {
          if (isSessionActive) {
            setIsSessionActive(false); // Rely on stopSession for full cleanup, this handles unexpected drops
          }
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse
          .text()
          .catch(() => "Failed to parse SDP error response");
        const errorMessage = `Failed to get SDP answer: ${sdpResponse.statusText} - ${errorText}`;
        console.error(
          "Failed to get SDP answer:",
          sdpResponse.status,
          errorText,
        );
        storeEvent(
          {
            type: "error_session_start",
            message: errorMessage,
            detail: errorText,
          },
          "internal",
        );
        throw new Error(errorMessage);
      }

      const answerSdp = await sdpResponse.text();
      const answer = {
        type: "answer",
        sdp: answerSdp,
      } as RTCSessionDescriptionInit;
      await pc.setRemoteDescription(answer);

      console.log(
        "Session negotiation complete. Waiting for data channel to open.",
      );
    } catch (error) {
      console.error("Failed to start session:", error);
      setIsSessionActive(false);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      dataChannelRef.current = null;

      // Release wake lock if session failed to start
      await releaseWakeLock();
      storeEvent({ type: "info_wake_lock_released" }, "internal");
    }
  }, [
    apiKey,
    isSessionActive,
    sendClientEvent,
    storeEvent,
    processIncomingEventText,
    currentLanguage1,
    currentLanguage2,
    requestWakeLock,
    releaseWakeLock,
    modelName,
  ]);

  const stopSession = useCallback(async () => {
    console.log("Stopping session...");
    storeEvent({ type: "info_session_stopping" }, "internal");

    // Release wake lock when session stops
    releaseWakeLock().then(() => {
      storeEvent({ type: "info_wake_lock_released" }, "internal");
    });

    if (dataChannelRef.current) {
      dataChannelRef.current.onopen = null;
      dataChannelRef.current.onmessage = null;
      dataChannelRef.current.onclose = null;
      dataChannelRef.current.onerror = null;
      if (dataChannelRef.current.readyState === "open") {
        dataChannelRef.current.close();
      }
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;

      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      if (peerConnectionRef.current.signalingState !== "closed") {
        peerConnectionRef.current.close();
      }
      peerConnectionRef.current = null;
    }

    if (audioElementRef.current && audioElementRef.current.srcObject) {
      const stream = audioElementRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      audioElementRef.current.srcObject = null;
    }

    setIsSessionActive(false);
    lastTextRef.current = "";
    console.log("Session stopped.");
    storeEvent({ type: "info_session_stopped" }, "internal");
  }, [storeEvent, releaseWakeLock]);

  useEffect(() => {
    return () => {
      console.log("useOpenAISession unmounting, ensuring session is stopped.");
      stopSession();
      if (audioElementRef.current && audioElementRef.current.parentNode) {
        audioElementRef.current.parentNode.removeChild(audioElementRef.current);
        audioElementRef.current = null;
      }
    };
  }, [stopSession]);

  return {
    isSessionActive,
    events,
    translationSegments,
    tokenUsage,
    startSession,
    stopSession,
  };
}
