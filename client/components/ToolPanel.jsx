import { useEffect, useState } from "react";

function TranslationOutput({ translation }) {
  return (
    <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-2">
      <p className="font-semibold">Translation:</p>
      <p>{translation}</p>
    </div>
  );
}

export default function ToolPanel({
  isSessionActive,
  events,
}) {
  const [translations, setTranslations] = useState([]);

  useEffect(() => {
    if (!events || events.length === 0) return;

    for (const event of events) {
      if (event.type === "response.content_part.done" &&
        event.part.type === "text") {
        console.log("event", event);
        console.log("event.part.text", event.part.text);
        setTranslations(prev => {
          if (!prev.includes(event.part.text)) {
            return [event.part.text, ...prev].slice(0, 10);
          }
          return prev;
        });
      }
    }
    // const mostRecentEvent = events[0];
    // console.log("mostRecentEvent", mostRecentEvent);
    // if (
    //   mostRecentEvent.type === "response.done" &&
    //   mostRecentEvent.response.output
    // ) {
    //   mostRecentEvent.response.output.forEach((output) => {
    //     if (
    //       output.type === "function_call" &&
    //       output.name === "transcribe"
    //     ) {
    //       try {
    //         const translationData = JSON.parse(output.arguments);
    //         if (translationData.text) {
    //           setTranslations(prev => [translationData.text, ...prev].slice(0, 10));
    //         }
    //       } catch (error) {
    //         console.error("Error parsing translation:", error);
    //       }
    //     }
    //   });
    // }
    // else if (
    //   mostRecentEvent.type === "response.content_part.done" &&
    //   mostRecentEvent.part.type === "text") {
    //     console.log("mostRecentEvent", mostRecentEvent);
    //     console.log("mostRecentEvent.part.text", mostRecentEvent.part.text);
    //   setTranslations(prev => [mostRecentEvent.part.text ?? "", ...prev].slice(0, 10));
    // }
  }, [events]);

  useEffect(() => {
    if (!isSessionActive) {
      setTranslations([]);
    }
  }, [isSessionActive]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold">English to Spanish Translator</h2>
        {isSessionActive ? (
          translations.length > 0 ? (
            <div className="space-y-3">
              {translations.map((translation, index) => (
                <TranslationOutput key={index} translation={translation} />
              ))}
            </div>
          ) : (
            <p>Speak in English to see the Spanish translation...</p>
          )
        ) : (
          <p>Start the session to use the translator...</p>
        )}
      </div>
    </section>
  );
} 