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
  language1Name,
  language2Name,
}: TranslationPanelProps) {
  useEffect(() => {
    // The hook now clears translationSegments on stopSession and on startSession.
    // No specific local state to clear here based on isSessionActive for now.
  }, [isSessionActive]);

  return (
    <>
      {isSessionActive || translationSegments.length > 0 ? (
        <div className="flex-grow flex flex-col h-full space-y-3">
          {/* First language box */}
          <div className="flex-1 p-2 rounded-md bg-white dark:bg-gray-800 shadow overflow-y-auto">
            <div className="flex flex-col-reverse space-y-reverse space-y-2">
              {translationSegments.map((segment) => (
                <div key={`${segment.id}-lang1`} className="ml-1">
                  <p
                    className="text-gray-700 dark:text-gray-300"
                    style={{ color: getSpeakerColor(segment.speaker) }}
                  >
                    {segment.translations[segment.language1.code] || "..."}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Second language box */}
          <div className="flex-1 p-2 rounded-md bg-white dark:bg-gray-800 shadow overflow-y-auto">
            <div className="flex flex-col-reverse space-y-reverse space-y-2">
              {translationSegments.map((segment) => (
                <div key={`${segment.id}-lang2`} className="ml-1">
                  <p
                    className="text-gray-700 dark:text-gray-300"
                    style={{ color: getSpeakerColor(segment.speaker) }}
                  >
                    {segment.translations[segment.language2.code] || "..."}
                  </p>
                </div>
              ))}
            </div>
          </div>
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
