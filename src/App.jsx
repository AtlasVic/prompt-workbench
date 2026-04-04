import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import { MODELS, MODELS_BY_PROVIDER, PROVIDERS, LOCAL_MODELS, calculateCost, MODEL_DATA_VERSION } from './models'

const API_KEYS_STORAGE = 'prompt-workbench-api-keys'
const LOCAL_CONFIG_STORAGE = 'prompt-workbench-local-config'

const getApiKey = (provider) => {
  const keys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE) || '{}')
  return keys[provider] || import.meta.env[`VITE_${provider.toUpperCase()}_API_KEY`] || ''
}

const saveApiKey = (provider, key) => {
  const keys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE) || '{}')
  keys[provider] = key
  localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(keys))
}

const getLocalConfig = () => {
  return JSON.parse(localStorage.getItem(LOCAL_CONFIG_STORAGE) || '{}')
}

const saveLocalConfig = (config) => {
  localStorage.setItem(LOCAL_CONFIG_STORAGE, JSON.stringify(config))
}

const ALL_PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', color: '#9F7AEA' },
  { id: 'lmstudio', name: 'LM Studio', color: '#8B5CF6' },
  { id: 'ollama', name: 'Ollama', color: '#10A37F' },
]

const SettingsPanel = ({ isOpen, apiKeys, localConfig, onSaveKey, onSaveLocalConfig, onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState('openrouter')
  const [apiKeyValue, setApiKeyValue] = useState('')
  const [localModelValue, setLocalModelValue] = useState('')

  if (!isOpen) return null

  const isLocal = selectedProvider === 'lmstudio' || selectedProvider === 'ollama'

  const handleProviderChange = (providerId) => {
    setSelectedProvider(providerId)
    if (providerId === 'lmstudio') {
      setLocalModelValue(localConfig.lmStudioModel || '')
      setApiKeyValue('')
    } else if (providerId === 'ollama') {
      setLocalModelValue(localConfig.ollamaModel || '')
      setApiKeyValue('')
    } else {
      setApiKeyValue(apiKeys[providerId] || '')
      setLocalModelValue('')
    }
  }

  const handleSave = () => {
    if (isLocal) {
      const config = { ...localConfig }
      if (selectedProvider === 'lmstudio') config.lmStudioModel = localModelValue
      if (selectedProvider === 'ollama') config.ollamaModel = localModelValue
      saveLocalConfig(config)
      onSaveLocalConfig(config)
    } else {
      saveApiKey(selectedProvider, apiKeyValue)
      onSaveKey(selectedProvider, apiKeyValue)
    }
    onClose()
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>Settings</h3>
      </div>

      <div className="settings-content">
        <div className="config-row">
          <label>Provider</label>
          <select value={selectedProvider} onChange={e => handleProviderChange(e.target.value)}>
            {ALL_PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="config-row">
          {isLocal ? (
            <>
              <label>Model</label>
              <select value={localModelValue} onChange={e => setLocalModelValue(e.target.value)}>
                <option value="">Select model...</option>
                {LOCAL_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label>API Key</label>
              <input
                type="password"
                placeholder="Enter API key"
                value={apiKeyValue}
                onChange={e => setApiKeyValue(e.target.value)}
              />
            </>
          )}
        </div>

        {apiKeyValue && !isLocal && (
          <div className="config-hint">
            Saving key for <strong style={{ color: ALL_PROVIDERS.find(p => p.id === selectedProvider)?.color }}>{ALL_PROVIDERS.find(p => p.id === selectedProvider)?.name}</strong>
          </div>
        )}

        <div className="settings-actions">
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

const DEMO_HISTORY = [
  {
    id: 1,
    prompt: 'Generate 5 behavioral interview questions for a senior QA engineer role focusing on test automation and team leadership.',
    output: '1. Describe a time when you had to mentor a junior team member on test automation. How did you approach it and what was the outcome?\n\n2. Tell me about a challenging bug you encountered in a production environment. How did you identify the root cause and what steps did you take to prevent it from happening again?\n\n3. Talk about a time when you had to convince your team to adopt a new testing framework or methodology. What was your strategy and how did you get buy-in?\n\n4. Describe a situation where you had to balance tight deadlines with thorough testing. How did you prioritize and what trade-offs did you make?\n\n5. Give an example of a time when you identified a significant quality issue in a product before release. What was the issue and how did you handle it?',
    provider: 'openai',
    model: 'gpt-5.4-nano',
    temperature: 0.7,
    maxTokens: 2048,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    stats: { promptTokens: 32, completionTokens: 213, totalTokens: 245, latency: 1840, cost: 0.0002 }
  },
  {
    id: 2,
    prompt: 'Compare the writing style and depth of responses between gpt-4o-mini and claude-3-5-sonnet for the same prompt about API testing.',
    output: 'GPT-4o Mini tends to be more direct and concise, providing bullet-pointed answers. Claude 3.5 Sonnet offers more conversational, detailed responses with better context explanation. For technical topics, Claude often provides more thorough explanations while GPT optimizes for brevity.',
    provider: 'google',
    model: 'gemini-2.5-flash',
    temperature: 0.5,
    maxTokens: 1024,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    stats: { promptTokens: 28, completionTokens: 128, totalTokens: 156, latency: 2100, cost: 0.0000 }
  },
  {
    id: 3,
    prompt: 'Write a Python function that uses Playwright to take screenshots of all links on a webpage and save them to a folder.',
    output: '```python\nimport asyncio\nfrom playwright.async_api import async_playwright\nimport os\n\nasync def screenshot_all_links(url: str, output_dir: str = "screenshots"):\n    os.makedirs(output_dir, exist_ok=True)\n\n    async with async_playwright() as p:\n        browser = await p.chromium.launch()\n        page = await browser.new_page()\n        await page.goto(url)\n\n        links = await page.query_selector_all("a")\n\n        for i, link in enumerate(links):\n            href = await link.get_attribute("href")\n            if href and href.startswith("http"):\n                try:\n                    await page.goto(href)\n                    await page.screenshot(path=f"{output_dir}/link_{i}.png", full_page=True)\n                except Exception as e:\n                    print(f"Failed to screenshot {href}: {e}")\n\n        await browser.close()\n\nasyncio.run(screenshot_all_links("https://example.com"))\n```',
    provider: 'anthropic',
    model: 'claude-haiku-4.5',
    temperature: 0.3,
    maxTokens: 2048,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    stats: { promptTokens: 45, completionTokens: 267, totalTokens: 312, latency: 3200, cost: 0.0003 }
  }
]

const DEMO_PROMPTS = [
  'Generate 5 behavioral interview questions for a senior QA engineer role focusing on test automation and team leadership.',
  'Write a Python function that uses Playwright to take screenshots of all links on a webpage and save them to a folder.',
  'Explain the differences between black-box testing, white-box testing, and gray-box testing with examples.',
  'How would you design a test automation strategy for a microservices architecture?'
]

// Simple markdown-like rendering for better readability
const renderOutput = (text) => {
  if (!text) return null

  // Handle code blocks first - wrap them in pre tags
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    // Add code block wrapped in pre/code
    parts.push({ type: 'code', content: match[2], lang: match[1] })
    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content: text })
  }

  return parts.map((part, i) => {
    if (part.type === 'code') {
      return <pre key={i}><code>{part.content}</code></pre>
    }

    // Process text for formatting
    let formatted = part.content
      // Escape HTML first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Code inline
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Headings
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      // Paragraphs (double newlines)
      .replace(/\n\n/g, '</p><p>')
      // Bullet lists
      .replace(/^[-*]\s(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Numbered lists
      .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br/>')

    return <span key={i} dangerouslySetInnerHTML={{ __html: `<p>${formatted}</p>` }} />
  })
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState('openrouter')
  const [model, setModel] = useState('anthropic/claude-sonnet-4-6')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [demoMode, setDemoMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeys, setApiKeys] = useState({})
  const [localConfig, setLocalConfig] = useState({})
  const [splitRatio, setSplitRatio] = useState(42)
  const [isDragging, setIsDragging] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState([])
  const workspaceRef = useRef(null)

  const handleResizeMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !workspaceRef.current) return
      const rect = workspaceRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = (x / rect.width) * 100
      setSplitRatio(Math.max(20, Math.min(80, percentage)))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  useEffect(() => {
    const saved = localStorage.getItem('prompt-history')
    if (saved) setHistory(JSON.parse(saved))
    const savedPrompt = localStorage.getItem('current-prompt')
    if (savedPrompt) setPrompt(savedPrompt)

    // Load API keys
    const keys = {}
    PROVIDERS.forEach(p => { keys[p.id] = getApiKey(p.id) })
    setApiKeys(keys)

    // Load local config
    setLocalConfig(getLocalConfig())
  }, [])

  useEffect(() => {
    localStorage.setItem('current-prompt', prompt)
  }, [prompt])

  const enableDemoMode = () => {
    setDemoMode(true)
    setHistory(DEMO_HISTORY)
    setShowHistory(true)
    setPrompt(DEMO_PROMPTS[0])
    setOutput(DEMO_HISTORY[0].output)
    setStats(DEMO_HISTORY[0].stats)
    setProvider(DEMO_HISTORY[0].provider || 'openai')
    setModel(DEMO_HISTORY[0].model)
  }

  const disableDemoMode = () => {
    setDemoMode(false)
    const saved = localStorage.getItem('prompt-history')
    if (saved) setHistory(JSON.parse(saved))
    const savedPrompt = localStorage.getItem('current-prompt')
    if (savedPrompt) setPrompt(savedPrompt)
    setOutput('')
    setStats(null)
    setProvider('openai')
    setModel('gpt-5.4-nano')
  }

  const runPrompt = useCallback(async () => {
    if (!prompt.trim()) return

    const isLocal = provider === 'lmstudio' || provider === 'ollama'

    if (!isLocal) {
      const key = getApiKey(provider)
      if (!key) {
        setError(`No API key configured for ${PROVIDERS.find(p => p.id === provider)?.name}. Click ⚙️ to add your key.`)
        return
      }
    }

    setLoading(true)
    setError('')
    setOutput('')
    setStats(null)

    const startTime = Date.now()

    try {
      let response, data
      const key = getApiKey(provider)

      if (provider === 'ollama') {
        // Ollama local
        response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            stream: false
          })
        })
        data = await response.json()
      } else if (provider === 'lmstudio') {
        // LM Studio local
        response = await fetch('http://localhost:1234/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens,
          })
        })
        data = await response.json()
      } else {
        // All cloud providers route through OpenRouter
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens,
          })
        })
        data = await response.json()
      }

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.error?.type || `API error: ${response.status}`
        throw new Error(errorMsg)
      }

      const latency = Date.now() - startTime

      // Parse response
      let content, promptTokens, completionTokens
      if (provider === 'ollama') {
        content = data.message?.content || 'No response'
        promptTokens = 0
        completionTokens = 0
      } else {
        content = data.choices?.[0]?.message?.content || 'No response'
        promptTokens = data.usage?.prompt_tokens || 0
        completionTokens = data.usage?.completion_tokens || 0
      }
      const totalTokens = promptTokens + completionTokens
      const cost = calculateCost(model, promptTokens, completionTokens)

      setOutput(content)
      setStats({
        promptTokens,
        completionTokens,
        totalTokens,
        latency,
        cost
      })

      const newEntry = {
        id: Date.now(),
        prompt,
        output: content,
        provider,
        model,
        temperature,
        maxTokens,
        timestamp: new Date().toISOString(),
        stats: { promptTokens, completionTokens, totalTokens, latency, cost }
      }

      const newHistory = [newEntry, ...history].slice(0, 50)
      setHistory(newHistory)
      localStorage.setItem('prompt-history', JSON.stringify(newHistory))
      
    } catch (err) {
      setError(err.message || 'Failed to run prompt')
    } finally {
      setLoading(false)
    }
  }, [prompt, provider, model, temperature, maxTokens, history])

  const loadFromHistory = (entry) => {
    setPrompt(entry.prompt)
    setOutput(entry.output)
    setProvider(entry.provider || 'openrouter')
    setModel(entry.model)
    setTemperature(entry.temperature)
    setMaxTokens(entry.maxTokens)
    setStats(entry.stats)
    setError('')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('prompt-history')
  }

  const deleteEntry = (id) => {
    const newHistory = history.filter(h => h.id !== id)
    setHistory(newHistory)
    localStorage.setItem('prompt-history', JSON.stringify(newHistory))
  }

  const deleteSelected = () => {
    const selectedIds = new Set(selectedForCompare.map(e => e.id))
    const newHistory = history.filter(h => !selectedIds.has(h.id))
    setHistory(newHistory)
    localStorage.setItem('prompt-history', JSON.stringify(newHistory))
    setSelectedForCompare([])
    setCompareMode(false)
  }

  const toggleCompareMode = () => {
    setCompareMode(true)
    setSelectedForCompare([])
  }

  const cancelSelect = () => {
    setCompareMode(false)
    setSelectedForCompare([])
  }

  const toggleCompareSelection = (entry) => {
    if (selectedForCompare.some(e => e.id === entry.id)) {
      setSelectedForCompare(selectedForCompare.filter(e => e.id !== entry.id))
    } else {
      setSelectedForCompare([...selectedForCompare, entry])
    }
  }

  const [compareForModal, setCompareForModal] = useState(false)

  const openCompare = () => {
    setCompareForModal(true)
    setCompareMode(false)
  }

  const closeCompare = () => {
    setCompareForModal(false)
    setSelectedForCompare([])
  }

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        runPrompt()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [runPrompt])

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider)
    if (newProvider === 'lmstudio' || newProvider === 'ollama') {
      setModel(LOCAL_MODELS[0]?.id || '')
    } else if (newProvider === 'openrouter') {
      // OpenRouter shows all models
      const allModels = MODELS.filter(m => !LOCAL_MODELS.some(lm => lm.id === m.id))
      if (allModels.length > 0) {
        const preferred = allModels.find(m => m.recommended) || allModels[0]
        setModel(preferred.id)
      }
    } else {
      const models = MODELS_BY_PROVIDER[newProvider] || []
      if (models.length > 0) {
        const preferred = models.find(m => m.recommended || m.latest) || models[0]
        setModel(preferred.id)
      }
    }
  }

  const isLocalProvider = provider === 'lmstudio' || provider === 'ollama'
  const isOpenRouter = provider === 'openrouter'
  // All cloud providers route through OpenRouter, so we only need OpenRouter key
  const needsApiKey = isOpenRouter && !getApiKey('openrouter')
  const canRun = prompt.trim() && (!needsApiKey || isLocalProvider) && !loading

  // Get models to show in dropdown
  let providerModels
  if (isLocalProvider) {
    providerModels = LOCAL_MODELS
  } else if (isOpenRouter) {
    // OpenRouter shows all cloud models
    providerModels = MODELS.filter(m => !LOCAL_MODELS.some(lm => lm.id === m.id))
  } else {
    providerModels = MODELS_BY_PROVIDER[provider] || []
  }

  const selectedModel = isLocalProvider
    ? LOCAL_MODELS.find(m => m.id === model)
    : MODELS.find(m => m.id === model)

  return (
    <div className="app">
      <header className="header">
        <svg className="header-logo" viewBox="0 0 280 36" fill="none">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee"/>
              <stop offset="100%" stopColor="#06b6d4"/>
            </linearGradient>
          </defs>
          <g transform="translate(4, 18)">
            <path d="M0 0L10 7L20 0L10 -7L0 0Z" fill="url(#logoGrad)"/>
            <path d="M6 2L16 9L6 16L-4 9L6 2Z" fill="url(#logoGrad)" opacity="0.4"/>
          </g>
          <text x="32" y="24" fill="#ffffff" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="18" letterSpacing="-0.3">Prompt</text>
          <text x="95" y="24" fill="#22d3ee" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="18" letterSpacing="-0.3">Workbench</text>
        </svg>
        {demoMode && <span className="demo-badge">DEMO MODE</span>}
        <button className={`settings-btn ${showSettings ? 'active' : ''}`} onClick={() => setShowSettings(!showSettings)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </header>

      <SettingsPanel
        isOpen={showSettings}
        apiKeys={apiKeys}
        localConfig={localConfig}
        onSaveKey={(provider, key) => setApiKeys({ ...apiKeys, [provider]: key })}
        onSaveLocalConfig={(config) => setLocalConfig(config)}
        onClose={() => setShowSettings(false)}
      />

      <div className="top-bar">
        <div className="controls">
        <div className="control-group">
          <label>Provider</label>
          <select value={provider} onChange={e => handleProviderChange(e.target.value)}>
            {ALL_PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Model</label>
          <select value={model} onChange={e => setModel(e.target.value)}>
            {providerModels.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} {m.legacy ? '(legacy)' : ''} {m.recommended ? '★' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Temperature: {temperature}</label>
          <input
            type="range" min="0" max="2" step="0.1"
            value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Max Tokens</label>
          <input
            type="number" min="100" max="32000" step="100"
            value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))}
          />
        </div>

        <button
          className={`run-btn ${loading ? 'loading' : ''} ${!canRun && needsApiKey ? 'needs-key' : ''}`}
          onClick={runPrompt}
          disabled={!canRun}
        >
          {loading ? 'Running...' : 'Run'}
          <span className="shortcut">⌘↵</span>
          {!canRun && needsApiKey && (
            <span className="run-tooltip">
              Configure API key for {ALL_PROVIDERS.find(p => p.id === provider)?.name}
            </span>
          )}
          {!canRun && !needsApiKey && !prompt.trim() && (
            <span className="run-tooltip">Enter a prompt</span>
          )}
        </button>

        {demoMode ? (
          <button className="demo-btn active" onClick={disableDemoMode}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 9l6 6m0-6l-6 6"/>
            </svg>
            Exit Demo
          </button>
        ) : (
          <button className="demo-btn" onClick={enableDemoMode}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            Demo Mode
          </button>
        )}

        <button className="toggle-history" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? '◀' : '▶'} History
        </button>
        </div>

        <div className="model-info-bar">
          <div className="model-card">
            <div className="model-card-header">
              <div className="model-card-title-row">
                <a
                  className="model-card-title-link"
                  href="#"
                  onClick={(e) => { e.preventDefault(); window.location.reload(); }}
                  title={`Last updated: ${MODEL_DATA_VERSION}`}
                >
                  {selectedModel?.name || 'No model'}
                </a>
                <svg
                  className="model-card-refresh"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  onClick={() => window.location.reload()}
                  title={`Last updated: ${MODEL_DATA_VERSION}`}
                >
                  <polyline points="23,4 23,10 17,10"/>
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                </svg>
              </div>
              {selectedModel?.recommended && (
                <div className="model-card-recommended">
                  <span className="recommended-badge">★ Recommended</span>
                  <span className="recommended-reason">{selectedModel.desc}</span>
                </div>
              )}
            </div>
            {selectedModel && !isLocalProvider && (
              <div className="model-card-grid">
                <div className="model-card-item">
                  <span className="model-card-label">Context</span>
                  <span className="model-card-value">{selectedModel.context}</span>
                </div>
                <div className="model-card-item">
                  <span className="model-card-label">Input</span>
                  <span className="model-card-value">${selectedModel.inputCost}/1M</span>
                </div>
                <div className="model-card-item">
                  <span className="model-card-label">Output</span>
                  <span className="model-card-value">${selectedModel.outputCost}/1M</span>
                </div>
              </div>
            )}
            {isLocalProvider && (
              <div className="model-card-grid">
                <div className="model-card-item">
                  <span className="model-card-label">Type</span>
                  <span className="model-card-value local">Local</span>
                </div>
              </div>
            )}
            {selectedModel?.tags?.length > 0 && (
              <div className="model-card-tags">
                {selectedModel.tags.map(tag => (
                  <span key={tag} className="model-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="workspace" ref={workspaceRef}>
        <div className="main-panels">
          <div className="panel prompt-panel" style={{ flex: `0 0 ${splitRatio}%` }}>
            <div className="panel-header">
              <h2>Prompt</h2>
              <span className="char-count">{prompt.length} chars</span>
            </div>
            {demoMode && (
              <div className="demo-prompts">
                {DEMO_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    className={`demo-prompt-btn ${prompt === p ? 'active' : ''}`}
                    onClick={() => {
                      setPrompt(p)
                      const demoEntry = DEMO_HISTORY.find(h => h.prompt === p)
                      if (demoEntry) {
                        setOutput(demoEntry.output)
                        setStats(demoEntry.stats)
                        setProvider(demoEntry.provider || 'openai')
                        setModel(demoEntry.model)
                      }
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter your prompt here... Use {{variable}} for placeholders"
              spellCheck={false}
            />
          </div>

          <div
            className={`resize-handle ${isDragging ? 'active' : ''}`}
            onMouseDown={handleResizeMouseDown}
          >
            <div className="resize-handle-bar" />
          </div>

          <div className="panel output-panel">
            <div className="panel-header">
              <h2>Output</h2>
              {stats && (
                <span className="stats">
                  {stats.promptTokens} in + {stats.completionTokens} out = {stats.totalTokens} tokens • {stats.latency}ms • ${stats.cost}
                </span>
              )}
            </div>
            <div className="output-content">
              {error && <div className="error">{error}</div>}
              {loading && <div className="loading">Running...</div>}
              {output && <div className="output-text">{renderOutput(output)}</div>}
              {!output && !loading && !error && (
                <div className="empty-state">Output will appear here</div>
              )}
            </div>
            {output && (
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(output)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </button>
            )}
          </div>
        </div>
        
        {showHistory && (
          <div className="history-wrapper">
            {compareMode && (
              <div className="selection-bar">
                <span className="selection-info">
                  {selectedForCompare.length > 0
                    ? `${selectedForCompare.length} selected`
                    : 'Click items to select'}
                </span>
                <div className="selection-actions">
                  <button onClick={cancelSelect} className="cancel-select-btn">Cancel</button>
                  <button
                    onClick={openCompare}
                    className="compare-action-btn"
                    disabled={selectedForCompare.length < 2}
                  >
                    Compare {selectedForCompare.length > 0 ? `(${selectedForCompare.length})` : ''}
                  </button>
                  {selectedForCompare.length > 0 && (
                    <button onClick={deleteSelected} className="delete-selected-btn">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="history-panel">
              <div className="history-header">
                <h3>History</h3>
                {!compareMode && (
                  <button onClick={toggleCompareMode} className="select-mode-btn">
                    Select
                  </button>
                )}
              </div>
              <div className="history-list">
              {history.length === 0 && <div className="empty">No runs yet</div>}
              {history.map(entry => (
                <div
                  key={entry.id}
                  className={`history-item ${selectedForCompare.some(e => e.id === entry.id) ? 'selected' : ''}`}
                  onClick={() => compareMode ? toggleCompareSelection(entry) : loadFromHistory(entry)}
                >
                  <div className="history-meta">
                    <span className="model">{entry.model.split('/').pop()}</span>
                    <span className="time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="history-preview">{entry.prompt.slice(0, 50)}...</div>
                  {!compareMode && (
                    <button
                      className="delete-btn"
                      onClick={e => { e.stopPropagation(); deleteEntry(entry.id) }}
                    >
                      ×
                    </button>
                  )}
                  {compareMode && (
                    <div className="compare-check">
                      {selectedForCompare.some(e => e.id === entry.id) ? '✓' : '+'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>
          </div>
        )}

        {compareForModal && (
          <div className="compare-modal">
            <div className="compare-header">
              <h3>Compare Runs ({selectedForCompare.length})</h3>
              <button onClick={closeCompare}>×</button>
            </div>
            <div className="compare-content">
              <div className="compare-modal-history">
                <div className="compare-modal-history-header">
                  <span>Select runs to compare ({selectedForCompare.length} selected)</span>
                </div>
                <div className="compare-modal-history-list">
                  {history.length === 0 && <div className="empty">No runs yet</div>}
                  {history.map(entry => (
                    <div
                      key={entry.id}
                      className={`history-item ${selectedForCompare.some(e => e.id === entry.id) ? 'selected' : ''}`}
                      onClick={() => toggleCompareSelection(entry)}
                    >
                      <div className="history-meta">
                        <span className="model">{entry.model.split('/').pop()}</span>
                        <span className="time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="history-preview">{entry.prompt.slice(0, 50)}...</div>
                      <div className="compare-check">
                        {selectedForCompare.some(e => e.id === entry.id) ? '✓' : '+'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedForCompare.length >= 2 && (
                <>
                  <div className="compare-prompt">
                    <div className="compare-label">Prompt</div>
                    <div className="compare-value">{selectedForCompare[0].prompt}</div>
                  </div>
                  <div className="compare-grid">
                    {selectedForCompare.map((entry, i) => (
                      <div key={entry.id} className="compare-card">
                        <div className="compare-card-header">
                          <span className="compare-model">{entry.model.split('/').pop()}</span>
                          <button className="compare-remove" onClick={() => toggleCompareSelection(entry)}>×</button>
                        </div>
                        <div className="compare-stats">
                          <div className="compare-stat">
                            <span className="compare-stat-label">Input</span>
                            <span className="compare-stat-value">{entry.stats?.promptTokens || 0}</span>
                          </div>
                          <div className="compare-stat">
                            <span className="compare-stat-label">Output</span>
                            <span className="compare-stat-value">{entry.stats?.completionTokens || 0}</span>
                          </div>
                          <div className="compare-stat">
                            <span className="compare-stat-label">Total</span>
                            <span className="compare-stat-value">{entry.stats?.totalTokens || 0}</span>
                          </div>
                          <div className="compare-stat">
                            <span className="compare-stat-label">Time</span>
                            <span className="compare-stat-value">{entry.stats?.latency || 0}ms</span>
                          </div>
                          <div className="compare-stat">
                            <span className="compare-stat-label">Cost</span>
                            <span className="compare-stat-value">${entry.stats?.cost || '0'}</span>
                          </div>
                        </div>
                        <div className="compare-output">
                          <div className="compare-label">Output</div>
                          <div className="compare-output-text">{entry.output}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {selectedForCompare.length < 2 && selectedForCompare.length > 0 && (
                <div className="compare-select-prompt">
                  <div className="compare-label">Select at least 2 runs to compare</div>
                  <div className="compare-select-hint">Click on runs above to add them to comparison</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App