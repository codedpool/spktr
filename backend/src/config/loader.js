const fs = require('fs')
const path = require('path')
const os = require('os')

const SPKTR_DIR = path.join(os.homedir(), '.spktr')
const CONFIG_PATH = path.join(SPKTR_DIR, 'config.json')

const DEFAULT_CONFIG = {
  provider: 'ollama',
  captureInterval: 7,
  proactiveMode: true,
  ollama: {
    baseURL: 'http://localhost:11434',
    model: 'llama4:scout'
  },
  lmstudio: {
    baseURL: 'http://localhost:1234',
    model: ''
  },
  groq: {
    apiKey: '',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct'
  }
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.mkdirSync(SPKTR_DIR, { recursive: true })
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2))
    console.log(`[config] Created default config at ${CONFIG_PATH}`)
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
  return JSON.parse(raw)
}

function saveConfig(newConfig) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2))
  console.log('[config] Saved')
}

module.exports = { loadConfig, saveConfig, CONFIG_PATH }
