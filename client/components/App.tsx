import { startTransition, useEffect, useState } from "react";
import { Code, Globe, Key } from "react-feather";
import { useOpenAISession } from "../hooks/useOpenAISession";
import {
  DEFAULT_LANGUAGE_1,
  DEFAULT_LANGUAGE_2,
  Language,
} from "../utils/languages";
import { useLocalStorage } from "../utils/useLocalStorage";
import ApiKeyInput from "./ApiKeyInput";
import Button from "./Button";
import EventLog from "./EventLog";
import LanguageSelector from "./LanguageSelector";
import SessionControls from "./SessionControls";
import TranslationPanel from "./TranslationPanel";
import logoWhite from "/assets/logo-horizontal-white.png";
import logo from "/assets/logo-horizontal.png";

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage<string | null>(
    "App:apiKey",
    null,
  );
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(prefers-color-scheme: dark)").matches ||
      document.documentElement.classList.contains("dark")
    );
  });

  // Listen for changes in system preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const [language1, setLanguage1] = useLocalStorage<Language>(
    "App:language1",
    DEFAULT_LANGUAGE_1,
  );
  const [language2, setLanguage2] = useLocalStorage<Language>(
    "App:language2",
    DEFAULT_LANGUAGE_2,
  );

  const {
    isSessionActive,
    events,
    translationSegments,
    startSession,
    stopSession,
  } = useOpenAISession(apiKey, language1, language2); // Pass selected languages

  useEffect(() => {
    if (!apiKey && isSessionActive) {
      stopSession();
    }
  }, [apiKey, isSessionActive, stopSession]);

  function renderHeader() {
    return (
      <nav className="flex flex-col bg-white dark:bg-gray-800 shadow-xs z-10">
        <div className="flex items-center gap-4 mx-4 min-w-max">
          <img
            style={{ width: "100px", height: "auto" }}
            src={isDarkMode ? logoWhite : logo}
            alt="Iso Translate Logo"
          />
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={() =>
                startTransition(() => {
                  setShowLanguageSelector(!showLanguageSelector);
                })
              }
              className={`p-1 px-2 ${
                showLanguageSelector
                  ? "bg-blue-100 dark:bg-blue-700 !text-blue-600 dark:!text-blue-300"
                  : "!text-gray-500 hover:!text-gray-900 dark:hover:!text-gray-300"
              } bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md`}
              title={
                showLanguageSelector
                  ? "Hide Language Selector"
                  : "Show Language Selector"
              }
            >
              <Globe size={20} />
            </Button>
            <Button
              onClick={() => {
                setShowEvents(!showEvents);
                setEditingApiKey(false);
              }}
              className={`p-1 px-2 ${
                showEvents
                  ? "bg-blue-100 dark:bg-blue-700 !text-blue-600 dark:!text-blue-300"
                  : "!text-gray-500 hover:!text-gray-900 dark:hover:!text-gray-300"
              } bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md`}
              title={showEvents ? "Show Translations" : "Show Event Log"}
            >
              <Code size={20} />
            </Button>
            <Button
              onClick={() => {
                setEditingApiKey(!editingApiKey);
                setShowEvents(false);
              }}
              className={`p-1 px-2 ${
                editingApiKey
                  ? "bg-blue-100 dark:bg-blue-700 !text-blue-600 dark:!text-blue-300"
                  : "!text-gray-500 hover:!text-gray-900 dark:hover:!text-gray-300"
              } bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md`}
              title="API Key Settings"
            >
              <Key size={20} />
            </Button>
          </div>
        </div>
        {!isSessionActive && showLanguageSelector && (
          <div className="flex pb-2 px-2 bg-white dark:bg-gray-800 shadow-xs">
            <LanguageSelector
              currentLanguage1={language1}
              onLanguage1Change={setLanguage1}
              currentLanguage2={language2}
              onLanguage2Change={setLanguage2}
              isSessionActive={isSessionActive}
            />
          </div>
        )}
      </nav>
    );
  }

  function renderContentBody() {
    if (editingApiKey) {
      return (
        <div className="flex-grow flex items-center justify-center h-full">
          <ApiKeyInput />
        </div>
      );
    }
    if (!apiKey) {
      return (
        <div className="flex-grow flex items-center justify-center h-full">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-6 max-w-md text-center shadow-lg">
            <h2 className="text-lg font-bold mb-4 dark:text-white">
              Welcome to Iso Translate
            </h2>
            <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Please click the key icon{" "}
                <Key size={16} className="inline-block -mt-1 align-middle" /> in
                the top-right corner to add your OpenAI API key.
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
      <TranslationPanel
        translationSegments={translationSegments}
        isSessionActive={isSessionActive}
        language1={language1}
        language2={language2}
      />
    );
  }

  return (
    <main className="flex flex-col min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {renderHeader()}
      <div className="h-0 flex-grow p-3 flex flex-col">
        {renderContentBody()}
      </div>
      {apiKey && !editingApiKey && (
        <div
          className="footer p-4 bg-gray-100 dark:bg-gray-700 bg-white dark:bg-gray-800 flex-shrink-0"
          style={{
            boxShadow: "0 -1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
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
