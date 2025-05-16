export type ModelOption =
  | "gpt-4o-mini-realtime-preview"
  | "gpt-4o-realtime-preview";

export interface TokenUsage {
  model: ModelOption;
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

export const GPT_4O_RATES = {
  // Text rates
  text_input: 5 / 1000000, // $5 per 1M text input tokens
  text_cached: 2.5 / 1000000, // $2.50 per 1M cached text input tokens
  text_output: 20 / 1000000, // $20 per 1M text output tokens
  // Audio rates
  audio_input: 40 / 1000000, // $40 per 1M audio input tokens
  audio_cached: 2.5 / 1000000, // $2.50 per 1M cached audio input tokens
  audio_output: 80 / 1000000, // $80 per 1M audio output tokens
};

export const GPT_4O_MINI_RATES = {
  // Text rates
  text_input: 0.6 / 1000000, // $0.60 per 1M text input tokens
  text_cached: 0.3 / 1000000, // $0.30 per 1M cached text input tokens
  text_output: 2.4 / 1000000, // $2.40 per 1M text output tokens
  // Audio rates
  audio_input: 10.0 / 1000000, // $10.00 per 1M audio input tokens
  audio_cached: 0.3 / 1000000, // $0.30 per 1M cached audio input tokens
  audio_output: 20.0 / 1000000, // $20.00 per 1M audio output tokens
};

export type TokenRates = typeof GPT_4O_RATES;

export function getModelRates(model: ModelOption): TokenRates {
  return model === "gpt-4o-mini-realtime-preview"
    ? GPT_4O_MINI_RATES
    : GPT_4O_RATES;
}

export function calculateTokenCosts(tokenUsage: TokenUsage) {
  if (
    !tokenUsage ||
    !tokenUsage.input_token_details ||
    !tokenUsage.output_token_details
  ) {
    return { totalCost: 0 };
  }

  const { model, input_token_details, output_token_details } = tokenUsage;
  const rates = getModelRates(model);

  // Calculate text token costs
  const textInputCost =
    (input_token_details.text_tokens -
      input_token_details.cached_tokens_details.text_tokens) *
    rates.text_input;
  const textCachedCost =
    input_token_details.cached_tokens_details.text_tokens * rates.text_cached;
  const textOutputCost = output_token_details.text_tokens * rates.text_output;

  // Calculate audio token costs
  const audioInputCost =
    (input_token_details.audio_tokens -
      input_token_details.cached_tokens_details.audio_tokens) *
    rates.audio_input;
  const audioCachedCost =
    input_token_details.cached_tokens_details.audio_tokens * rates.audio_cached;
  const audioOutputCost =
    output_token_details.audio_tokens * rates.audio_output;

  // Calculate total cost
  const totalCost =
    textInputCost +
    textCachedCost +
    textOutputCost +
    audioInputCost +
    audioCachedCost +
    audioOutputCost;

  return {
    textInputCost,
    textCachedCost,
    textOutputCost,
    audioInputCost,
    audioCachedCost,
    audioOutputCost,
    totalCost,
  };
}

export function formatPrice(amount: number, decimals: number = 2): string {
  return `$${amount.toFixed(decimals)}`;
}
