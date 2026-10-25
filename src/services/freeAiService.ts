// =======================================================================
// FREE AI SERVICE (100% Free: Google Gemini Free Tier & Local Ollama)
// Zero subscription or hosting cost for the user
// =======================================================================

export interface FreeAiOptions {
  provider: 'gemini' | 'ollama';
  geminiApiKey?: string;
  ollamaEndpoint?: string;
  model?: string;
}

export async function generateFreeAiPrompt(
  systemPrompt: string,
  userPrompt: string,
  options: FreeAiOptions
): Promise<string> {
  const { provider, geminiApiKey, ollamaEndpoint = 'http://localhost:11434', model } = options;

  if (provider === 'gemini') {
    if (!geminiApiKey || !geminiApiKey.trim()) {
      throw new Error('Please enter your free Google Gemini API key (free tier from ai.google.dev with 0 cost).');
    }

    const targetModel = model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiApiKey.trim()}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nTask: ${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('No response returned from Gemini.');
    }
    return candidate.trim();
  }

  if (provider === 'ollama') {
    const targetModel = model || 'llama3';
    const endpoint = (ollamaEndpoint.replace(/\/$/, '')) + '/api/generate';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: targetModel,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama connection error (${res.status}): Make sure Ollama is running locally at ${ollamaEndpoint}`);
    }

    const data = await res.json();
    if (!data.response) {
      throw new Error('No response from local Ollama.');
    }
    return data.response.trim();
  }

  throw new Error('Unsupported AI provider.');
}
