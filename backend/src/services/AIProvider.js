const OpenAI = require('openai');

class AIProvider {
  constructor(config) {
    this.provider = config.provider || null;
    this.model = null;
    this.client = null;

    if (!config.provider) {
      console.warn('[AIProvider] No provider config found — waiting for configuration');
      return;
    }

    if (config.provider === 'groq') {
      const apiKey = config.groq?.apiKey;
      if (!apiKey) {
        console.warn('[AIProvider] Groq selected but no apiKey found — skipping init');
        return;
      }
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      this.model = config.groq?.model || 'meta-llama/llama-4-scout-17b-16e-instruct';

    } else if (config.provider === 'ollama') {
      this.client = new OpenAI({
        apiKey: 'ollama',
        baseURL: config.ollama?.baseURL || 'http://localhost:11434/v1',
      });
      this.model = config.ollama?.model || 'moondream';

    } else if (config.provider === 'lmstudio') {
      this.client = new OpenAI({
        apiKey: 'lmstudio',
        baseURL: config.lmstudio?.baseURL || 'http://localhost:1234/v1',
      });
      this.model = config.lmstudio?.model || '';
    }

    if (this.client) {
      console.log(`[AIProvider] Ready → ${this.provider} | model: ${this.model}`);
    }
  }

  async chat(messages) {
    if (!this.client) throw new Error('AIProvider client not initialized');

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: 512,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  }

  isReady() {
    return !!this.client;
  }
}

module.exports = AIProvider;
