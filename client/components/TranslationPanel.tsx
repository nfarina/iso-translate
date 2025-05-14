import { useEffect, useState } from "react";
import { TranslationSegment } from "../hooks/useOpenAISession";
import { getSpeakerColor, getSpeakerColorDark } from "../utils/colorUtils";
import { Language } from "../utils/languages";
import { compressTranslationSegments } from "../utils/merging";

interface TranslationPanelProps {
  isSessionActive: boolean;
  translationSegments: TranslationSegment[];
  language1: Language;
  language2: Language;
}

export default function TranslationPanel({
  isSessionActive,
  translationSegments,
  language1,
  language2,
}: TranslationPanelProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function renderTranslations(language: Language) {
    const compressedSegments = compressTranslationSegments(translationSegments);

    return [...compressedSegments].reverse().map((segment) => (
      <div key={`${segment.id}-lang1`} className="ml-1">
        <p
          className="text-gray-700 dark:text-gray-300"
          style={{
            color: isDarkMode
              ? getSpeakerColorDark(segment.speaker)
              : getSpeakerColor(segment.speaker),
          }}
        >
          {segment.translations[language.code] || "..."}
        </p>
      </div>
    ));
  }

  return (
    <>
      {isSessionActive || translationSegments.length > 0 ? (
        <div className="flex-grow flex flex-col h-full space-y-3 text-xl">
          {/* First language box */}
          <div className="flex-1 p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm overflow-y-auto flex flex-col-reverse">
            {translationSegments.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 italic">
                Waiting for {language1.name}...
              </p>
            )}
            {renderTranslations(language1)}
          </div>

          {/* Second language box */}
          <div className="flex-1 p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm overflow-y-auto flex flex-col-reverse">
            {translationSegments.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 italic">
                Waiting for {language2.name}...
              </p>
            )}
            {renderTranslations(language2)}
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400 italic text-center">
            {isSessionActive
              ? `Listening... Speak to see translations into ${language1.name} and ${language2.name}.`
              : "Select languages and start listening to begin translation."}
          </p>
        </div>
      )}
    </>
  );
}
