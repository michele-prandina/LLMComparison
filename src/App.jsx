import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts'
import { llmModels, calculateCost, getRegionColor } from './data/pricing'
import { tokenize, formatTokenCount, getTiktokenTokens } from './utils/tokenizer'
import './App.css'

// SVGs and Components
const TextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
  </svg>
)

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
  </svg>
)

const LoaderIcon = () => (
  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// Add model capabilities to the pricing data
const modelCapabilities = {}

// Auto-populate capabilities for text models (default) and special cases
llmModels.forEach(m => {
  if (m.tier === 'coding') modelCapabilities[m.id] = ['text', 'coding']
  else if (m.tier === 'reasoning') modelCapabilities[m.id] = ['text', 'coding']
  else if (m.id.includes('vision') || m.id.includes('vl')) modelCapabilities[m.id] = ['text', 'coding', 'image']
  else if (m.id.includes('gpt-5') || m.id.includes('gpt-4')) modelCapabilities[m.id] = ['text', 'coding', 'image']
  else modelCapabilities[m.id] = ['text', 'coding']
})

// Add manual overrides for clarity
modelCapabilities['claude-3-5-sonnet'] = ['text', 'coding', 'image']
modelCapabilities['gemini-1-5-pro'] = ['text', 'coding', 'image', 'video']
modelCapabilities['gemini-1-5-flash'] = ['text', 'coding', 'image', 'video']
modelCapabilities['hf-kimi-k2-5'] = ['text', 'coding', 'image']

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('text')
  const [inputText, setInputText] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [processingFiles, setProcessingFiles] = useState([])
  const [outputTokens, setOutputTokens] = useState(1000)
  const [options, setOptions] = useState({
    useCaching: false,
    useBatch: false,
    isLongContext: false
  })
  const [filters, setFilters] = useState({
    region: 'all',
    tier: 'all',
    capability: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')

  const fileInputRef = useRef(null)

  // Token calculations
  const inputTokensFromText = useMemo(() => getTiktokenTokens(inputText), [inputText])
  const inputTokensFromFiles = useMemo(() =>
    uploadedFiles.reduce((sum, f) => sum + f.tokens, 0)
    , [uploadedFiles])

  const totalInputTokens = activeTab === 'text' ? inputTokensFromText : inputTokensFromFiles

  // Filtered and calculated models
  const results = useMemo(() => {
    return llmModels
      .filter(m => {
        const matchesRegion = filters.region === 'all' || m.region === filters.region
        const matchesTier = filters.tier === 'all' || m.tier === filters.tier
        const matchesCapability = filters.capability === 'all' || (modelCapabilities[m.id] && modelCapabilities[m.id].includes(filters.capability))
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.provider.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesRegion && matchesTier && matchesCapability && matchesSearch
      })
      .map(m => {
        const costData = calculateCost(m, totalInputTokens, outputTokens, {
          ...options,
          isLongContext: totalInputTokens > (m.longContextThreshold || Infinity)
        })
        return {
          ...m,
          ...costData
        }
      })
      .sort((a, b) => a.totalCost - b.totalCost)
  }, [totalInputTokens, outputTokens, options, filters, searchQuery])

  // Charts
  const chartData = results.slice(0, 10).map(r => ({
    name: r.name,
    cost: parseFloat(r.totalCost.toFixed(4)),
    input: parseFloat(r.inputCost.toFixed(4)),
    output: parseFloat(r.outputCost.toFixed(4))
  }))

  const handleFileUpload = async (files) => {
    const fileList = Array.from(files)
    const newFiles = []

    // Track processing
    const procIds = fileList.map(f => ({ id: Math.random(), name: f.name }))
    setProcessingFiles(prev => [...prev, ...procIds])

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const procId = procIds[i].id
      try {
        const fileData = await tokenize(file)
        const tokens = getTiktokenTokens(fileData.content)
        newFiles.push({
          id: Math.random(),
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          tokens
        })
      } catch (err) {
        console.error('Error processing file:', file.name, err)
      } finally {
        setProcessingFiles(prev => prev.filter(p => p.id !== procId))
      }
    }
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }

  return (
    <div className="container">
      <header className="header">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="brand"
        >
          <div className="brand-logo">LG</div>
          <div>
            <h1>LLM Comparison Tool</h1>
            <p>Calculate & compare API costs across 100+ models</p>
          </div>
        </motion.div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search models or providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="dashboard">
        <div className="input-section card">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              <TextIcon /> Text Input
              {inputTokensFromText > 0 && <span className="tab-badge">{formatTokenCount(inputTokensFromText)}</span>}
            </button>
            <button
              className={`tab ${activeTab === 'file' ? 'active' : ''}`}
              onClick={() => setActiveTab('file')}
            >
              <FileIcon /> File Upload
              {inputTokensFromFiles > 0 && <span className="tab-badge">{formatTokenCount(inputTokensFromFiles)}</span>}
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'text' ? (
              <textarea
                placeholder="Paste your prompt or document text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            ) : (
              <div
                className="dropzone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="dropzone-inner">
                  <FileIcon />
                  <p>Drop files here or click to upload</p>
                  <span>Supports PDF, TXT, MD, JS, PY, etc.</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            )}
          </div>

          {(uploadedFiles.length > 0 || processingFiles.length > 0) && activeTab === 'file' && (
            <div className="file-list">
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <div className="file-meta">
                    <span>{file.size}</span>
                    <span className="file-tokens">{formatTokenCount(file.tokens)} tokens</span>
                    <button onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}>×</button>
                  </div>
                </div>
              ))}
              {processingFiles.map(file => (
                <div key={file.id} className="file-item processing">
                  <span className="file-name">{file.name}</span>
                  <div className="file-meta">
                    <LoaderIcon />
                    <span>Processing...</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="controls-section card">
          <h3>Simulation Parameters</h3>

          <div className="control-group">
            <label>Output Tokens</label>
            <div className="output-token-edit">
              <input
                type="number"
                value={outputTokens}
                onChange={(e) => setOutputTokens(parseInt(e.target.value) || 0)}
              />
              <span className="output-context">
                ≈ {(outputTokens * 0.75).toFixed(0)} words / {(outputTokens / 500).toFixed(1)} pages
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="32000"
              value={outputTokens}
              onChange={(e) => setOutputTokens(parseInt(e.target.value))}
            />
          </div>

          <div className="options-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.useCaching}
                onChange={(e) => setOptions({ ...options, useCaching: e.target.checked })}
              />
              Cached Input
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.useBatch}
                onChange={(e) => setOptions({ ...options, useBatch: e.target.checked })}
              />
              Batch API
            </label>
          </div>

          <hr />

          <div className="filters">
            <div className="filter-group">
              <label>Region</label>
              <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}>
                <option value="all">All Regions</option>
                <option value="🇺🇸">🇺🇸 US</option>
                <option value="🇪🇺">🇪🇺 EU</option>
                <option value="🇨🇳">🇨🇳 China</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Tier</label>
              <select value={filters.tier} onChange={(e) => setFilters({ ...filters, tier: e.target.value })}>
                <option value="all">All Tiers</option>
                <option value="flagship">Flagship / Pro</option>
                <option value="efficient">Efficient / Flash</option>
                <option value="reasoning">Reasoning</option>
                <option value="coding">Coding</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Usage</label>
              <select value={filters.capability} onChange={(e) => setFilters({ ...filters, capability: e.target.value })}>
                <option value="all">Any Capability</option>
                <option value="text">Text / Chat</option>
                <option value="coding">Coding</option>
                <option value="image">Vision / Image</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h2>Pricing Analysis</h2>
          <span className="results-count">Showing {results.length} models</span>
        </div>

        <div className="results-grid">
          <div className="chart-card card">
            <h3>Cost Estimation (Top 10)</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40, top: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={10} width={100} />
                  <RechartsTooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="input" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="output" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-card card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Provider</th>
                    <th>Region</th>
                    <th>Total Cost</th>
                    <th>Est. Tokens/s</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {results.map((r, index) => (
                      <motion.tr
                        key={r.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        layout
                        className={index === 0 ? 'best-value' : ''}
                      >
                        <td>
                          <div className="model-name-cell">
                            {r.name}
                            {index === 0 && <span className="badge">Best Value</span>}
                          </div>
                        </td>
                        <td>{r.provider}</td>
                        <td>
                          <span className="region-badge" style={{ backgroundColor: getRegionColor(r.region) }}>
                            {r.region}
                          </span>
                        </td>
                        <td className="cost-cell">${r.totalCost.toFixed(4)}</td>
                        <td>{r.tier === 'reasoning' ? 'Slow' : r.tier === 'efficient' ? 'Turbo' : 'Normal'}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>© 2025 LLM Comparison Tool • Data updated with latest OpenAI & Hugging Face pricing</p>
      </footer>
    </div>
  )
}

export default App
