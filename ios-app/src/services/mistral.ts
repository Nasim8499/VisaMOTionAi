import Config from 'react-native-config';
import { MistralChatRequest, MistralChatResponse, MistralModel, ApiResponse } from '../types';

const API_URL = Config.MISTRAL_API_URL || 'https://api.mistral.ai/v1';
const API_KEY = Config.MISTRAL_API_KEY || '';

class MistralService {
  private async getHeaders(): Promise<Record<string, string>> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    };
  }

  async listModels(): Promise<ApiResponse<MistralModel[]>> {
    try {
      const response = await fetch(`${API_URL}/models`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async chatCompletion(request: MistralChatRequest): Promise<ApiResponse<MistralChatResponse>> {
    try {
      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async *streamChatCompletion(request: MistralChatRequest): AsyncGenerator<string> {
    try {
      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse complete JSON objects from the buffer
        while (buffer.includes('\n\n')) {
          const endIndex = buffer.indexOf('\n\n');
          const line = buffer.slice(0, endIndex).trim();
          buffer = buffer.slice(endIndex + 2);

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  yield parsed.choices[0].delta.content;
                }
              } catch (e) {
                // Ignore parsing errors for individual chunks
              }
            }
          }
        }
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  async getModel(modelId: string): Promise<ApiResponse<MistralModel>> {
    try {
      const response = await fetch(`${API_URL}/models/${modelId}`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

export const mistralService = new MistralService();
