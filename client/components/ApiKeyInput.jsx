import { useState, useEffect } from 'react';
import Button from './Button';

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
      <div className="bg-gray-50 rounded-md p-6 max-w-md mx-auto">
        <h2 className="text-lg font-bold mb-4">API Key Configuration</h2>
        <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
          <p className="text-green-600 font-semibold mb-2">OpenAI API Key is configured</p>
          <p className="text-sm text-gray-700 mb-4 break-all font-mono">
            {showKey ? storedKey : '••••••••••••••••••••'}
          </p>
          <div className="flex gap-2 justify-center mb-4">
            <Button
              onClick={() => setShowKey(!showKey)}
              className="bg-white hover:bg-gray-100 !text-gray-700 text-xs border border-gray-300"
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-md p-6 max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4">API Key Configuration</h2>
      <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
        <p className="text-sm text-gray-600 mb-4">
          Please enter your OpenAI API key to use Iso Translate. The key will be stored in your browser's local storage.
        </p>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
          autoComplete="off"
        />
        <Button
          onClick={handleSaveKey}
          disabled={!apiKey.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300"
        >
          Save API Key
        </Button>
      </div>
    </div>
  );
} 