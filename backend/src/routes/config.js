const express = require('express')
const router = express.Router()
const { loadConfig, saveConfig } = require('../config/loader')

// GET /config — return current config (mask API key)
router.get('/', (req, res) => {
  const config = loadConfig()
  // Mask groq API key
  const safe = JSON.parse(JSON.stringify(config))
  if (safe.groq?.apiKey) {
    safe.groq.apiKey = safe.groq.apiKey.slice(0, 8) + '...'
  }
  res.json(safe)
})

// POST /config — update config + hot-reload provider
router.post('/', (req, res) => {
  const current = loadConfig()
  const updated = { ...current, ...req.body }
  saveConfig(updated)
  // Hot-reload the global AIProvider instance
  if (global.aiProvider) {
    global.aiProvider.reload(updated)
  }
  res.json({ ok: true, provider: updated.provider })
})

module.exports = router
