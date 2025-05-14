import { useEffect, useRef, useState } from "react";
import logo from "/assets/logo-horizontal.png";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import TranslationPanel, { getSpeakerColor } from "./TranslationPanel";
import { translatorSessionUpdate } from "../translatorTool.js";
import ApiKeyInput from "./ApiKeyInput";
import Button from "./Button";

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const eventsRef = useRef(null);
  const [apiKey, setApiKey] = useState(() =>
    localStorage?.getItem("openai_api_key"),
  );
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  const handleKeySaved = (key) => {
    setApiKey(key);
    localStorage.setItem("openai_api_key", key);
    setEditingApiKey(false);
  };

  async function startSession() {
    try {
      // Generate token client-side using the API key from localStorage
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

      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // Create a peer connection
      const pc = new RTCPeerConnection();

      // Set up to play remote audio from the model
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events");
      setDataChannel(dc);

      // Start the session using the Session Description Protocol (SDP)
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

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }

    peerConnection.current.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }

  // Send a message to the model
  function sendClientEvent(message) {
    if (dataChannel) {
      const timestamp = new Date().toLocaleTimeString();
      message.event_id = message.event_id || crypto.randomUUID();

      // send event before setting timestamp since the backend peer doesn't expect this field
      dataChannel.send(JSON.stringify(message));

      // if guard just in case the timestamp exists by miracle
      if (!message.timestamp) {
        message.timestamp = timestamp;
      }
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  // Send a text message to the model
  function sendTextMessage(message) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create", modalities: ["text"] });
  }

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        if (!event.timestamp) {
          event.timestamp = new Date().toLocaleTimeString();
        }

        setEvents((prev) => [event, ...prev]);
        eventsRef.current.addEvent(event);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
        // Send the translator session update
        sendClientEvent(translatorSessionUpdate);
      });
    }
  }, [dataChannel]);

  const lastText = useRef("");
  const [english, setEnglish] = useState("");
  const [chinese, setChinese] = useState("");

  function processEvent(event) {
    if (
      event.type === "response.content_part.done" &&
      event.part.type === "text"
    ) {
      // We get duplicate events for some reason, so we just ignore them.
      if (event.part.text === lastText.current) {
        return;
      }

      lastText.current = event.part.text;
      let parsed = null;

      try {
        parsed = JSON.parse(event.part.text);
      } catch (error) {
        console.error("Error parsing translation:", error);
        return;
      }

      setEnglish((existing) => {
        const speaker = parsed.speaker;
        const newEnglish = parsed.english;
        // The first part of the new text may be duplicated as the last part
        // of the existing text, so we need to remove the last part of the existing text
        // if it is the same as the first part of the new text
        if (existing.endsWith(newEnglish)) {
          return existing.slice(0, -newEnglish.length);
        }
        return (
          existing +
          " " +
          `<div style="color: ${getSpeakerColor(speaker)}">${newEnglish}</div>`
        );
      });
      setChinese((existing) => {
        const speaker = parsed.speaker;
        const newChinese = parsed.chinese;
        // The first part of the new text may be duplicated as the last part
        // of the existing text, so we need to remove the last part of the existing text
        // if it is the same as the first part of the new text
        if (existing.endsWith(newChinese)) {
          return existing.slice(0, -newChinese.length);
        }
        return (
          existing +
          " " +
          `<div style="color: ${getSpeakerColor(speaker)}">${newChinese}</div>`
        );
      });
    }
  }

  function renderHeader() {
    return (
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center safe-top bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4 w-full m-4 pb-2">
          <img style={{ width: "100px" }} src={logo} />
          {/* <h1>Iso Translate</h1> */}
          <div className="ml-auto flex items-center">
            {/* Console/Events toggle button */}
            <Button
              onClick={() => setShowEvents(!showEvents)}
              className={`p-1 ${
                showEvents ? "!text-blue-500" : "!text-gray-500"
              } hover:text-gray-900 dark:hover:text-gray-300 bg-transparent mr-2`}
              title={showEvents ? "Show Translation" : "Show Events"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
            </Button>
            <Button
              onClick={() => setEditingApiKey(!editingApiKey)}
              className={`p-1 !text-gray-500 ${
                editingApiKey
                  ? "!text-blue-500"
                  : "hover:text-gray-900 dark:hover:text-gray-300"
              } bg-transparent`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  function renderContent() {
    if (editingApiKey) {
      return (
        <>
          {renderHeader()}
          <div className="mt-16 p-1">
            <ApiKeyInput onKeySaved={handleKeySaved} />
          </div>
        </>
      );
    }

    if (!apiKey) {
      return (
        <>
          {renderHeader()}
          <div className="mt-16 p-1 flex items-center justify-center">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-6 max-w-md">
              <h2 className="text-lg font-bold mb-4 dark:text-white">
                Welcome to Iso Translate
              </h2>
              <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Please click the key icon in the upper-right corner to add
                  your OpenAI API key to get started.
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        {renderHeader()}
        <div className="flex flex-col w-full h-full overflow-hidden">
          <div className="flex-grow flex mt-16">
            {showEvents ? (
              <div className="flex-grow p-1 overflow-auto">
                <EventLog events={events} />
              </div>
            ) : (
              <div className="flex-grow p-1 overflow-auto">
                <TranslationPanel
                  english={english}
                  chinese={chinese}
                  isSessionActive={isSessionActive}
                  eventsRef={eventsRef}
                />
              </div>
            )}
          </div>
          <div className="p-1 bg-gray-100 dark:bg-gray-700">
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              sendClientEvent={sendClientEvent}
              sendTextMessage={sendTextMessage}
              serverEvents={events.filter((e) => e.type === "server")}
              isSessionActive={isSessionActive}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <main className="absolute top-0 left-0 right-0 bottom-0 safe-bottom dark:bg-gray-900">
      {renderContent()}
    </main>
  );
}
