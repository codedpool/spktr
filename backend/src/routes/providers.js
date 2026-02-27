const express = require('express')
const router = express.Router()

// GET /providers/test — ping active provider
router.get('/test', async (req, res) => {
  if (!global.aiProvider) {
    return res.status(503).json({ ok: false, error: 'AI provider not initialized' })
  }
  const result = await global.aiProvider.test()
  res.json(result)
})

module.exports = router
