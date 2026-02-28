const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100)

    const rows = db
      .prepare(
        `
        SELECT
          id,
          created_at,
          question,
          answer,
          used_screenshot,
          provider,
          model
        FROM vision_queries
        ORDER BY id DESC
        LIMIT ?
      `,
      )
      .all(limit)

    res.json({ items: rows })
  } catch (err) {
    console.error('[/history] Error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
})

module.exports = router
