import {
  ChatRequestOptions,
  ChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  streamText,
  UIMessage,
  UIMessageChunk,
} from 'ai'
import { lybicModel } from './lybic-provider'
import guiAgentUiTarsPrompt from '@/prompts/gui-agent-ui-tars.zh.txt?raw'
import { type LybicClient } from '@lybic/core'

export class ClientOnlyChatTransport<UI_MESSAGE extends UIMessage> implements ChatTransport<UI_MESSAGE> {
  public constructor(
    private readonly apiKey: () => string,
    private readonly coreClient: () => LybicClient,
    private readonly sandboxId: () => string,
  ) {}

  public async sendMessages(
    options: {
      trigger: 'submit-message' | 'regenerate-message'
      chatId: string
      messageId: string | undefined
      messages: UI_MESSAGE[]
      abortSignal: AbortSignal | undefined
    } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk>> {
    const stream = createUIMessageStream<UIMessage>({
      execute: async ({ writer }) => {
        const message = options.messages[options.messages.length - 1]
        console.log(message)
        const coreClient = this.coreClient()
        const sandboxId = this.sandboxId()
        const preview = await coreClient.previewSandbox(sandboxId)
        console.log(preview)

        const result = streamText({
          model: lybicModel('doubao-seed-1-6-flash-250715'),
          system: 'You are a helpful assistant.', // guiAgentUiTarsPrompt,
          messages: convertToModelMessages(options.messages),
          headers: {
            Authorization: `Bearer ${this.apiKey()}`,
          },
        })

        writer.merge(result.toUIMessageStream())
      },
    })

    return stream
  }

  public async reconnectToStream(
    options: { chatId: string } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk> | null> {
    return null
  }
}
