import { useState, useCallback } from 'react';
import { mistralService } from '../services/mistral';
import { MistralMessage, MistralChatRequest, MistralModel, ApiResponse } from '../types';

interface UseMistralProps {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const useMistral = ({
  model = 'mistral-tiny',
  temperature = 0.7,
  maxTokens = 4096,
}: UseMistralProps) => {
  const [messages, setMessages] = useState<MistralMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<MistralModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const addMessage = useCallback((message: MistralMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const fetchModels = useCallback(async () => {
    setModelsLoading(true);
    setError(null);
    try {
      const response = await mistralService.listModels();
      if (response.success && response.data) {
        setModels(response.data);
      } else {
        setError(response.error || 'Failed to fetch models');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
    } finally {
      setModelsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    setLoading(true);
    setError(null);

    try {
      // Add user message
      const userMsg: MistralMessage = {
        role: 'user',
        content: userMessage,
      };
      addMessage(userMsg);

      // Prepare request
      const request: MistralChatRequest = {
        model,
        messages: [...messages, userMsg],
        temperature,
        max_tokens: maxTokens,
      };

      // Send request
      const response = await mistralService.chatCompletion(request);
      
      if (response.success && response.data) {
        const assistantMessage = response.data.choices[0]?.message;
        if (assistantMessage) {
          addMessage(assistantMessage);
        }
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [messages, model, temperature, maxTokens, addMessage]);

  const sendStreamMessage = useCallback(async (userMessage: string, onChunk: (chunk: string) => void) => {
    setLoading(true);
    setError(null);

    try {
      // Add user message
      const userMsg: MistralMessage = {
        role: 'user',
        content: userMessage,
      };
      addMessage(userMsg);
      addMessage({ role: 'assistant', content: '' });

      // Prepare request
      const request: MistralChatRequest = {
        model,
        messages: [...messages, userMsg],
        temperature,
        max_tokens: maxTokens,
      };

      // Stream response
      const generator = mistralService.streamChatCompletion(request);
      
      let fullResponse = '';
      for await (const chunk of generator) {
        fullResponse += chunk;
        onChunk(chunk);
      }

      // Update the assistant message with full response
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: fullResponse,
          };
        }
        return updated;
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stream message');
      // Remove the empty assistant message if there was an error
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'assistant' && !updated[lastIndex].content) {
          updated.pop();
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [messages, model, temperature, maxTokens, addMessage]);

  const changeModel = useCallback((newModel: string) => {
    setMessages([]);
    setError(null);
    // Update model - this would require a state setter from parent
  }, []);

  return {
    messages,
    loading,
    error,
    models,
    modelsLoading,
    addMessage,
    clearMessages,
    sendMessage,
    sendStreamMessage,
    fetchModels,
    changeModel,
  };
};
