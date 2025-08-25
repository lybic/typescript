import {
  ChatRequestOptions,
  ChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  LanguageModel,
  streamText,
  UIMessage,
  UIMessageChunk,
} from 'ai'
import { lybicModel } from './lybic-provider'
import guiAgentSeedPromptZh from '@/prompts/gui-agent-seed.zh.txt?raw'
import guiAgentUiTarsPromptZh from '@/prompts/gui-agent-ui-tars.zh.txt?raw'
import guiAgentSeedPromptEn from '@/prompts/gui-agent-seed.en.txt?raw'
import guiAgentUiTarsPromptEn from '@/prompts/gui-agent-ui-tars.en.txt?raw'
import { LybicClient } from '@lybic/core'
import { BodyExtras, LybicUIMessage } from './ui-message-type'
import { encodeBase64 } from '@std/encoding/base64'
import createDebug from 'debug'
import { indicatorStore } from '@/stores/indicator'

const debug = createDebug('lybic:playground:chat-transport')

const MODEL_CONFIG = {
  'doubao-seed-1-6-vision-250815': {
    model: lybicModel('doubao-seed-1-6-vision-250815'),
    zh: guiAgentSeedPromptZh,
    en: guiAgentSeedPromptEn,
    parser: 'seed',
  },
  'doubao-seed-1-6-flash-250715': {
    model: lybicModel('doubao-seed-1-6-flash-250715'),
    zh: guiAgentSeedPromptZh,
    en: guiAgentSeedPromptEn,
    parser: 'seed',
  },
  'doubao-1-5-ui-tars-250328': {
    model: lybicModel('doubao-1-5-ui-tars-250328'),
    zh: guiAgentUiTarsPromptZh,
    en: guiAgentUiTarsPromptEn,
    parser: 'ui-tars',
  },
  'doubao-1-5-ui-tars-250428': {
    model: lybicModel('doubao-1-5-ui-tars-250428'),
    zh: guiAgentUiTarsPromptZh,
    en: guiAgentUiTarsPromptEn,
    parser: 'ui-tars',
  },
  'doubao-1-5-thinking-vision-pro-250428': {
    model: lybicModel('doubao-1-5-thinking-vision-pro-250428'),
    zh: guiAgentUiTarsPromptZh,
    en: guiAgentUiTarsPromptEn,
    parser: 'ui-tars',
  },
} as Record<string, { model: LanguageModel; zh: string; en: string; parser: 'seed' | 'ui-tars' }>

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

        debug('lastMessage', lastMessage, lastMessageId, 'body', options.body)

        const extras = options.body as BodyExtras
        if (!(extras.model in MODEL_CONFIG)) {
          throw new Error(`Model ${extras.model} not supported`)
        }

        const modelConfig = MODEL_CONFIG[extras.model]!
        debug('modelConfig', modelConfig)

        const coreClient = this.getCoreClient(extras)
        const sandboxId = extras.sandboxId as string
        const userSystemPrompt = extras.systemPrompt as string | null
        if (options.abortSignal?.aborted) {
          throw new Error('User aborted')
        }
        const { data: preview } = await coreClient.previewSandbox(sandboxId, { signal: options.abortSignal })
        if (!preview?.screenShot) {
          throw new Error('Preview failed, no screenshot found')
        }

        if (options.abortSignal?.aborted) {
          throw new Error('User aborted')
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

        debug('modelMessages', modelMessages)

        writer.write({
          type: 'data-screenShot',
          data: {
            messageId: lastMessageId,
            url: preview.screenShot,
          },
          transient: true,
        })

        const systemPrompt = (extras.language === 'zh' ? modelConfig.zh : modelConfig.en)
          .replaceAll('{screen_width}', `${preview.cursorPosition?.screenWidth ?? 1280}`)
          .replaceAll('{screen_height}', `${preview.cursorPosition?.screenHeight ?? 720}`)

        if (options.abortSignal?.aborted) {
          throw new Error('User aborted')
        }
        const result = streamText({
          model: modelConfig.model,
          system: [systemPrompt, userSystemPrompt].filter(Boolean).join('\n'),
          messages: modelMessages,
          headers: {
            Authorization: `Bearer ${this.options.apiKey()}`,
          },
          abortSignal: options.abortSignal,
          providerOptions: {
            lybic: {
              extra_body: extras.thinking ? { thinking: { type: extras.thinking } } : {},
              allowed_openai_params: ['extra_body'],
            },
          },
          onFinish: async (message) => {
            debug('onFinish', message)
            if (options.abortSignal?.aborted) {
              throw new Error('User aborted')
            }
            const { data: parsedAction } = await coreClient.parseLlmOutput(
              {
                model: modelConfig.parser,
                textContent: message.text,
              },
              { signal: options.abortSignal },
            )
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

                if (options.abortSignal?.aborted) {
                  throw new Error('User aborted')
                }
                await coreClient.executeComputerUseAction(
                  sandboxId,
                  {
                    action,
                    includeScreenShot: false,
                    includeCursorPosition: false,
                  },
                  { signal: options.abortSignal },
                )
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
