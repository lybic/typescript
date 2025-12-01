import { LanguageModel, ModelMessage, streamText } from 'ai'

type StreamTextOptions = Parameters<typeof streamText>[0]

export function streamTextOptions(
  options: {
    model: LanguageModel
    userSystemPrompt?: string | null | undefined
    baseSystemPrompt: string
    modelMessages: ModelMessage[]
    apiKey: string
    organizationId: string
    abortSignal?: AbortSignal
    thinking?: 'auto' | 'enabled' | 'disabled' | undefined
  },
  input: Partial<StreamTextOptions>,
): StreamTextOptions {
  return {
    model: options.model,
    system: [options.baseSystemPrompt, options.userSystemPrompt].filter(Boolean).join('\n'),
    messages: options.modelMessages,
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      ['X-Organization-Id']: options.organizationId,
    },
    abortSignal: options.abortSignal,
    providerOptions: {
      lybic: {
        extra_body: options.thinking ? { thinking: { type: options.thinking } } : {},
        allowed_openai_params: ['extra_body'],
      },
    },
    ...input,
  }
}
