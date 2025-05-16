import { useRef, useState } from "react";
import { AlertTriangle, Zap } from "react-feather";
import { ModelOption, TokenUsage } from "../utils/models";
import { useLocalStorage } from "../utils/useLocalStorage";
import Button from "./Button";

export default function SettingsPage({ onBack }: { onBack?: () => void }) {
  const [apiKey, setApiKey] = useLocalStorage<string | null>(
    "App:apiKey",
    null,
  );
  const [model, setModel] = useLocalStorage<ModelOption>(
    "App:model",
    "gpt-4o-mini-realtime-preview",
  );
  const [tokenUsage, setTokenUsage] = useLocalStorage<TokenUsage | null>(
    "useOpenAISession:tokenUsage",
    null,
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
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
          <h3 className="text-md font-semibold mb-3 dark:text-white">
            API Key Configuration
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {apiKey
              ? "Your OpenAI API key is configured."
              : "Please enter your OpenAI API key to use Iso Translate."}
          </p>

          <input
            ref={inputRef}
            type="text"
            value={
              isFocused
                ? apiKey || ""
                : apiKey
                ? getTruncatedApiKey(apiKey)
                : ""
            }
            onChange={(e) => setApiKey(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter your OpenAI API key"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-xs focus:outline-hidden focus:ring-3 focus:ring-blue-500 focus:border-blue-500 mb-4 dark:bg-gray-700 dark:text-white font-mono"
            autoComplete="off"
          />

          {!apiKey ? (
            <Button
              onClick={() => setApiKey(inputRef.current?.value || "")}
              disabled={!inputRef.current?.value?.trim()}
              className="!bg-blue-500 hover:bg-blue-600 !text-white disabled:bg-gray-300 dark:disabled:bg-gray-600"
            >
              Save API Key
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to clear your API key?")
                ) {
                  setApiKey(null);
                }
              }}
              className="!bg-red-500 hover:bg-red-600 !text-white text-sm"
            >
              Clear Key…
            </Button>
          )}
        </div>

        {/* Model Selection Section */}
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm overflow-hidden">
          <h3 className="text-md font-semibold mb-3 dark:text-white">
            Model Selection
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Choose which OpenAI model to use for translations.
            <br />
            <Zap size={13} className="inline-block -mt-1" /> indicates the
            relative token cost of the model.
          </p>

          <div className="space-y-2">
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
              </label>
            </div>
          </div>

          {tokenUsage && (
            <div className="-m-4 mt-4 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 px-4 flex items-start">
              <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Changing the model will reset your current token usage
                statistics.
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow" />
    </div>
  );
}
