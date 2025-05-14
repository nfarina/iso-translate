import { useEffect } from "react";
import { TranslationSegment } from "../hooks/useOpenAISession";
import { getSpeakerColor } from "../utils/colorUtils";

interface TranslationPanelProps {
  isSessionActive: boolean;
  translationSegments: TranslationSegment[];
  language1Name: string;
  language2Name: string;
}

export default function TranslationPanel({
  isSessionActive,
  translationSegments,
  language1Name, // Added to display correct placeholder
  language2Name,  // Added to display correct placeholder
}: TranslationPanelProps) {

  useEffect(() => {
    // The hook now clears translationSegments on stopSession and on startSession.
    // No specific local state to clear here based on isSessionActive for now.
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
                <span className="font-semibold">{segment.language1.name}:</span>{" "}
                {segment.translations[segment.language1.code] || "..."}
              </p>
              <p className="text-gray-700 dark:text-gray-300 ml-1">
                <span className="font-semibold">{segment.language2.name}:</span>{" "}
                {segment.translations[segment.language2.code] || "..."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400 italic text-center">
            {isSessionActive
              ? `Listening... Speak to see translations into ${language1Name} and ${language2Name}.`
              : "Select languages and start a session to begin translation."}
          </p>
        </div>
      )}
    </>
  );
}
