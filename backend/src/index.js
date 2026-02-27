const express = require('express')
const cors = require('cors')
const http = require('http')
const WebSocket = require('ws')
const { diffPercent } = require('./services/phash')
const db = require('./db/index')
const { loadConfig } = require('./config/loader')
const AIProvider = require('./services/AIProvider')
const configRoutes = require('./routes/config')
const providerRoutes = require('./routes/providers')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Init config + AI provider
const config = loadConfig()
global.aiProvider = new AIProvider(config)
console.log(`[ai] Provider initialized → ${config.provider}`)

// In-memory screenshot state
global.latestScreenshot = null
global.previousScreenshot = null

// Routes
app.use('/config', configRoutes)
app.use('/providers', providerRoutes)

// Health check
app.get('/ping', (req, res) => {
  res.json({ ok: true, service: 'Spktr Backend', version: '0.1.0' })
})

// Screenshot trigger
app.post('/screenshot/trigger', (req, res) => {
  const { base64, timestamp } = req.body
  if (!base64) return res.status(400).json({ error: 'No screenshot data' })
  global.latestScreenshot = { base64, timestamp: timestamp || Date.now() }
  console.log(`[screenshot] Received at ${new Date().toISOString()}`)
  res.json({ ok: true })
})

// DEBUG preview
app.get('/preview', (req, res) => {
  if (!global.latestScreenshot) {
    return res.send('<body style="background:#111;color:white;padding:20px"><h2>No screenshot yet</h2></body>')
  }
  res.send(`
    <html><body style="background:#111;margin:0;padding:20px">
      <h3 style="color:white;font-family:sans-serif">
        Latest capture — ${new Date(global.latestScreenshot.timestamp).toLocaleTimeString()}
      </h3>
      <img src="data:image/png;base64,${global.latestScreenshot.base64}"
        style="max-width:100%;border:1px solid #333;border-radius:8px"/>
    </body></html>
  `)
})

// WebSocket
wss.on('connection', (ws) => {
  console.log('[ws] Tauri client connected')
  ws.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg)
      if (data.type === 'screenshot') {
        const incoming = data.base64
        if (global.latestScreenshot) {
          const diff = await diffPercent(global.latestScreenshot.base64, incoming)
          console.log(`[phash] Diff: ${diff.toFixed(1)}%`)
          if (diff < 15) {
            console.log('[phash] Screen unchanged — skipping')
            return
          }
          db.prepare(`
            INSERT INTO screenshots (phash, diff_percent, timestamp)
            VALUES (?, ?, datetime('now'))
          `).run('phash-placeholder', diff)
          console.log(`[phash] Screen changed (${diff.toFixed(1)}%) — stored`)
        }
        global.previousScreenshot = global.latestScreenshot
        global.latestScreenshot = { base64: incoming, timestamp: Date.now() }
        console.log(`[ws] Screenshot stored — ${new Date().toISOString()}`)
      }
    } catch (e) {
      console.error('[ws] Error:', e.message)
    }
  })
  ws.on('close', () => console.log('[ws] Tauri client disconnected'))
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Spktr backend running on http://localhost:${PORT}`)
})
