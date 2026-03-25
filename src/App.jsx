import { useState, useEffect, useCallback } from 'react'
import './App.css'

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'OpenAI flagship' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Fast & cheap' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5', desc: 'Anthropic' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0', desc: 'Google' },
]

const DEMO_HISTORY = [
  {
    id: 1,
    prompt: 'Generate 5 behavioral interview questions for a senior QA engineer role focusing on test automation and team leadership.',
    output: '1. Describe a time when you had to mentor a junior team member on test automation. How did you approach it and what was the outcome?\n\n2. Tell me about a challenging bug you encountered in a production environment. How did you identify the root cause and what steps did you take to prevent it from happening again?\n\n3. Talk about a time when you had to convince your team to adopt a new testing framework or methodology. What was your strategy and how did you get buy-in?\n\n4. Describe a situation where you had to balance tight deadlines with thorough testing. How did you prioritize and what trade-offs did you make?\n\n5. Give an example of a time when you identified a significant quality issue in a product before release. What was the issue and how did you handle it?',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2048,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    stats: { tokens: 245, latency: 1840 }
  },
  {
    id: 2,
    prompt: 'Compare the writing style and depth of responses between gpt-4o-mini and claude-3-5-sonnet for the same prompt about API testing.',
    output: 'GPT-4o Mini tends to be more direct and concise, providing bullet-pointed answers. Claude 3.5 Sonnet offers more conversational, detailed responses with better context explanation. For technical topics, Claude often provides more thorough explanations while GPT optimizes for brevity.',
    model: 'gemini-2.0-flash',
    temperature: 0.5,
    maxTokens: 1024,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    stats: { tokens: 156, latency: 2100 }
  },
  {
    id: 3,
    prompt: 'Write a Python function that uses Playwright to take screenshots of all links on a webpage and save them to a folder.',
    output: '```python\nimport asyncio\nfrom playwright.async_api import async_playwright\nimport os\n\nasync def screenshot_all_links(url: str, output_dir: str = "screenshots"):\n    os.makedirs(output_dir, exist_ok=True)\n    \n    async with async_playwright() as p:\n        browser = await p.chromium.launch()\n        page = await browser.new_page()\n        await page.goto(url)\n        \n        links = await page.query_selector_all("a")\n        \n        for i, link in enumerate(links):\n            href = await link.get_attribute("href")\n            if href and href.startswith("http"):\n                try:\n                    await page.goto(href)\n                    await page.screenshot(path=f"{output_dir}/link_{i}.png", full_page=True)\n                except Exception as e:\n                    print(f"Failed to screenshot {href}: {e}")\n        \n        await browser.close()\n\nasyncio.run(screenshot_all_links("https://example.com"))\n```',
    model: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 2048,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    stats: { tokens: 312, latency: 3200 }
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
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Numbered lists
      .replace(/^(\d+)\.\s/gm, '<li>$1. ')
      .replace(/(<li>\d+\.\s.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Bullet points
      .replace(/^[-*]\s/gm, '<li>• ')
    
    return <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
  })
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('gpt-4o-mini')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('prompt-history')
    if (saved) setHistory(JSON.parse(saved))
    const savedPrompt = localStorage.getItem('current-prompt')
    if (savedPrompt) setPrompt(savedPrompt)
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
  }

  const runPrompt = useCallback(async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    setError('')
    setOutput('')
    setStats(null)
    
    const startTime = Date.now()
    
    try {
      const response = await fetch('https://api.openrouter.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('openrouter_key') || import.meta.env.VITE_OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        })
      })
      
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      
      const data = await response.json()
      const latency = Date.now() - startTime
      
      const content = data.choices?.[0]?.message?.content || 'No response'
      setOutput(content)
      setStats({
        tokens: data.usage?.total_tokens || 0,
        latency
      })
      
      const newEntry = {
        id: Date.now(),
        prompt,
        output: content,
        model,
        temperature,
        maxTokens,
        timestamp: new Date().toISOString(),
        stats: { tokens: data.usage?.total_tokens || 0, latency }
      }
      
      const newHistory = [newEntry, ...history].slice(0, 50)
      setHistory(newHistory)
      localStorage.setItem('prompt-history', JSON.stringify(newHistory))
      
    } catch (err) {
      setError(err.message || 'Failed to run prompt')
    } finally {
      setLoading(false)
    }
  }, [prompt, model, temperature, maxTokens, history])

  const loadFromHistory = (entry) => {
    setPrompt(entry.prompt)
    setOutput(entry.output)
    setModel(entry.model)
    setTemperature(entry.temperature)
    setMaxTokens(entry.maxTokens)
    setStats(entry.stats)
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

  return (
    <div className="app">
      <header className="header">
        <h1>🧪 Prompt Workbench</h1>
        <span className="tagline">Experiment, iterate, ship better prompts</span>
        {demoMode && <span className="demo-badge">🎭 DEMO MODE</span>}
      </header>
      
      <div className="controls">
        <div className="control-group">
          <label>Model</label>
          <select value={model} onChange={e => setModel(e.target.value)}>
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>
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
          className={`run-btn ${loading ? 'loading' : ''}`}
          onClick={runPrompt} 
          disabled={!prompt.trim() || loading}
        >
          {loading ? 'Running...' : 'Run'} 
          <span className="shortcut">⌘↵</span>
        </button>
        
        {demoMode ? (
          <button className="demo-btn active" onClick={disableDemoMode}>
            🎭 Exit Demo
          </button>
        ) : (
          <button className="demo-btn" onClick={enableDemoMode}>
            🎭 Demo Mode
          </button>
        )}
        
        <button className="toggle-history" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? '◀' : '▶'} History
        </button>
      </div>
      
      <div className="workspace">
        <div className="main-panels">
          <div className="panel prompt-panel">
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
          
          <div className="panel output-panel">
            <div className="panel-header">
              <h2>Output</h2>
              {stats && (
                <span className="stats">
                  {stats.tokens} tokens • {stats.latency}ms
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
                📋 Copy
              </button>
            )}
          </div>
        </div>
        
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3>History</h3>
              <button onClick={clearHistory}>Clear All</button>
            </div>
            <div className="history-list">
              {history.length === 0 && <div className="empty">No runs yet</div>}
              {history.map(entry => (
                <div 
                  key={entry.id} 
                  className="history-item"
                  onClick={() => loadFromHistory(entry)}
                >
                  <div className="history-meta">
                    <span className="model">{entry.model}</span>
                    <span className="time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="history-preview">{entry.prompt.slice(0, 60)}...</div>
                  <button 
                    className="delete-btn"
                    onClick={e => { e.stopPropagation(); deleteEntry(entry.id) }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App