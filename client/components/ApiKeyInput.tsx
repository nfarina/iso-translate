import { useState } from "react";
import { useLocalStorage } from "../utils/useLocalStorage";
import Button from "./Button";

export default function ApiKeyInput() {
  const [apiKey, setApiKey] = useLocalStorage<string | null>(
    "App:apiKey",
    null,
  );
  const [showKey, setShowKey] = useState(false);

  if (apiKey) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-6 max-w-md mx-auto">
        <h2 className="text-lg font-bold mb-4 dark:text-white">
          API Key Configuration
        </h2>
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
          <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
            OpenAI API Key is configured
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 break-all font-mono">
            {showKey ? apiKey : "••••••••••••••••••••"}
          </p>
          <div className="flex gap-2 justify-center mb-4">
            <Button
              onClick={() => setShowKey(!showKey)}
              className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 !text-gray-700 dark:!text-gray-300 text-xs border border-gray-300 dark:border-gray-600"
            >
              {showKey ? "Hide" : "Show"} Key
            </Button>
            <Button
              onClick={() => setApiKey(null)}
              className="bg-red-500 hover:bg-red-600 text-white text-xs"
            >
              Clear Key
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-6 max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4 dark:text-white">
        API Key Configuration
      </h2>
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Please enter your OpenAI API key to use Iso Translate. The key will be
          stored in your browser's local storage.
        </p>
        <input
          type="text"
          value={apiKey || ""}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-xs focus:outline-hidden focus:ring-3 focus:ring-blue-500 focus:border-blue-500 mb-4 dark:bg-gray-700 dark:text-white"
          autoComplete="off"
        />
        <Button
          onClick={() => setApiKey(apiKey || "")}
          disabled={!apiKey?.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600"
        >
          Save API Key
        </Button>
      </div>
    </div>
  );
}
