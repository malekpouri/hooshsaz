const prisma = require('../utils/prisma');

const getOllamaUrl = async () => {
  const config = await prisma.systemConfig.findUnique({
    where: { key: 'OLLAMA_URL' },
  });
  return config ? config.value : 'http://localhost:11434';
};

const getModels = async () => {
  const baseUrl = await getOllamaUrl();
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) throw new Error('Failed to fetch models from Ollama');
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Ollama getModels error:', error);
    throw error;
  }
};

const chatStream = async (model, messages, onChunk, onComplete) => {
  const baseUrl = await getOllamaUrl();
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) throw new Error('Ollama API error');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Ollama sends multiple JSON objects in one chunk sometimes
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message && json.message.content) {
            const content = json.message.content;
            fullResponse += content;
            if (onChunk) onChunk(content);
          }
          if (json.done && onComplete) {
            onComplete(fullResponse);
          }
        } catch (e) {
          console.error('Error parsing Ollama chunk:', e);
        }
      }
    }
    
    // Ensure onComplete is called if not triggered by json.done
    // (Though Ollama usually sends done: true)
    return fullResponse;
  } catch (error) {
    console.error('Ollama chat error:', error);
    throw error;
  }
};

module.exports = {
  getModels,
  chatStream,
};
