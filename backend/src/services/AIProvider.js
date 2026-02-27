const OpenAI = require('openai')

class AIProvider {
  constructor(config) {
    this.config = config
    this.client = this._buildClient(config)
  }

  _buildClient(config) {
    switch (config.provider) {
      case 'ollama':
        return new OpenAI({
          baseURL: `${config.ollama.baseURL}/v1`,
          apiKey: 'ollama'
        })
      case 'lmstudio':
        return new OpenAI({
          baseURL: `${config.lmstudio.baseURL}/v1`,
          apiKey: 'lmstudio'
        })
      case 'groq':
        return new OpenAI({
          baseURL: 'https://api.groq.com/openai/v1',
          apiKey: config.groq.apiKey
        })
      default:
        throw new Error(`Unknown provider: ${config.provider}`)
    }
  }

  _getModel() {
    switch (this.config.provider) {
      case 'ollama':   return this.config.ollama.model
      case 'lmstudio': return this.config.lmstudio.model
      case 'groq':     return this.config.groq.model
    }
  }

  // Reload client when config changes (hot-swap)
  reload(newConfig) {
    this.config = newConfig
    this.client = this._buildClient(newConfig)
    console.log(`[ai] Provider reloaded → ${newConfig.provider}`)
  }

  // Test if provider is reachable — returns { ok, model, latency }
  async test() {
    const start = Date.now()
    try {
      const models = await this.client.models.list()
      const latency = Date.now() - start
      return {
        ok: true,
        provider: this.config.provider,
        model: this._getModel(),
        latency,
        availableModels: models.data.map(m => m.id).slice(0, 10)
      }
    } catch (err) {
      return {
        ok: false,
        provider: this.config.provider,
        error: err.message
      }
    }
  }

  // Stream a vision chat message — yields chunks
  async *chatStream(messages, imageBase64 = null) {
    const content = []

    if (imageBase64) {
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${imageBase64}` }
      })
    }

    // Add the last user message text into content
    const lastUser = messages.findLast(m => m.role === 'user')
    if (lastUser) {
      content.push({ type: 'text', text: lastUser.content })
    }

    const finalMessages = [
      ...messages.filter(m => m.role !== 'user' || m !== lastUser),
      { role: 'user', content: imageBase64 ? content : lastUser.content }
    ]

    const stream = await this.client.chat.completions.create({
      model: this._getModel(),
      messages: finalMessages,
      stream: true,
      max_tokens: 1024
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content
      if (text) yield text
    }
  }
}

module.exports = AIProvider
