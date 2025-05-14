import { useCallback, useEffect, useRef, useState } from "react";
import { translatorSessionUpdate } from "../translatorTool.js";

// Define a basic structure for what we expect from the parsed JSON
interface ParsedTranslation {
  speaker: number;
  english: string;
  japanese: string;
}

export interface TranslationSegment extends ParsedTranslation {
  id: string;
}

// Basic event structure, can be expanded later
interface OpenAIEvent {
  type: string;
  timestamp?: string;
  event_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow other properties
}

export function useOpenAISession(apiKey: string | null) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState<OpenAIEvent[]>([]);
  const [translationSegments, setTranslationSegments] = useState<
    TranslationSegment[]
  >([]);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const lastTextRef = useRef(""); // For de-duping text events from OpenAI

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
            _direction: direction,
          };
        }
      } else {
        event = eventDataOrObject as OpenAIEvent;
      }

      if (!event.timestamp) {
        event.timestamp = new Date().toLocaleTimeString();
      }
      if (!event.event_id) {
        // Assign a generic event_id if one doesn't exist, useful for internally generated log messages
        event.event_id = `${direction}_${crypto.randomUUID()}`;
      }
      event._direction = direction; // For debugging aid in EventLog if needed
      setEvents((prev) => [event, ...prev]);
      return event;
    },
    [],
  );

  const processIncomingEventText = useCallback(
    (text: string) => {
      if (text === lastTextRef.current) {
        return; // Skip duplicate text
      }
      lastTextRef.current = text;

      let parsed: ParsedTranslation | null = null;
      try {
        parsed = JSON.parse(text) as ParsedTranslation;
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
        typeof parsed.english === "string" &&
        typeof parsed.japanese === "string"
      ) {
        const newSegment: TranslationSegment = {
          ...parsed,
          id: crypto.randomUUID(),
        };
        setTranslationSegments((prev) => [...prev, newSegment]);
      } else {
        console.warn(
          "Parsed translation object is not in the expected format:",
          parsed,
        );
        storeEvent(
          {
            type: "warn_invalid_translation_format",
            payload: parsed,
          },
          "internal",
        );
      }
    },
    [storeEvent],
  );

  const sendClientEvent = useCallback(
    (
      message: Omit<OpenAIEvent, "timestamp" | "event_id"> & {
        event_id?: string;
      },
    ) => {
      if (
        dataChannelRef.current &&
        dataChannelRef.current.readyState === "open"
      ) {
        const eventToSend = { ...message };
        if (!eventToSend.event_id) {
          eventToSend.event_id = `c_${crypto.randomUUID()}`; // Mark as client-originated
        }

        const messageString = JSON.stringify(eventToSend);
        dataChannelRef.current.send(messageString);
        storeEvent(eventToSend, "sent"); // Log the object we intended to send
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

    console.log("Attempting to start session...");
    storeEvent({ type: "info_session_starting" }, "internal");
    setIsSessionActive(false); // Reset states
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
        // Optionally append to body if needed for controls or debugging, though not strictly necessary for autoplay
        // document.body.appendChild(audioElementRef.current);
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
        // Clear events again, ensuring a fresh start for the active session
        setEvents((prev) =>
          prev.filter(
            (e) =>
              e.type === "info_datachannel_open" ||
              e.type === "info_session_starting",
          ),
        ); // Keep initial logs
        lastTextRef.current = "";
        sendClientEvent(translatorSessionUpdate);
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
        // setIsSessionActive(false); // This state change is typically managed by stopSession or connection failure
      };
      dc.onerror = (err) => {
        console.error("Data channel error:", err);
        storeEvent({ type: "error_datachannel", detail: err }, "internal");
      };

      pc.onicecandidate = (event) => {
        // Can be useful for debugging WebRTC connection issues
        // if (event.candidate) {
        //   console.log("ICE candidate:", event.candidate);
        // }
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
          // If the connection drops unexpectedly, ensure we reflect this
          if (isSessionActive) {
            // Only call stop if it was active, to avoid loops if stopSession itself causes this.
            // Call stopSession to clean up properly.
            // This might be redundant if stopSession is called elsewhere, but good for unexpected drops.
            // stopSession(); // Careful with direct calls here, might lead to race conditions.
            // Better to just set isSessionActive false, stopSession should handle cleanup.
            setIsSessionActive(false);
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
      // isSessionActive will be set true by dc.onopen
    } catch (error) {
      console.error("Failed to start session:", error);
      // storeEvent already called for specific errors, add a general one if missed
      // storeEvent({ type: "error_session_start_critical", message: (error as Error).message }, "internal");
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
    // audioElementRef.current can be kept for next session
    // If you want to remove it fully:
    // if (audioElementRef.current && audioElementRef.current.parentNode) {
    //   audioElementRef.current.parentNode.removeChild(audioElementRef.current);
    //   audioElementRef.current = null;
    // }

    setIsSessionActive(false);
    lastTextRef.current = "";
    // setEvents([]); // Optionally clear events, or keep them for review
    console.log("Session stopped.");
    storeEvent({ type: "info_session_stopped" }, "internal");
  }, [storeEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("useOpenAISession unmounting, ensuring session is stopped.");
      stopSession();
      // Fully remove audio element if it was added to DOM and should be cleaned up
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
    sendClientEvent, // Expose if other parts of app need to send custom events
  };
}
