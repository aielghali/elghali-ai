/**
 * Z-AI SDK wrapper that reads configuration from environment variables
 * This allows the SDK to work on Vercel without a config file
 * 
 * Required Environment Variables:
 * - ZAI_BASE_URL: The API base URL (e.g., https://api.example.com/v1)
 * - ZAI_API_KEY: The API key
 * 
 * Optional:
 * - ZAI_CHAT_ID: Chat ID for context
 * - ZAI_USER_ID: User ID for tracking
 */

interface ZAIConfig {
  baseUrl: string
  apiKey: string
  chatId?: string
  userId?: string
}

// Get configuration from environment variables
function getConfigFromEnv(): ZAIConfig | null {
  const baseUrl = process.env.ZAI_BASE_URL
  const apiKey = process.env.ZAI_API_KEY
  
  if (baseUrl && apiKey) {
    return {
      baseUrl,
      apiKey,
      chatId: process.env.ZAI_CHAT_ID,
      userId: process.env.ZAI_USER_ID
    }
  }
  return null
}

// ZAI class implementation that matches the SDK interface
class ZAIClient {
  private config: ZAIConfig
  
  constructor(config: ZAIConfig) {
    this.config = config
  }
  
  private async makeRequest(endpoint: string, body: any) {
    const url = `${this.config.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Z-AI-From': 'Z'
    }
    
    if (this.config.chatId) headers['X-Chat-Id'] = this.config.chatId
    if (this.config.userId) headers['X-User-Id'] = this.config.userId
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }
    
    return response.json()
  }
  
  chat = {
    completions: {
      create: async (body: any) => {
        return this.makeRequest('/chat/completions', {
          ...body,
          thinking: body.thinking || { type: 'disabled' }
        })
      }
    }
  }
  
  functions = {
    invoke: async (name: string, args: any) => {
      return this.makeRequest('/functions/invoke', { name, arguments: args })
    }
  }
  
  images = {
    generations: {
      create: async (body: any) => {
        return this.makeRequest('/images/generations', body)
      }
    }
  }
}

// Create ZAI instance
async function createZAI() {
  // Try to get config from environment first
  const envConfig = getConfigFromEnv()
  
  if (envConfig) {
    console.log('[ZAI] Using configuration from environment variables')
    return new ZAIClient(envConfig)
  }
  
  // Fallback: try to load from SDK's file-based config
  try {
    const ZAIModule = await import('z-ai-web-dev-sdk').then(m => m.default || m)
    const instance = await ZAIModule.create()
    console.log('[ZAI] Using configuration from .z-ai-config file')
    return instance
  } catch (error) {
    throw new Error(
      'Z-AI configuration not found. Please set ZAI_BASE_URL and ZAI_API_KEY environment variables, ' +
      'or create a .z-ai-config file in your project directory.'
    )
  }
}

// Export a function to get ZAI instance
export async function getZAI() {
  return await createZAI()
}

export default getZAI
