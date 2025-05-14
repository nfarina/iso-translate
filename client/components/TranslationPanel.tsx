import { useEffect } from "react";
import { TranslationSegment } from "../hooks/useOpenAISession";
import { getSpeakerColor } from "../utils/colorUtils";

interface TranslationPanelProps {
  isSessionActive: boolean;
  translationSegments: TranslationSegment[];
}

export default function TranslationPanel({
  isSessionActive,
  translationSegments,
}: TranslationPanelProps) {
  // The hook now clears translationSegments on stopSession and on startSession.
  // This useEffect might be redundant unless specific UI reset logic is needed here.
  useEffect(() => {
    if (!isSessionActive) {
      // If there was local state here to be cleared, this would be the place.
    }
  }, [isSessionActive]);

  return (
    <>
      <h2 className="text-lg font-bold dark:text-white mb-2">
        Translations
      </h2>
      {translationSegments.length > 0 ? (
        <div className="space-y-2">
          {translationSegments.map((segment) => (
            <div
              key={segment.id}
              className="p-3 rounded-md bg-white dark:bg-gray-800 shadow"
            >
              <p
                className="font-medium"
                style={{ color: getSpeakerColor(segment.speaker) }}
              >
                Speaker {segment.speaker + 1}
              </p>
              <p className="text-gray-700 dark:text-gray-300 ml-1">
                <span className="font-semibold">EN:</span> {segment.english}
              </p>
              <p className="text-gray-700 dark:text-gray-300 ml-1">
                <span className="font-semibold">JP:</span> {segment.japanese}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400 italic text-center">
            {isSessionActive
              ? "Listening... Speak in English or Japanese to see translations."
              : "Start a session to begin translation."}
          </p>
        </div>
      )}
    </>
  );
}
