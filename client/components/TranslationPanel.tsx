import { useEffect } from "react";

export default function TranslationPanel({
  isSessionActive,
  english,
  chinese,
}: {
  isSessionActive: boolean;
  english: string;
  chinese: string;
}) {
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
    <>
      <h2 className="text-lg font-bold dark:text-white">
        English/Simplified Chinese Translator
      </h2>
      {english.length > 0 || chinese.length > 0 ? (
        <div className="space-y-3 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
            <p className="font-semibold dark:text-white">Translation:</p>
            <p
              className="dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: english }}
            />
            <p
              className="dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: chinese }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-gray-600 dark:text-gray-400 italic">
          Speak in English or Simplified Chinese to see the translation...
        </p>
      )}
    </>
  );
}

export function getSpeakerColor(speaker: number) {
  const colors = [
    "#4A90E2",
    "#50E3C2",
    "#F5A623",
    "#9013FE",
    "#417505",
    "#8B572A",
  ];
  return colors[speaker % colors.length];
}
