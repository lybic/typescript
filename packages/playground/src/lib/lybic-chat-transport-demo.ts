import guiAgentUiTarsPromptEn from '@/prompts/gui-agent-ui-tars.en.txt?raw'
import { LybicClient } from '@lybic/core'
import { encodeBase64 } from '@std/encoding/base64'
import {
  ChatRequestOptions,
  ChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  streamText,
  UIMessageChunk,
} from 'ai'
import { lybicModel } from './lybic-provider'
import { LybicUIMessage } from './ui-message-type'

export class LybicChatTransport implements ChatTransport<LybicUIMessage> {
  public constructor(private readonly coreClient: LybicClient) {}

  public async sendMessages(
    options: {
      trigger: 'submit-message' | 'regenerate-message'
      chatId: string
      messageId: string | undefined
      messages: LybicUIMessage[]
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

        const extras = options.body as any

        const coreClient = this.coreClient
        const sandboxId = extras.sandboxId as string
        const userSystemPrompt = extras.systemPrompt as string | null
        const { data: preview } = await coreClient.previewSandbox(sandboxId)
        if (!preview?.screenShot) {
          throw new Error('Preview failed, no screenshot found')
        }

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
          data: new URL(preview.screenShot),
        })

        if (extras.screenshotsInContext !== 'all') {
          let screenshotsInContext = extras.screenshotsInContext ?? 1
          for (let i = modelMessages.length - 1; i >= 0; i--) {
            const message = modelMessages[i]!
            if (message.role !== 'user') {
              continue
            }
            if (typeof message.content === 'string') {
              continue
            }
            for (let j = 0; j < message.content.length; j++) {
              const part = message.content[j]!
              if (part.type === 'file' && part.mediaType === 'image/webp') {
                screenshotsInContext--
                if (screenshotsInContext < 0) {
                  message.content.splice(j, 1)
                }
              }
            }
          }
        }

        // download all images
        const promises = [] as Promise<void>[]
        for (const message of modelMessages) {
          for (const part of message.content) {
            if (typeof part !== 'string' && part.type === 'file' && part.mediaType === 'image/webp') {
              promises.push(
                (async () => {
                  const response = await fetch(part.data.toString())
                  const arrayBuffer = await response.arrayBuffer()
                  const base64 = encodeBase64(arrayBuffer)
                  part.data = new URL(`data:image/webp;base64,${base64}`)
                })(),
              )
            }
          }
        }
        await Promise.all(promises)

        writer.write({
          type: 'data-screenShot',
          data: {
            messageId: lastMessageId,
            url: preview.screenShot,
          },
          transient: true,
        })

        const systemPrompt = guiAgentUiTarsPromptEn
          .replaceAll('{screen_width}', `${preview.cursorPosition?.screenWidth ?? 1280}`)
          .replaceAll('{screen_height}', `${preview.cursorPosition?.screenHeight ?? 720}`)

        const result = streamText({
          model: lybicModel('doubao-1-5-ui-tars-250428'),
          system: [systemPrompt, userSystemPrompt].filter(Boolean).join('\n'),
          messages: modelMessages,
          providerOptions: {
            lybic: extras.thinking ? { thinking: { type: extras.thinking } } : {},
          },
          onFinish: async (message) => {
            const { data: parsedAction } = await coreClient.parseLlmOutput({
              model: 'ui-tars',
              textContent: message.text,
            })

            if (parsedAction?.actions && parsedAction.actions.length > 0) {
              writer.write({
                type: 'data-parsed',
                data: {
                  actions: parsedAction.actions,
                  text: [parsedAction.thoughts, parsedAction.unknown].filter(Boolean).join('\n'),
                },
              })
              for (const action of parsedAction?.actions) {
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
