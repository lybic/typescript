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
import { LybicClient } from '@lybic/core'
import { BodyExtras, LybicUIMessage } from './ui-message-type'
import { encodeBase64 } from '@std/encoding/base64'
import createDebug from 'debug'
import { indicatorStore } from '@/stores/indicator'

const debug = createDebug('lybic:playground:chat-transport')

export class LybicChatTransport implements ChatTransport<LybicUIMessage> {
  private coreClient: LybicClient | null = null
  private currentBaseUrl: string | null | undefined = null
  private currentOrgId: string | null | undefined = null
  private currentTrialSessionToken: string | null | undefined = null

  public constructor(
    private readonly options: {
      apiKey: () => string
    },
  ) {}

  private getCoreClient(body: BodyExtras) {
    const { baseUrl, orgId, trialSessionToken } = body
    if (
      baseUrl !== this.currentBaseUrl ||
      orgId !== this.currentOrgId ||
      trialSessionToken !== this.currentTrialSessionToken
    ) {
      this.currentBaseUrl = baseUrl
      this.currentOrgId = orgId
      this.currentTrialSessionToken = trialSessionToken
      this.coreClient = new LybicClient({
        baseUrl: baseUrl ?? '/',
        orgId: orgId ?? '',
        ...(trialSessionToken ? { trialSessionToken } : ({} as { apiKey: string })),
      })
    }
    return this.coreClient!
  }

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

        const extras = options.body as BodyExtras
        const coreClient = this.getCoreClient(extras)
        const sandboxId = extras.sandboxId as string
        const userSystemPrompt = extras.systemPrompt as string | null
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
          system: [guiAgentSeedPrompt, userSystemPrompt].filter(Boolean).join('\n'),
          messages: modelMessages,
          headers: {
            Authorization: `Bearer ${this.options.apiKey()}`,
          },
          providerOptions: {
            lybic: {
              extra_body: {
                thinking: {
                  type: 'disabled',
                },
              },
              allowed_openai_params: ['extra_body'],
            },
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
