import { useEffect, useState, useImperativeHandle, useRef } from "react";

function TranslationOutput({ english, spanish }) {
  return (
    <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-2">
      <p className="font-semibold">Translation:</p>
      <p dangerouslySetInnerHTML={{ __html: english }} />
      <p dangerouslySetInnerHTML={{ __html: spanish }} />
    </div>
  );
}

export default function ToolPanel({
  isSessionActive,
  eventsRef,
}) {
  const lastText = useRef("");

  useImperativeHandle(eventsRef, () => ({
    addEvent: (event) => {
      if (event.type === "response.content_part.done" && event.part.type === "text") {
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

        setEnglish(existing => {
          const speaker = parsed.speaker;
          const newEnglish = parsed.english;
          // The first part of the new text may be duplicated as the last part
          // of the existing text, so we need to remove the last part of the existing text
          // if it is the same as the first part of the new text
          if (existing.endsWith(newEnglish)) {
            return existing.slice(0, -newEnglish.length);
          }
          return existing + " " + `<div style="color: ${getSpeakerColor(speaker)}">${newEnglish}</div>`;
        });
        setSpanish(existing => {
          const speaker = parsed.speaker;
          const newSpanish = parsed.spanish;
          // The first part of the new text may be duplicated as the last part
          // of the existing text, so we need to remove the last part of the existing text
          // if it is the same as the first part of the new text
          if (existing.endsWith(newSpanish)) {
            return existing.slice(0, -newSpanish.length);
          }
          return existing + " " + `<div style="color: ${getSpeakerColor(speaker)}">${newSpanish}</div>`;
        });
      }
    }
  }));
  const [english, setEnglish] = useState("");
  const [spanish, setSpanish] = useState("");

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

  useEffect(() => {
    if (!isSessionActive) {
      // setTranslations([]);
    }
  }, [isSessionActive]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold">English/Spanish Translator</h2>
        {english.length > 0 || spanish.length > 0 ? (
          <div className="space-y-3">
            <TranslationOutput english={english} spanish={spanish} />
          </div>
          ) : (
            <p>Speak in English or Spanish to see the translation...</p>
          )
        }
      </div>
    </section>
  );
} 

function getSpeakerColor(speaker) {
  const colors = ["#4A90E2", "#50E3C2", "#F5A623", "#9013FE", "#417505", "#8B572A"];
  return colors[speaker % colors.length];
}