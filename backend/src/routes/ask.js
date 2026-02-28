const express = require('express')
const router = express.Router()
const db = require('../db')
const SPKTR_SYSTEM_PROMPT = require('../prompts/spktrSystem')

router.post('/', async (req, res) => {
  try {
    const { query, includeScreenshot = true } = req.body

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'query is required' })
    }

    if (!global.aiProvider || !global.aiProvider.isReady()) {
      return res.status(503).json({
        error: 'AI provider not initialized. Configure it in Settings first.',
      })
    }

    const hasScreenshot = includeScreenshot && global.latestScreenshot?.base64

    const content = [
      {
        type: 'text',
        text: `User question: ${query}\n\nIf relevant, refer directly to the current screenshot.`,
      },
    ]

    if (hasScreenshot) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${global.latestScreenshot.base64}`,
          detail: 'auto',
        },
      })
    }

    const messages = [
      { role: 'system', content: SPKTR_SYSTEM_PROMPT },
      { role: 'user', content },
    ]

    const answer = await global.aiProvider.chat(messages)

    // For now we don't join to screenshots table; keep null
    const screenshotId = null

    const insert = db.prepare(`
      INSERT INTO vision_queries (
        question,
        answer,
        used_screenshot,
        provider,
        model,
        screenshot_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)

    insert.run(
      query,
      answer,
      hasScreenshot ? 1 : 0,
      global.aiProvider.provider || null,
      global.aiProvider.model || null,
      screenshotId
    )

    return res.json({
      answer,
      usedScreenshot: !!hasScreenshot,
    })
  } catch (err) {
    console.error('[/ask] Error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
})

module.exports = router
