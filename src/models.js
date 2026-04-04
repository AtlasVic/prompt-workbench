// Model pricing and configuration for Prompt Workbench
// Updated April 2026

export const MODEL_DATA_VERSION = '2026-04-03'

export const CONNECTION_TYPES = [
  { id: 'openrouter', name: 'OpenRouter', desc: 'Unified API for multiple providers' },
  { id: 'direct', name: 'Direct Provider', desc: "Use provider's own API" },
  { id: 'lmstudio', name: 'LM Studio', desc: 'Local models via LM Studio' },
  { id: 'ollama', name: 'Ollama', desc: 'Local models via Ollama' },
]

export const DIRECT_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', color: '#10A37F' },
  { id: 'anthropic', name: 'Anthropic', color: '#D4A373' },
  { id: 'google', name: 'Google', color: '#4285F4' },
]

export const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', color: '#10A37F', pricingUrl: 'https://openai.com/api/pricing' },
  { id: 'anthropic', name: 'Anthropic', color: '#D4A373', pricingUrl: 'https://anthropic.com/api/pricing' },
  { id: 'google', name: 'Google', color: '#4285F4', pricingUrl: 'https://ai.google.dev/pricing' },
  { id: 'openrouter', name: 'OpenRouter', color: '#9F7AEA', pricingUrl: 'https://openrouter.ai/docs/pricing' },
  { id: 'meta', name: 'Meta', color: '#0668E1', pricingUrl: 'https://ai.meta.com/resources/' },
  { id: 'mistral', name: 'Mistral', color: '#FF7000', pricingUrl: 'https://mistral.ai/technology/#pricing' },
  { id: 'deepseek', name: 'DeepSeek', color: '#252628', pricingUrl: 'https://www.deepseek.com/pricing.html' },
  { id: 'minimax', name: 'MiniMax', color: '#21A1F1', pricingUrl: 'https://www.minimaxi.com/document/Price' },
]

// Models with current 2026 pricing (per 1M tokens)
export const MODELS = [
  // OpenAI (via OpenRouter)
  { id: 'openai/gpt-5.4', name: 'GPT-5.4', provider: 'openai', desc: 'Most capable', inputCost: 2.5, outputCost: 15.0, context: '200K', latest: true, tags: ['coding', 'reasoning', 'research'] },
  { id: 'openai/gpt-5.4-mini', name: 'GPT-5.4 Mini', provider: 'openai', desc: 'Best mini for coding', inputCost: 0.75, outputCost: 4.5, context: '200K', recommended: true, latest: true, tags: ['coding', 'fast', 'volume'] },
  { id: 'openai/gpt-5.4-nano', name: 'GPT-5.4 Nano', provider: 'openai', desc: 'Cheapest for volume', inputCost: 0.20, outputCost: 1.25, context: '200K', latest: true, tags: ['fast', 'volume', 'cost-effective'] },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', desc: 'Fast & cheap', inputCost: 0.15, outputCost: 0.6, context: '128K', legacy: true, tags: ['fast', 'cost-effective'] },
  { id: 'openai/o1', name: 'o1', provider: 'openai', desc: 'Reasoning', inputCost: 15.0, outputCost: 60.0, context: '200K', latest: true, tags: ['reasoning', 'complex-tasks', 'research'] },
  { id: 'openai/o1-mini', name: 'o1-mini', provider: 'openai', desc: 'Fast reasoning', inputCost: 3.0, outputCost: 12.0, context: '200K', latest: true, tags: ['reasoning', 'fast', 'coding'] },
  // Anthropic (via OpenRouter) - Latest Claude 4 models
  { id: 'anthropic/claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'anthropic', desc: 'Most capable, balanced', inputCost: 3.0, outputCost: 15.0, context: '1M', recommended: true, latest: true, tags: ['coding', 'reasoning', 'research', 'analysis'] },
  { id: 'anthropic/claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'anthropic', desc: 'Most capable, 1M context', inputCost: 18.0, outputCost: 90.0, context: '1M', latest: true, tags: ['reasoning', 'coding', 'research'] },
  { id: 'anthropic/claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'anthropic', desc: 'Fast & cheapest', inputCost: 0.80, outputCost: 4.0, context: '200K', latest: true, tags: ['fast', 'cost-effective', 'volume'] },
  // Google (via OpenRouter)
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', desc: 'Long context, multimodal', inputCost: 1.25, outputCost: 5.0, context: '1M', tags: ['long-context', 'multimodal', 'research'] },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', desc: 'Fast & cost-effective', inputCost: 0.10, outputCost: 0.40, context: '1M', recommended: true, latest: true, tags: ['fast', 'cost-effective', 'multimodal'] },
  // Meta (via OpenRouter)
  { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', provider: 'meta', desc: 'Open weight, reasoning', inputCost: 0.15, outputCost: 0.60, context: '1M', latest: true, tags: ['open-weight', 'reasoning', 'coding'] },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'meta', desc: 'Open weight', inputCost: 0.40, outputCost: 0.40, context: '128K', tags: ['open-weight', 'balanced'] },
  // Mistral (via OpenRouter)
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'mistral', desc: 'Code & reasoning', inputCost: 2.0, outputCost: 6.0, context: '128K', tags: ['coding', 'reasoning'] },
  { id: 'mistralai/mistral-small', name: 'Mistral Small', provider: 'mistral', desc: 'Fast & cheap', inputCost: 0.20, outputCost: 0.60, context: '128K', recommended: true, latest: true, tags: ['fast', 'cost-effective'] },
  // DeepSeek (via OpenRouter)
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', desc: 'Open source, affordable', inputCost: 0.27, outputCost: 1.10, context: '64K', recommended: true, latest: true, tags: ['open-source', 'affordable', 'coding'] },
  // MiniMax (via OpenRouter)
  { id: 'minimax/minimax-text-01', name: 'MiniMax Text 01', provider: 'minimax', desc: 'Fast, cost-effective', inputCost: 0.10, outputCost: 0.20, context: '128K', recommended: true, latest: true, tags: ['fast', 'cost-effective', 'reasoning'] },
  { id: 'minimax/minimax-text-01-mini', name: 'MiniMax Text 01 Mini', provider: 'minimax', desc: 'Compact, fast', inputCost: 0.05, outputCost: 0.10, context: '128K', latest: true, tags: ['fast', 'volume', 'cost-effective'] },
]

export const MODELS_BY_PROVIDER = MODELS.reduce((acc, model) => {
  if (!acc[model.provider]) acc[model.provider] = []
  acc[model.provider].push(model)
  return acc
}, {})

export const calculateCost = (modelId, promptTokens, completionTokens) => {
  const model = MODELS.find(m => m.id === modelId)
  if (!model) return null
  return ((promptTokens / 1e6) * model.inputCost + (completionTokens / 1e6) * model.outputCost).toFixed(4)
}

export const LOCAL_MODELS = [
  { id: 'llama-3.2-1b', name: 'Llama 3.2 1B', desc: 'Small, fast' },
  { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', desc: 'Balanced' },
  { id: 'qwen-2.5-3b', name: 'Qwen 2.5 3B', desc: 'Good coding' },
  { id: 'qwen-2.5-7b', name: 'Qwen 2.5 7B', desc: 'Balanced' },
  { id: 'phi-4', name: 'Phi-4', desc: 'Microsoft' },
  { id: 'custom', name: 'Custom Model', desc: 'Enter name' },
]