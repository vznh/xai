import { ProviderKeys } from '@/types';

interface ModelConfig {
  provider: string;
  model: string;
  endpoint: string;
}

export class AgentRouter {
  private static MODELS: ModelConfig[] = [
    { provider: 'openai', model: 'gpt-5', endpoint: 'https://api.openai.com/v1/chat/completions' },
    { provider: 'grok', model: 'grok-4', endpoint: 'https://api.x.ai/v1/chat/completions' },
    { provider: 'gemini', model: 'gemini-2.5-pro', endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent' },
    { provider: 'claude', model: 'claude-3-opus-20240229', endpoint: 'https://api.anthropic.com/v1/messages' }
  ];

  static async callModel(
    prompt: string,
    providerKeys: ProviderKeys,
    agentName: string
  ): Promise<string> {
    for (const model of this.MODELS) {
      const key = providerKeys[model.provider as keyof ProviderKeys];
      if (!key) continue;

      try {
        const response = await this.makeRequest(model, key, prompt);
        return response;
      } catch (error) {
        console.error(`${model.provider} failed for ${agentName}:`, error);
        continue;
      }
    }

    throw new Error(`All providers failed for ${agentName}`);
  }

  private static async makeRequest(model: ModelConfig, apiKey: string, prompt: string): Promise<string> {
    switch (model.provider) {
      case 'openai':
      case 'grok':
        return this.callOpenAICompatible(model.endpoint, apiKey, model.model, prompt);
      
      case 'gemini':
        return this.callGemini(apiKey, prompt);
      
      case 'claude':
        return this.callClaude(apiKey, prompt);
      
      default:
        throw new Error(`Unknown provider: ${model.provider}`);
    }
  }

  private static async callOpenAICompatible(endpoint: string, apiKey: string, model: string, prompt: string): Promise<string> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callGemini(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private static async callClaude(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }
}