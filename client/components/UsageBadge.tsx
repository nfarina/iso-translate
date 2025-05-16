import { Zap } from "react-feather";

// Match the interface from useOpenAISession.ts
export interface TokenUsage {
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  input_token_details: {
    text_tokens: number;
    audio_tokens: number;
    cached_tokens: number;
    cached_tokens_details: {
      text_tokens: number;
      audio_tokens: number;
    };
  };
  output_token_details: {
    text_tokens: number;
    audio_tokens: number;
  };
}

interface UsageBadgeProps {
  tokenUsage: TokenUsage;
  className?: string;
}

const RATES = {
  // Text rates
  text_input: 5 / 1000000, // $5 per 1M text input tokens
  text_cached: 2.5 / 1000000, // $2.50 per 1M cached text input tokens
  text_output: 20 / 1000000, // $20 per 1M text output tokens
  // Audio rates
  audio_input: 40 / 1000000, // $40 per 1M audio input tokens
  audio_cached: 2.5 / 1000000, // $2.50 per 1M cached audio input tokens
  audio_output: 80 / 1000000, // $80 per 1M audio output tokens
};

export default function UsageBadge({
  tokenUsage,
  className = "",
}: UsageBadgeProps) {
  // Early return if tokenUsage is not properly formed
  if (
    !tokenUsage ||
    !tokenUsage.input_token_details ||
    !tokenUsage.output_token_details
  ) {
    return (
      <div
        className={`flex items-center text-xs rounded-md py-1 px-3 text-blue-700 dark:text-blue-300 ${className}`}
      >
        <Zap size={12} className="mr-1" />
        <span>$0.00</span>
      </div>
    );
  }

  const { input_token_details, output_token_details } = tokenUsage;

  // Calculate text token costs
  const textInputCost =
    (input_token_details.text_tokens -
      input_token_details.cached_tokens_details.text_tokens) *
    RATES.text_input;
  const textCachedCost =
    input_token_details.cached_tokens_details.text_tokens * RATES.text_cached;
  const textOutputCost = output_token_details.text_tokens * RATES.text_output;

  // Calculate audio token costs
  const audioInputCost =
    (input_token_details.audio_tokens -
      input_token_details.cached_tokens_details.audio_tokens) *
    RATES.audio_input;
  const audioCachedCost =
    input_token_details.cached_tokens_details.audio_tokens * RATES.audio_cached;
  const audioOutputCost =
    output_token_details.audio_tokens * RATES.audio_output;

  // Calculate total cost
  const totalCost =
    textInputCost +
    textCachedCost +
    textOutputCost +
    audioInputCost +
    audioCachedCost +
    audioOutputCost;

  return (
    <div
      className={`flex items-center text-xs rounded-md py-1 px-3 text-blue-700 dark:text-blue-300 ${className}`}
    >
      <Zap size={12} className="mr-1" />
      <span>${(Math.round(totalCost * 100) / 100).toFixed(2)}</span>
    </div>
  );
}
