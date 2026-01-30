// LLM Pricing Data - Updated January 2025
export const llmModels = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    region: 'US',
    inputPrice: 2.50,
    outputPrice: 10.00,
    contextWindow: 128000,
    supportsCaching: true,
    cachingDiscount: 0.90,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'flagship',
    pricingUrl: 'https://openai.com/api/pricing/'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    region: 'US',
    inputPrice: 0.15,
    outputPrice: 0.60,
    contextWindow: 128000,
    supportsCaching: true,
    cachingDiscount: 0.90,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'efficient',
    pricingUrl: 'https://openai.com/api/pricing/'
  },
  {
    id: 'o1',
    name: 'o1',
    provider: 'OpenAI',
    region: 'US',
    inputPrice: 15.00,
    outputPrice: 60.00,
    contextWindow: 200000,
    supportsCaching: true,
    cachingDiscount: 0.90,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'reasoning',
    pricingUrl: 'https://openai.com/api/pricing/'
  },
  {
    id: 'o1-mini',
    name: 'o1 Mini',
    provider: 'OpenAI',
    region: 'US',
    inputPrice: 3.00,
    outputPrice: 12.00,
    contextWindow: 128000,
    supportsCaching: true,
    cachingDiscount: 0.90,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'reasoning',
    pricingUrl: 'https://openai.com/api/pricing/'
  },

  // Anthropic Models
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    region: 'US',
    inputPrice: 3.00,
    outputPrice: 15.00,
    contextWindow: 200000,
    supportsCaching: true,
    cachingDiscount: 0.90,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'flagship',
    pricingUrl: 'https://www.anthropic.com/pricing'
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    region: 'US',
    inputPrice: 0.25,
    outputPrice: 1.25,
    contextWindow: 200000,
    supportsCaching: true,
    cachingDiscount: 0.90,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'efficient',
    pricingUrl: 'https://www.anthropic.com/pricing'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    region: 'US',
    inputPrice: 15.00,
    outputPrice: 75.00,
    contextWindow: 200000,
    supportsCaching: true,
    cachingDiscount: 0.90,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'flagship',
    pricingUrl: 'https://www.anthropic.com/pricing'
  },

  // Google Models
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    region: 'US',
    inputPrice: 1.25,
    inputPriceLong: 2.50,
    outputPrice: 5.00,
    outputPriceLong: 10.00,
    contextWindow: 1000000,
    longContextThreshold: 128000,
    supportsCaching: false,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'flagship',
    pricingUrl: 'https://ai.google.dev/pricing'
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    region: 'US',
    inputPrice: 0.075,
    inputPriceLong: 0.15,
    outputPrice: 0.30,
    outputPriceLong: 0.60,
    contextWindow: 1000000,
    longContextThreshold: 128000,
    supportsCaching: false,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'efficient',
    pricingUrl: 'https://ai.google.dev/pricing'
  },

  // Mistral AI (EU)
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    region: 'EU',
    inputPrice: 2.00,
    outputPrice: 6.00,
    contextWindow: 128000,
    supportsCaching: false,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'flagship',
    pricingUrl: 'https://mistral.ai/technology/#pricing'
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'Mistral AI',
    region: 'EU',
    inputPrice: 0.20,
    outputPrice: 0.60,
    contextWindow: 128000,
    supportsCaching: false,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'efficient',
    pricingUrl: 'https://mistral.ai/technology/#pricing'
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Mistral AI',
    region: 'EU',
    inputPrice: 0.70,
    outputPrice: 0.70,
    contextWindow: 32000,
    supportsCaching: false,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'efficient',
    pricingUrl: 'https://mistral.ai/technology/#pricing'
  },

  // DeepSeek (China)
  {
    id: 'deepseek-v2-5',
    name: 'DeepSeek V2.5',
    provider: 'DeepSeek',
    region: 'China',
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: 128000,
    supportsCaching: false,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'efficient',
    pricingUrl: 'https://platform.deepseek.com/api-docs/pricing/'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    region: 'China',
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: 128000,
    supportsCaching: false,
    supportsBatch: true,
    batchDiscount: 0.50,
    tier: 'efficient',
    pricingUrl: 'https://platform.deepseek.com/api-docs/pricing/'
  },

  // Alibaba Qwen (China)
  {
    id: 'qwen-2-5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'Alibaba',
    region: 'China',
    inputPrice: 0.35,
    outputPrice: 0.35,
    contextWindow: 128000,
    supportsCaching: false,
    supportsBatch: false,
    tier: 'flagship',
    pricingUrl: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-api'
  },
  {
    id: 'qwen-2-5-7b',
    name: 'Qwen 2.5 7B',
    provider: 'Alibaba',
    region: 'China',
    inputPrice: 0.07,
    outputPrice: 0.07,
    contextWindow: 128000,
    supportsCaching: false,
    supportsBatch: false,
    tier: 'efficient',
    pricingUrl: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-api'
  },

  // Moonshot AI (Kimi - Global Pricing in USD)
  {
    id: 'moonshot-v1-8k',
    name: 'Kimi V1 8K',
    provider: 'Moonshot AI',
    region: 'China',
    inputPrice: 0.20,
    outputPrice: 2.00,
    contextWindow: 8000,
    supportsCaching: false,
    supportsBatch: false,
    tier: 'efficient',
    pricingUrl: 'https://platform.moonshot.ai/pricing'
  },
  {
    id: 'moonshot-v1-128k',
    name: 'Kimi V1 128K',
    provider: 'Moonshot AI',
    region: 'China',
    inputPrice: 2.00,
    outputPrice: 5.00,
    contextWindow: 128000,
    supportsCaching: false,
    supportsBatch: false,
    tier: 'flagship',
    pricingUrl: 'https://platform.moonshot.ai/pricing'
  },
  {
    id: 'kimi-2-5',
    name: 'Kimi 2.5',
    provider: 'Moonshot AI',
    region: 'China',
    inputPrice: 0.60,
    outputPrice: 2.50,
    contextWindow: 128000,
    supportsCaching: true,
    cachingDiscount: 0.88, // ¥4.00 vs ¥0.70 approx
    supportsBatch: false,
    tier: 'flagship',
    pricingUrl: 'https://platform.moonshot.ai/pricing'
  },

  // Audio & Multimedia Models
  {
    id: 'eleven-turbo-v2-5',
    name: 'ElevenLabs Turbo v2.5',
    provider: 'ElevenLabs',
    region: 'US',
    inputPrice: 0,
    outputPrice: 300.00, // Normalized: $0.30/1k characters -> $300/1M chars (approx 1M tokens)
    contextWindow: 32000,
    supportsCaching: false,
    supportsBatch: false,
    tier: 'audio',
    unit: '1M chars',
    pricingUrl: 'https://elevenlabs.io/pricing'
  },
  {
    id: 'whisper-1',
    name: 'Whisper v1',
    provider: 'OpenAI',
    region: 'US',
    inputPrice: 10.00, // Normalized: $0.006/min -> approx $10/1M tokens (assuming 150 words/min = 200 tokens/min)
    outputPrice: 0,
    contextWindow: 0,
    supportsCaching: false,
    supportsBatch: false,
    tier: 'audio',
    unit: '1M tokens (eq)',
    pricingUrl: 'https://openai.com/api/pricing/'
  },
  {
    id: 'kling-v1-5',
    name: 'Kling v1.5',
    provider: 'Kling AI',
    region: 'China',
    inputPrice: 0,
    outputPrice: 15.00, // Normalized: ~1 credit per image/sec -> placeholder
    contextWindow: 0,
    supportsCaching: false,
    supportsBatch: false,
    tier: 'video',
    unit: 'Credits',
    pricingUrl: 'https://klingai.com/global/dev/pricing'
  }
];

// Calculate cost for a given model
export function calculateCost(model, inputTokens, outputTokens, options = {}) {
  const { useCaching = false, useBatch = false, isLongContext = false } = options;

  let inputPrice = model.inputPrice;
  let outputPrice = model.outputPrice;

  // Apply long context pricing for Google models
  if (isLongContext && model.inputPriceLong) {
    inputPrice = model.inputPriceLong;
    outputPrice = model.outputPriceLong;
  }

  // Calculate base costs (prices are per 1M tokens)
  let inputCost = (inputTokens / 1_000_000) * inputPrice;
  let outputCost = (outputTokens / 1_000_000) * outputPrice;

  // Apply caching discount to input tokens
  if (useCaching && model.supportsCaching) {
    inputCost = inputCost * (1 - model.cachingDiscount);
  }

  // Apply batch discount to total
  let totalCost = inputCost + outputCost;
  if (useBatch && model.supportsBatch) {
    totalCost = totalCost * (1 - model.batchDiscount);
  }

  return {
    inputCost,
    outputCost,
    totalCost,
    costPer1kTokens: (totalCost / ((inputTokens + outputTokens) / 1000)) || 0
  };
}

// Get region badge color
export function getRegionColor(region) {
  const colors = {
    'US': '#6366f1',
    'EU': '#10b981',
    'China': '#ef4444'
  };
  return colors[region] || '#888888';
}
