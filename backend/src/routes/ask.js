const express = require('express')
const router = express.Router()
const db = require('../db')
const SPKTR_SYSTEM_PROMPT = require('../prompts/spktrSystem')

router.post('/', async (req, res) => {
  try {
    const {
      query,
      includeScreenshot = true,
      useHistory = true,
    } = req.body

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'query is required' })
    }

    if (!global.aiProvider || !global.aiProvider.isReady()) {
      return res.status(503).json({
        error: 'AI provider not initialized. Configure it in Settings first.',
      })
    }

    const hasScreenshot = includeScreenshot && global.latestScreenshot?.base64

    // ── Phase 6: fetch recent context ─────────────────────────────
    let contextText = ''
    if (useHistory) {
      try {
        const recent = db
          .prepare(
            `
            SELECT id, created_at, question, answer
            FROM vision_queries
            WHERE created_at >= datetime('now', '-30 minutes')
            ORDER BY id DESC
            LIMIT 5
          `,
          )
          .all()

        if (recent.length > 0) {
          const lines = recent.map((row, idx) => {
            const shortAns =
              row.answer.length > 140
                ? row.answer.slice(0, 137) + '...'
                : row.answer
            return `${idx + 1}) Q: ${row.question.trim()}\n   A: ${shortAns.trim()}`
          })

          contextText = `Here is the user's recent context from the last 30 minutes (most recent first):\n${lines.join(
            '\n',
          )}\n\nUse this only if it clearly helps answer the new question.`
        }
      } catch (e) {
        console.error('[/ask] history fetch error:', e)
      }
    }

    const content = []

    if (contextText) {
      content.push({
        type: 'text',
        text: contextText,
      })
    }

    content.push({
      type: 'text',
      text: `New user question: ${query}\n\nIf relevant, refer directly to the current screenshot.`,
    })

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
      screenshotId,
    )

    return res.json({
      answer,
      usedScreenshot: !!hasScreenshot,
    })
  } catch (err) {
    console.error('[/ask] Error:', err)
    return res
      .status(500)
      .json({ error: err.message || 'Internal server error' })
  }
})

module.exports = router
