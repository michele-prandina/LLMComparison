import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { llmModels, calculateCost, getRegionColor } from './data/pricing'
import { estimateTokens, readFileAsText, formatTokenCount, formatCurrency } from './utils/tokenizer'
import './App.css'

// Icons
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const TextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
)

const LoaderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

// Add model capabilities to the pricing data
const modelCapabilities = {
  'gpt-4o': ['text', 'coding', 'image'],
  'gpt-4o-mini': ['text', 'coding', 'image'],
  'o1': ['text', 'coding'],
  'o1-mini': ['text', 'coding'],
  'claude-3-5-sonnet': ['text', 'coding', 'image'],
  'claude-3-5-haiku': ['text', 'coding'],
  'claude-3-opus': ['text', 'coding', 'image'],
  'gemini-1-5-pro': ['text', 'coding', 'image', 'video'],
  'gemini-1-5-flash': ['text', 'coding', 'image', 'video'],
  'mistral-large-2': ['text', 'coding'],
  'mistral-small': ['text', 'coding'],
  'mixtral-8x7b': ['text', 'coding'],
  'deepseek-v2-5': ['text', 'coding'],
  'deepseek-coder': ['text', 'coding'],
  'qwen-2-5-72b': ['text', 'coding'],
  'qwen-2-5-7b': ['text', 'coding'],
  'moonshot-v1-8k': ['text', 'coding'],
  'moonshot-v1-128k': ['text', 'coding'],
  'kimi-k1-5': ['text', 'coding', 'image'],
  'kimi-2-5': ['text', 'coding', 'image'],
  'eleven-turbo-v2-5': ['audio'],
  'whisper-1': ['audio'],
  'kling-v1-5': ['video']
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [useCaching, setUseCaching] = useState(false)
  const [useBatch, setUseBatch] = useState(false)
  const [sortBy, setSortBy] = useState('totalCost')
  const [sortDirection, setSortDirection] = useState('asc')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [usageFilter, setUsageFilter] = useState('all')
  const [manualOutputTokens, setManualOutputTokens] = useState(null)
  const [isEditingOutput, setIsEditingOutput] = useState(false)
  const [tempOutputValue, setTempOutputValue] = useState('')
  const [processingFiles, setProcessingFiles] = useState([])

  // Apply theme to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode')
    } else {
      document.body.classList.add('light-mode')
    }
  }, [isDarkMode])

  // Calculate input tokens from text and files
  const inputTokensFromText = useMemo(() => estimateTokens(textInput), [textInput])
  const inputTokensFromFiles = useMemo(() =>
    files.reduce((sum, f) => sum + f.tokens, 0), [files]
  )
  const totalInputTokens = inputTokensFromText + inputTokensFromFiles

  // Estimate output tokens as 30% of input (reasonable default), with minimum of 100
  const estimatedOutputTokens = totalInputTokens > 0 ? Math.max(Math.ceil(totalInputTokens * 0.3), 100) : 1000
  const isLongContext = totalInputTokens > 128000

  // Filter models by usage type
  const filteredModels = useMemo(() => {
    if (usageFilter === 'all') return llmModels
    return llmModels.filter(model =>
      modelCapabilities[model.id]?.includes(usageFilter)
    )
  }, [usageFilter])

  // Calculate costs for filtered models - always show with default 1k/1k tokens if empty
  const modelResults = useMemo(() => {
    // Use minimum of 1000 tokens for display if nothing entered yet
    const inputForCalc = Math.max(totalInputTokens, 1000)
    const finalOutputTokens = manualOutputTokens !== null ? manualOutputTokens : estimatedOutputTokens
    const outputForCalc = totalInputTokens > 0 ? finalOutputTokens : Math.max(finalOutputTokens, 1000)

    return filteredModels.map(model => {
      const costs = calculateCost(model, inputForCalc, outputForCalc, {
        useCaching,
        useBatch,
        isLongContext
      })
      return { ...model, ...costs }
    }).sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name)
      else if (sortBy === 'provider') comparison = a.provider.localeCompare(b.provider)
      else if (sortBy === 'region') comparison = a.region.localeCompare(b.region)
      else if (sortBy === 'inputCost') comparison = a.inputCost - b.inputCost
      else if (sortBy === 'outputCost') comparison = a.outputCost - b.outputCost
      else if (sortBy === 'totalCost') comparison = a.totalCost - b.totalCost
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredModels, totalInputTokens, estimatedOutputTokens, manualOutputTokens, useCaching, useBatch, isLongContext, sortBy, sortDirection])

  const bestValue = useMemo(() => {
    if (modelResults.length === 0) return null
    return [...modelResults].sort((a, b) => a.totalCost - b.totalCost)[0]
  }, [modelResults])

  // File handling
  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)

    // Add all to processing state first
    const processingIds = droppedFiles.map(f => ({ id: Math.random(), name: f.name }))
    setProcessingFiles(prev => [...prev, ...processingIds])

    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i]
      const procId = processingIds[i].id
      try {
        const result = await readFileAsText(file)
        const newFile = {
          id: Date.now() + Math.random(),
          name: result.name,
          tokens: estimateTokens(result.content),
          size: result.size
        }
        setFiles(prev => [...prev, newFile])
      } catch (err) {
        console.error(err.message)
      } finally {
        setProcessingFiles(prev => prev.filter(p => p.id !== procId))
      }
    }
  }, [setProcessingFiles, setFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const removeFile = useCallback((id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const handleFileInput = useCallback(async (e) => {
    const selectedFiles = Array.from(e.target.files)

    // Add all to processing state first
    const processingIds = selectedFiles.map(f => ({ id: Math.random(), name: f.name }))
    setProcessingFiles(prev => [...prev, ...processingIds])

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const procId = processingIds[i].id
      try {
        const result = await readFileAsText(file)
        const newFile = {
          id: Date.now() + Math.random(),
          name: result.name,
          tokens: estimateTokens(result.content),
          size: result.size
        }
        setFiles(prev => [...prev, newFile])
      } catch (err) {
        console.error(err.message)
      } finally {
        setProcessingFiles(prev => prev.filter(p => p.id !== procId))
      }
    }
  }, [setProcessingFiles, setFiles])

  const handleRowClick = useCallback((url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }, [sortBy])

  const startEditingOutput = () => {
    setTempOutputValue((manualOutputTokens !== null ? manualOutputTokens : estimatedOutputTokens).toString())
    setIsEditingOutput(true)
  }

  const saveOutputOverride = () => {
    const value = parseInt(tempOutputValue, 10)
    if (!isNaN(value) && value >= 0) {
      setManualOutputTokens(value)
    }
    setIsEditingOutput(false)
  }

  const resetOutputOverride = () => {
    setManualOutputTokens(null)
    setIsEditingOutput(false)
  }

  return (
    <div className="app">
      <motion.header
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1><span className="gradient-text">LLM Pricing</span> Comparison</h1>
          <p>Compare costs across different language models based on your content</p>
        </div>

        <motion.button
          className="theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </motion.button>
      </motion.header>

      {/* Input Section */}
      <motion.div
        className="input-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            <TextIcon /> Text Input
            {inputTokensFromText > 0 && (
              <span className="tab-badge">{formatTokenCount(inputTokensFromText)}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            <FileIcon /> File Upload
            {inputTokensFromFiles > 0 && (
              <span className="tab-badge">{formatTokenCount(inputTokensFromFiles)}</span>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'text' && (
            <motion.div
              key="text"
              className="tab-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-input-wrapper">
                <textarea
                  className="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your text here to estimate token count and compare pricing across LLM providers..."
                />
                <motion.div
                  className="token-badge"
                  key={inputTokensFromText}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {formatTokenCount(inputTokensFromText)} tokens
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'file' && (
            <motion.div
              key="file"
              className="tab-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-input').click()}
              >
                <motion.div
                  className="drop-icon"
                  animate={{ y: isDragging ? -10 : 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <UploadIcon />
                </motion.div>
                <p>Drop files here or click to browse</p>
                <small>Supports .txt, .md, .pdf, .json, .csv, and more</small>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".txt,.md,.pdf,.json,.csv,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.css,.scss,.yaml,.yml,.toml,.ini,.log,.sh,.bash,.env"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>

              <AnimatePresence>
                {(files.length > 0 || processingFiles.length > 0) && (
                  <div className="file-list">
                    {processingFiles.map(file => (
                      <motion.div
                        key={file.id}
                        className="file-item processing"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <div className="file-info">
                          <span className="file-icon loading"><LoaderIcon /></span>
                          <span className="file-name">{file.name}</span>
                          <span className="file-status">Processing...</span>
                        </div>
                      </motion.div>
                    ))}
                    {files.map(file => (
                      <motion.div
                        key={file.id}
                        className="file-item"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <div className="file-info">
                          <span className="file-icon"><FileIcon /></span>
                          <span className="file-name">{file.name}</span>
                          <span className="file-tokens">{formatTokenCount(file.tokens)} tokens</span>
                        </div>
                        <button
                          className="file-remove"
                          onClick={() => removeFile(file.id)}
                        >
                          <XIcon />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        className="controls-bar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="control-group">
          <label>Usage Type:</label>
          <select value={usageFilter} onChange={(e) => setUsageFilter(e.target.value)}>
            <option value="all">All Models</option>
            <option value="text">Text Only</option>
            <option value="coding">Coding</option>
            <option value="image">Image Support</option>
            <option value="video">Video Support</option>
            <option value="audio">Audio Support</option>
          </select>
        </div>

        <div className="control-group">
          <label>Caching</label>
          <motion.div
            className={`toggle ${useCaching ? 'active' : ''}`}
            onClick={() => setUseCaching(!useCaching)}
            whileTap={{ scale: 0.95 }}
          />
        </div>

        <div className="control-group">
          <label>Batch</label>
          <motion.div
            className={`toggle ${useBatch ? 'active' : ''}`}
            onClick={() => setUseBatch(!useBatch)}
            whileTap={{ scale: 0.95 }}
          />
        </div>

        <div className="control-group sort-dropdown">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="totalCost">Total Cost</option>
            <option value="inputCost">Input Cost</option>
            <option value="outputCost">Output Cost</option>
            <option value="provider">Provider</option>
            <option value="region">Region</option>
            <option value="name">Model Name</option>
          </select>
        </div>
      </motion.div>

      {/* Results Table - Always Visible */}
      <motion.section
        className="results-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="results-header">
          <h2>Cost Comparison</h2>
          {modelResults.length > 0 ? (
            <div className="results-count">
              Showing {modelResults.length} models • {formatTokenCount(totalInputTokens)} input +
              <div className="output-token-edit">
                {isEditingOutput ? (
                  <div className="edit-box">
                    <input
                      type="text"
                      value={tempOutputValue}
                      onChange={(e) => setTempOutputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveOutputOverride()}
                      autoFocus
                    />
                    <button className="confirm-btn" onClick={saveOutputOverride}><CheckIcon /></button>
                    <button className="cancel-btn" onClick={resetOutputOverride}><XIcon /></button>
                  </div>
                ) : (
                  <>
                    <span className={manualOutputTokens !== null ? 'overridden' : ''}>
                      {formatTokenCount(manualOutputTokens !== null ? manualOutputTokens : estimatedOutputTokens)} output {manualOutputTokens === null ? '(est.)' : ''}
                    </span>
                    <span className="output-context">
                      ≈ {Math.round((manualOutputTokens !== null ? manualOutputTokens : estimatedOutputTokens) * 0.75).toLocaleString()} words / {((manualOutputTokens !== null ? manualOutputTokens : estimatedOutputTokens) / 500).toFixed(1)} pages
                    </span>
                    <button className="edit-btn" onClick={startEditingOutput}>
                      <EditIcon /> edit
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="results-count">Enter text or upload files to see pricing comparison</p>
          )}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className={`sortable ${sortBy === 'name' ? 'sorted' : ''}`} onClick={() => handleSort('name')}>
                  Model
                  <span className="sort-indicator">
                    {sortBy === 'name' ? (sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ChevronUpIcon />}
                  </span>
                </th>
                <th className={`sortable ${sortBy === 'provider' ? 'sorted' : ''}`} onClick={() => handleSort('provider')}>
                  Provider
                  <span className="sort-indicator">
                    {sortBy === 'provider' ? (sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ChevronUpIcon />}
                  </span>
                </th>
                <th className={`sortable ${sortBy === 'region' ? 'sorted' : ''}`} onClick={() => handleSort('region')}>
                  Region
                  <span className="sort-indicator">
                    {sortBy === 'region' ? (sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ChevronUpIcon />}
                  </span>
                </th>
                <th className={`sortable ${sortBy === 'inputCost' ? 'sorted' : ''}`} onClick={() => handleSort('inputCost')}>
                  Input Cost
                  <span className="sort-indicator">
                    {sortBy === 'inputCost' ? (sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ChevronUpIcon />}
                  </span>
                </th>
                <th className={`sortable ${sortBy === 'outputCost' ? 'sorted' : ''}`} onClick={() => handleSort('outputCost')}>
                  Output Cost
                  <span className="sort-indicator">
                    {sortBy === 'outputCost' ? (sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ChevronUpIcon />}
                  </span>
                </th>
                <th className={`sortable ${sortBy === 'totalCost' ? 'sorted' : ''}`} onClick={() => handleSort('totalCost')}>
                  Total Cost
                  <span className="sort-indicator">
                    {sortBy === 'totalCost' ? (sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ChevronUpIcon />}
                  </span>
                </th>
                <th>Features</th>
              </tr>
            </thead>
            <tbody>
              {modelResults.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {modelResults.map((model, index) => (
                    <motion.tr
                      key={model.id}
                      className={model.id === bestValue?.id ? 'best-value' : ''}
                      onClick={() => handleRowClick(model.pricingUrl)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                      layout
                      whileHover={{ scale: 1.005 }}
                    >
                      <td>
                        <div className="model-cell">
                          <span className="model-name">{model.name}</span>
                          {model.id === bestValue?.id && (
                            <span className="best-badge">Best</span>
                          )}
                        </div>
                      </td>
                      <td className="model-provider">{model.provider}</td>
                      <td>
                        <span className={`region-badge ${model.region.toLowerCase()}`}>
                          {model.region}
                        </span>
                      </td>
                      <td className="price-cell">{formatCurrency(model.inputCost)}</td>
                      <td className="price-cell">{formatCurrency(model.outputCost)}</td>
                      <td className="price-cell total-price">{formatCurrency(model.totalCost)}</td>
                      <td>
                        <div className="feature-tags">
                          <span className={`feature-tag ${model.supportsCaching && useCaching ? 'active' : ''}`}>
                            {model.supportsCaching ? 'Cache' : 'No Cache'}
                          </span>
                          <span className={`feature-tag ${model.supportsBatch && useBatch ? 'active' : ''}`}>
                            {model.supportsBatch ? 'Batch' : 'No Batch'}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table-message">
                    <TextIcon />
                    <p>Enter text or upload files to compare LLM pricing</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Chart Visualization */}
      {modelResults.length > 0 && (
        <motion.div
          className="chart-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="chart-title">Price Visualization (Top 10 Models)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={modelResults.slice(0, 10).map(m => ({
                name: m.name,
                cost: m.totalCost,
                provider: m.provider
              }))}
              layout="vertical"
              margin={{ left: 140, right: 20, top: 10, bottom: 10 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => formatCurrency(v)}
                stroke="var(--text-muted)"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                stroke="var(--text-muted)"
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }}
                cursor={{ fill: 'var(--bg-card-hover)' }}
              />
              <Bar
                dataKey="cost"
                radius={[0, 4, 4, 0]}
                animationDuration={800}
              >
                {modelResults.slice(0, 10).map((model, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getRegionColor(model.region)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}

export default App
