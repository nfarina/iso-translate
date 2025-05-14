import { useEffect, useState } from "react";
import { useOpenAISession } from "../hooks/useOpenAISession";
import ApiKeyInput from "./ApiKeyInput";
import Button from "./Button";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import TranslationPanel from "./TranslationPanel";
import logo from "/assets/logo-horizontal.png";
import LanguageSelector from "./LanguageSelector";
import { Language, DEFAULT_LANGUAGE_1, DEFAULT_LANGUAGE_2, findLanguageByCode } from "../utils/languages";

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("openai_api_key")
      : null,
  );
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  const [language1, setLanguage1] = useState<Language>(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE_1;
    const storedLang1Code = localStorage.getItem("selected_language_1_code");
    return findLanguageByCode(storedLang1Code) || DEFAULT_LANGUAGE_1;
  });
  const [language2, setLanguage2] = useState<Language>(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE_2;
    const storedLang2Code = localStorage.getItem("selected_language_2_code");
    return findLanguageByCode(storedLang2Code) || DEFAULT_LANGUAGE_2;
  });

  const {
    isSessionActive,
    events,
    translationSegments,
    startSession,
    stopSession,
  } = useOpenAISession(apiKey, language1, language2); // Pass selected languages

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_language_1_code", language1.code);
    }
  }, [language1]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_language_2_code", language2.code);
    }
  }, [language2]);

  useEffect(() => {
    if (!apiKey && isSessionActive) {
      stopSession();
    }
  }, [apiKey, isSessionActive, stopSession]);

  const handleKeySaved = (key: string) => {
    const newApiKey = key.trim() || null;
    setApiKey(newApiKey);
    if (newApiKey) {
      localStorage.setItem("openai_api_key", newApiKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }
    setEditingApiKey(false);
  };

  function renderHeader() {
    return (
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center safe-top bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="flex items-center gap-4 w-full mx-4">
          <img
            style={{ width: "100px", height: "auto" }}
            src={logo}
            alt="Iso Translate Logo"
          />
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={() => setShowEvents(!showEvents)}
              className={`p-2 ${
                showEvents
                  ? "bg-blue-100 dark:bg-blue-700 !text-blue-600 dark:!text-blue-300"
                  : "!text-gray-500 hover:!text-gray-900 dark:hover:!text-gray-300"
              } bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md`}
              title={showEvents ? "Show Translations" : "Show Event Log"}
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
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </Button>
            <Button
              onClick={() => {
                setEditingApiKey(!editingApiKey);
                if (showEvents && !editingApiKey) setShowEvents(false);
              }}
              className={`p-2 ${
                editingApiKey
                  ? "bg-blue-100 dark:bg-blue-700 !text-blue-600 dark:!text-blue-300"
                  : "!text-gray-500 hover:!text-gray-900 dark:hover:!text-gray-300"
              } bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md`}
              title="API Key Settings"
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

  function renderContentBody() {
    if (editingApiKey) {
      return <ApiKeyInput onKeySaved={handleKeySaved} />;
    }
    if (!apiKey) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-6 max-w-md text-center shadow-lg">
            <h2 className="text-lg font-bold mb-4 dark:text-white">
              Welcome to Iso Translate
            </h2>
            <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Please click the key icon{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline-block -mt-1 align-middle"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>{" "}
                in the top-right corner to add your OpenAI API key.
              </p>
            </div>
          </div>
        </div>
      );
    }
    // API key exists, show main app UI
    if (showEvents) {
      return <EventLog events={events} />;
    }
    return (
      <>
        {!isSessionActive && (
            <LanguageSelector
                currentLanguage1={language1}
                onLanguage1Change={setLanguage1}
                currentLanguage2={language2}
                onLanguage2Change={setLanguage2}
                isSessionActive={isSessionActive}
            />
        )}
        <TranslationPanel
          translationSegments={translationSegments}
          isSessionActive={isSessionActive}
          language1Name={language1.name}
          language2Name={language2.name}
        />
      </>
    );
  }

  return (
    <main className="absolute inset-0 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      {renderHeader()}
      <div className="flex-grow overflow-y-auto p-4 pt-20">
        {" "}
        {renderContentBody()}
      </div>
      {apiKey &&
        !editingApiKey && ( 
          <div className="p-4 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              isSessionActive={isSessionActive}
            />
          </div>
        )}
    </main>
  );
}
