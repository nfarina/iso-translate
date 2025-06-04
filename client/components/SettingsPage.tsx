import { useRef, useState } from "react";
import { AlertTriangle, Code, RefreshCw, Zap } from "react-feather";
import { VERSION } from "../hooks/useVersionCheck";
import { ModelOption, TokenUsage } from "../utils/models";
import { useLocalStorage } from "../utils/useLocalStorage";
import Button from "./Button";

interface UpdateStatus {
  checking: boolean;
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
}

interface SettingsPageProps {
  onBack?: () => void;
  updateStatus: UpdateStatus;
  checkForUpdate: () => void;
}

export default function SettingsPage({
  onBack,
  updateStatus,
  checkForUpdate,
}: SettingsPageProps) {
  const [apiKey, setApiKey] = useLocalStorage<string | null>(
    "App:apiKey",
    null,
  );
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string | null>(
    "App:geminiApiKey",
    null,
  );
  const [model, setModel] = useLocalStorage<ModelOption>(
    "App:model",
    "gemini-2.5-flash-native-audio",
  );
  const [tokenUsage, setTokenUsage] = useLocalStorage<TokenUsage | null>(
    "useOpenAISession:tokenUsage",
    null,
  );
  const [showLogs, setShowLogs] = useLocalStorage<boolean>(
    "App:showLogs",
    false,
  );

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to truncate API key for display
  const getTruncatedApiKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 10) return key;

    const firstPart = key.substring(0, 5);
    const lastPart = key.substring(key.length - 5);
    return `${firstPart}...${lastPart}`;
  };

  // Handle model change and reset tokenUsage
  const handleModelChange = (newModel: ModelOption) => {
    setModel(newModel);
    if (tokenUsage) {
      setTokenUsage(null);
    }
  };

  return (
    <div className="flex flex-col p-3 h-full overflow-y-auto items-center">
      <div className="flex-grow" />
      <div className="bg-gray-50 dark:bg-gray-700 rounded-md w-full max-w-md p-4 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium dark:text-white">Settings</h2>
          <Button
            onClick={onBack}
            className="!bg-blue-500 hover:bg-blue-600 !text-white !px-4 !py-1"
          >
            Done
          </Button>
        </div>

        {/* API Key Section */}
        <div className="bg-white dark:bg-gray-800 p-4 flex flex-col gap-3 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
          <h3 className="text-md font-semibold dark:text-white">
            API key configuration
          </h3>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium dark:text-white">
              Gemini API Key
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {geminiApiKey
                ? "Your Gemini API key is configured."
                : "Enter your Gemini API key to use Gemini models."}
            </p>

            <div className="relative">
              <input
                type="text"
                value={
                  isFocused && inputRef.current?.dataset.type === "gemini"
                    ? geminiApiKey || ""
                    : geminiApiKey
                    ? getTruncatedApiKey(geminiApiKey)
                    : ""
                }
                onChange={(e) => setGeminiApiKey(e.target.value)}
                onFocus={(e) => {
                  setIsFocused(true);
                  e.target.dataset.type = "gemini";
                }}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your Gemini API key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-xs focus:outline-hidden focus:ring-3 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                autoComplete="off"
              />
              {geminiApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to clear your Gemini API key?",
                      )
                    ) {
                      setGeminiApiKey(null);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  aria-label="Clear Gemini API key"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium dark:text-white">
              OpenAI API Key
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {apiKey
                ? "Your OpenAI API key is configured."
                : "Enter your OpenAI API key to use OpenAI models."}
            </p>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={
                  isFocused && inputRef.current?.dataset.type === "openai"
                    ? apiKey || ""
                    : apiKey
                    ? getTruncatedApiKey(apiKey)
                    : ""
                }
                onChange={(e) => setApiKey(e.target.value)}
                onFocus={(e) => {
                  setIsFocused(true);
                  e.target.dataset.type = "openai";
                }}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your OpenAI API key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-xs focus:outline-hidden focus:ring-3 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                autoComplete="off"
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to clear your OpenAI API key?",
                      )
                    ) {
                      setApiKey(null);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  aria-label="Clear OpenAI API key"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Version Information Section */}
        <div className="bg-white dark:bg-gray-800 p-4 flex flex-col gap-3 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm overflow-hidden">
          <h3 className="text-md font-semibold dark:text-white flex items-center">
            App version
            {updateStatus.hasUpdate && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full ml-2"></span>
            )}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Current version: <span className="font-mono">{VERSION}</span>
            </p>
            <Button
              onClick={checkForUpdate}
              disabled={updateStatus.checking}
              className="!px-3 !py-1 -mt-1 !bg-gray-200 hover:!bg-gray-300 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-300 text-xs flex items-center"
            >
              <RefreshCw
                size={12}
                className={`mr-1 ${
                  updateStatus.checking ? "animate-spin" : ""
                }`}
              />
              {updateStatus.checking ? "Checking..." : "Check now"}
            </Button>
          </div>

          {updateStatus.hasUpdate && (
            <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 px-4 flex items-start -m-4 mt-1">
              <span>
                Update available:{" "}
                <span className="font-mono">{updateStatus.latestVersion}</span>{" "}
                -{" "}
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                >
                  Tap here to update
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Model Selection Section */}
        <div className="bg-white dark:bg-gray-800 p-4 flex flex-col gap-3 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm overflow-hidden">
          <h3 className="text-md font-semibold dark:text-white">
            Model selection
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Choose which AI model to use for translations.
            <br />
            <Zap size={13} className="inline-block -mt-1" /> indicates the
            relative token cost of the model.
          </p>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="gemini-2.5-flash"
                name="model"
                value="gemini-2.5-flash-native-audio"
                checked={model === "gemini-2.5-flash-native-audio"}
                onChange={() =>
                  handleModelChange("gemini-2.5-flash-native-audio")
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="gemini-2.5-flash"
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Gemini 2.5 Flash Native Audio{" "}
                <Zap size={13} className="inline-block -mt-1" />
                <span className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                  Recommended
                </span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="gpt-4o-mini"
                name="model"
                value="gpt-4o-mini-realtime-preview"
                checked={model === "gpt-4o-mini-realtime-preview"}
                onChange={() =>
                  handleModelChange("gpt-4o-mini-realtime-preview")
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="gpt-4o-mini"
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                GPT-4o mini Realtime{" "}
                <Zap size={13} className="inline-block -mt-1" />
                <Zap size={13} className="inline-block -mt-1" />
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="gpt-4o"
                name="model"
                value="gpt-4o-realtime-preview"
                checked={model === "gpt-4o-realtime-preview"}
                onChange={() => handleModelChange("gpt-4o-realtime-preview")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="gpt-4o"
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                GPT-4o Realtime <Zap size={13} className="inline-block -mt-1" />
                <Zap size={13} className="inline-block -mt-1" />
                <Zap size={13} className="inline-block -mt-1" />
                <Zap size={13} className="inline-block -mt-1" />
                <Zap size={13} className="inline-block -mt-1" />
              </label>
            </div>
          </div>

          {tokenUsage && (
            <div className="-m-4 mt-1 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 px-4 flex items-start">
              <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Changing the model now will reset your current token usage
                statistics.
              </span>
            </div>
          )}
        </div>

        {/* Advanced Section */}
        <div className="bg-white dark:bg-gray-800 p-4 flex flex-col gap-3 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
          <h3 className="text-md font-semibold dark:text-white">Advanced</h3>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="show-logs"
                  type="checkbox"
                  checked={showLogs}
                  onChange={(e) => setShowLogs(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="show-logs"
                  className="font-medium text-gray-700 dark:text-gray-300"
                >
                  Show logs button
                </label>
                <p className="text-gray-500 dark:text-gray-400">
                  Adds a <Code size={14} className="inline-block -mt-1" />{" "}
                  button in the header that reveals detailed event logs. Useful
                  for debugging and support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow" />
    </div>
  );
}
