import { useCallback, useEffect, useRef, useState } from "react";
import { getTranslatorSessionUpdate } from "../translatorTool.js";
import { Language } from "../utils/languages.js";

// Represents the expected structure from the AI after JSON.parse
// It will have dynamic keys based on language codes.
interface ParsedTranslationPayload {
  speaker: number;
  [langCode: string]: string | number; // Accommodates speaker and dynamic lang codes as strings
}

export interface TranslationSegment {
  id: string;
  speaker: number;
  translations: Record<string, string>; // Stores translations as { "en": "Hello", "es": "Hola" }
  language1: Language; // The first language selected by the user
  language2: Language; // The second language selected by the user
}

interface OpenAIEvent {
  type: string;
  timestamp?: string;
  event_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  _direction?: "sent" | "received" | "internal";
}

export function useOpenAISession(
  apiKey: string | null,
  currentLanguage1: Language,
  currentLanguage2: Language,
) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState<OpenAIEvent[]>([]);
  const [translationSegments, setTranslationSegments] = useState<
    TranslationSegment[]
  >([]);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const lastTextRef = useRef("");

  const storeEvent = useCallback(
    (
      eventDataOrObject: string | object,
      direction: "sent" | "received" | "internal",
    ) => {
      let event: OpenAIEvent;
      if (typeof eventDataOrObject === "string") {
        try {
          event = JSON.parse(eventDataOrObject) as OpenAIEvent;
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
        event = eventDataOrObject as OpenAIEvent;
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
        console.error(
          "Error parsing translation JSON from event.part.text:",
          error,
          "Text was:",
          text,
        );
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
          speaker: speaker as number,
          translations: langTranslations as Record<string, string>,
          language1: currentLanguage1,
          language2: currentLanguage2,
        };
        setTranslationSegments((prev) => [...prev, newSegment]);
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
    (
      message: Omit<OpenAIEvent, "timestamp" | "event_id" | "_direction"> & {
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
    );
    storeEvent(
      {
        type: "info_session_starting",
        languages: [currentLanguage1.name, currentLanguage2.name],
      },
      "internal",
    );
    setIsSessionActive(false);
    setEvents([]);
    lastTextRef.current = "";

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
            model: "gpt-4o-realtime-preview-2024-12-17",
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
          event.part?.type === "text"
        ) {
          processIncomingEventText(event.part.text);
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
    }
  }, [
    apiKey,
    isSessionActive,
    sendClientEvent,
    storeEvent,
    processIncomingEventText,
    currentLanguage1, // Add language dependencies
    currentLanguage2,
  ]);

  const stopSession = useCallback(() => {
    console.log("Stopping session...");
    storeEvent({ type: "info_session_stopping" }, "internal");

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
  }, [storeEvent]);

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
    startSession,
    stopSession,
    sendClientEvent,
  };
}
