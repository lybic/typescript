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
import guiAgentSeedPrompt from '@/prompts/gui-agent-seed.zh.txt?raw'
import { type LybicClient } from '@lybic/core'
import { LybicUIMessage } from './ui-message-type'
import { encodeBase64 } from '@std/encoding/base64'
import createDebug from 'debug'
import { indicatorStore } from '@/stores/indicator'

const debug = createDebug('lybic:playground:chat-transport')

export class LybicChatTransport implements ChatTransport<LybicUIMessage> {
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
      messages: LybicUIMessage[]
      abortSignal: AbortSignal | undefined
    } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk>> {
    const stream = createUIMessageStream<LybicUIMessage>({
      execute: async ({ writer }) => {
        const lastMessageId = options.messages[options.messages.length - 1]?.id
        const modelMessages = convertToModelMessages(options.messages)
        const lastMessage = modelMessages[modelMessages.length - 1]
        if (!lastMessage || lastMessage.role !== 'user' || !lastMessageId) {
          throw new Error('Last message must be a user message')
        }

        debug('lastMessage', lastMessage, lastMessageId)

        const coreClient = this.coreClient()
        const sandboxId = this.sandboxId()
        const preview = await coreClient.previewSandbox(sandboxId)
        if (!preview.data?.screenShot) {
          throw new Error('Preview failed, no screenshot found')
        }

        const previewImageBase64 = encodeBase64(await (await fetch(preview.data.screenShot)).arrayBuffer())
        const previewImageDataUrl = 'data:image/webp;base64,' + previewImageBase64

        if (typeof lastMessage.content === 'string') {
          lastMessage.content = [
            {
              type: 'text',
              text: lastMessage.content,
            },
          ]
        }
        lastMessage.content.push({
          type: 'file',
          mediaType: 'image/webp',
          data: new URL(previewImageDataUrl),
        })

        debug('modelMessages', modelMessages)

        writer.write({
          type: 'data-screenShot',
          data: {
            messageId: lastMessageId,
            url: previewImageDataUrl,
          },
          transient: true,
        })

        const result = streamText({
          model: lybicModel('doubao-seed-1-6-flash-250715'),
          system: guiAgentSeedPrompt,
          messages: modelMessages,
          headers: {
            Authorization: `Bearer ${this.apiKey()}`,
          },
          onFinish: async (message) => {
            debug('onFinish', message)
            const { data: parsedAction } = await coreClient.parseLlmOutput({
              model: 'seed',
              textContent: message.text,
            })
            debug('parsedAction', parsedAction)
            if (parsedAction?.actions && parsedAction.actions.length > 0) {
              writer.write({
                type: 'data-parsed',
                data: {
                  actions: parsedAction.actions,
                  text: [parsedAction.thoughts, parsedAction.unknown].filter(Boolean).join('\n'),
                },
              })
              indicatorStore.lastAction = structuredClone(parsedAction.actions[0]!)
              for (const action of parsedAction?.actions) {
                debug('executeComputerUseAction', action)
                await coreClient.executeComputerUseAction(sandboxId, {
                  action,
                  includeScreenShot: false,
                  includeCursorPosition: false,
                })
              }
            }
          },
        })

        writer.merge(
          result.toUIMessageStream({
            messageMetadata({ part }) {
              if (part.type === 'start') {
                return {
                  createdAt: Date.now(),
                }
              } else if (part.type === 'finish') {
                return {
                  usage: {
                    inputTokens: part.totalUsage?.inputTokens ?? 0,
                    outputTokens: part.totalUsage?.outputTokens ?? 0,
                  },
                }
              }
            },
          }),
        )
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
