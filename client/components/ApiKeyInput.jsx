import { useState, useEffect } from 'react';
import Button from './Button'; // Assuming Button component exists and can be reused

export default function ApiKeyInput({ onKeySaved }) {
  const [apiKey, setApiKey] = useState('');
  const [storedKey, setStoredKey] = useState(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const keyFromStorage = localStorage.getItem('openai_api_key');
    if (keyFromStorage) {
      setStoredKey(keyFromStorage);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey);
      setStoredKey(apiKey);
      setApiKey(''); // Clear input field
      if (onKeySaved) {
        onKeySaved(apiKey);
      }
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('openai_api_key');
    setStoredKey(null);
    if (onKeySaved) {
      onKeySaved(null); // Notify parent that key is cleared
    }
  };

  if (storedKey) {
    return (
      <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-white text-center max-w-md mx-auto">
        <p className="text-green-600 font-semibold mb-2">OpenAI API Key is configured.</p>
        <p className="text-sm text-gray-700 mb-4 break-all">
          Current key: {showKey ? storedKey : '••••••••••••••••••••'}
        </p>
        <div className="flex gap-2 justify-center mb-4">
          <Button
            onClick={() => setShowKey(!showKey)}
            className="bg-white hover:bg-gray-200 text-gray-900 text-xs border border-gray-300"
          >
            {showKey ? 'Hide' : 'Show'} Key
          </Button>
          <Button
            onClick={handleClearKey}
            className="bg-red-500 hover:bg-red-600 text-white text-xs"
          >
            Clear Key
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          The application will use this key to interact with OpenAI services.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 text-center">Configure OpenAI API Key</h2>
      <p className="text-sm text-gray-600">
        Please enter your OpenAI API key. This key will be stored locally in your browser
        and used to interact with the OpenAI API.
      </p>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter your OpenAI API key"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        autoComplete="off"
      />
      <Button
        onClick={handleSaveKey}
        disabled={!apiKey.trim()}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300"
      >
        Save API Key
      </Button>
      <p className="text-xs text-gray-500 text-center">
        Your API key is sensitive. Ensure you are on a secure connection.
      </p>
    </div>
  );
} 