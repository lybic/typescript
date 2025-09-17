import {
  ChatRequestOptions,
  ChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  LanguageModel,
  ModelMessage,
  streamText,
  UIMessage,
  UIMessageChunk,
  UserModelMessage,
} from 'ai'
import { lybicModel } from './lybic-provider'
import guiAgentSeedPromptZh from '@/prompts/gui-agent-seed.zh.txt?raw'
import guiAgentUiTarsPromptZh from '@/prompts/gui-agent-ui-tars.zh.txt?raw'
import guiAgentSeedPromptEn from '@/prompts/gui-agent-seed.en.txt?raw'
import guiAgentUiTarsPromptEn from '@/prompts/gui-agent-ui-tars.en.txt?raw'
import groundingAgentQwenPromptAllLang from '@/prompts/ground-agent-qwen.txt?raw'
import groundingAgentOpenCuaPromptAllLang from '@/prompts/ground-agent-opencua.txt?raw'
import groundingAgentUiTarsPromptAllLang from '@/prompts/ground-agent-uitars.txt?raw'
import plannerAgentPromptAllLang from '@/prompts/planner-agent.txt?raw'
import reflectionPromptAllLang from '@/prompts/reflection.txt?raw'
import { LybicClient } from '@lybic/core'
import { BodyExtras, LybicUIMessage } from './ui-message-type'
import { encodeBase64 } from '@std/encoding/base64'
import createDebug from 'debug'
import { indicatorStore } from '@/stores/indicator'
import { previewSandbox } from './api/preview-sandbox'
import { apiRetry } from './api/api-retry'
import { parseLlmText } from './api/parse-llm-text'
import { executeComputerUseAction } from './api/execute-computer-use-action'
import { FilePart } from '@ai-sdk/provider-utils'

const debug = createDebug('lybic:playground:chat-transport')

const MODEL_CONFIG = {
  'doubao-seed-1-6-vision-250815': {
    model: lybicModel('doubao-seed-1-6-vision-250815'),
    zh: guiAgentSeedPromptZh,
    en: guiAgentSeedPromptEn,
    groundingPrompt: null,
    parser: 'seed',
    type: ['planner'],
  },
  'doubao-seed-1-6-flash-250715': {
    model: lybicModel('doubao-seed-1-6-flash-250715'),
    zh: guiAgentSeedPromptZh,
    en: guiAgentSeedPromptEn,
    groundingPrompt: null,
    parser: 'seed',
    type: ['planner'],
  },
  'doubao-1-5-ui-tars-250328': {
    model: lybicModel('doubao-1-5-ui-tars-250328'),
    zh: guiAgentUiTarsPromptZh,
    en: guiAgentUiTarsPromptEn,
    groundingPrompt: groundingAgentUiTarsPromptAllLang,
    parser: 'ui-tars',
    type: ['planner', 'grounding'],
  },
  'doubao-1-5-ui-tars-250428': {
    model: lybicModel('doubao-1-5-ui-tars-250428'),
    zh: guiAgentUiTarsPromptZh,
    en: guiAgentUiTarsPromptEn,
    groundingPrompt: groundingAgentUiTarsPromptAllLang,
    parser: 'ui-tars',
    type: ['planner', 'grounding'],
  },
  'doubao-1-5-thinking-vision-pro-250428': {
    model: lybicModel('doubao-1-5-thinking-vision-pro-250428'),
    zh: guiAgentUiTarsPromptZh,
    en: guiAgentUiTarsPromptEn,
    groundingPrompt: groundingAgentUiTarsPromptAllLang,
    parser: 'ui-tars',
    type: ['planner', 'grounding'],
  },
  OpenCUA: {
    model: lybicModel('OpenCUA-7B'),
    zh: groundingAgentOpenCuaPromptAllLang,
    en: groundingAgentOpenCuaPromptAllLang,
    groundingPrompt: groundingAgentOpenCuaPromptAllLang,
    // OpenCUA 的输出是类似 pyautogui调用 的 python 代码 如
    // ## code
    // ```python
    // pyautogui.click(x=100, y=200)
    // ```
    parser: 'pyautogui',
    type: ['grounding'],
  },
  'Qwen2.5-VL': {
    model: lybicModel('Qwen2.5-VL-7B'),
    zh: groundingAgentQwenPromptAllLang,
    en: groundingAgentQwenPromptAllLang,
    groundingPrompt: groundingAgentQwenPromptAllLang,
    parser: 'qwen',
    type: ['grounding'],
  },
} as Record<
  string,
  {
    model: LanguageModel
    zh: string
    en: string
    parser: string
    type: ('planner' | 'grounding')[]
    groundingPrompt: string | null
  }
>

export class LybicChatTransport implements ChatTransport<LybicUIMessage> {
  private coreClient: LybicClient | null = null
  private currentBaseUrl: string | null | undefined = null
  private currentOrgId: string | null | undefined = null
  private currentTrialSessionToken: string | null | undefined = null
  private reflectionScreenshot: { sandboxId: string; url: string; text: string; cursorPosition: any } | null = null

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

        const plannerModelConfig = MODEL_CONFIG[extras.model]!
        debug('plannerModelConfig', plannerModelConfig)

        const coreClient = this.getCoreClient(extras)
        const sandboxId = extras.sandboxId as string
        const userSystemPrompt = extras.systemPrompt as string | null
        if (options.abortSignal?.aborted) {
          throw new Error('User aborted')
        }

        let preview: { screenShot: string; cursorPosition: any }

        const usedReflectionCache = this.reflectionScreenshot && this.reflectionScreenshot.sandboxId === sandboxId
        if (usedReflectionCache) {
          // Use cached screenshot from reflection step
          preview = {
            screenShot: this.reflectionScreenshot!.url,
            cursorPosition: this.reflectionScreenshot!.cursorPosition,
          }
        } else {
          if (!this.reflectionScreenshot) {
            this.reflectionScreenshot = { sandboxId: '', text: '', url: '', cursorPosition: null }
          }
          // Get new screenshot (the first time or the sandbox has changed)
          const result = await previewSandbox(coreClient, sandboxId, options.abortSignal).catch((err) => {
            console.error(err)
            if (options.abortSignal?.aborted) {
              throw new Error('User aborted')
            }
            throw new Error('Failed to preview sandbox, please try again later: ' + err.message)
          })
          preview = result as { screenShot: string; cursorPosition: any }
        }

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

        const image_message: FilePart = {
          type: 'file',
          mediaType: 'image/webp',
          data: new URL(preview.screenShot),
        }
        lastMessage.content.push(image_message)

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
                  const response = await apiRetry(options.abortSignal, (signal) =>
                    fetch(part.data.toString(), { signal }),
                  ).catch((err) => {
                    console.error(err)
                    if (options.abortSignal?.aborted) {
                      throw new Error('User aborted')
                    }
                    throw new Error('Failed to fetch screenshot, please try start a new chat: ' + err.message)
                  })
                  if (!response.ok) {
                    throw new Error(
                      'Your history is too old to process, please create a new chat instead of continuing.',
                    )
                  }
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

        const isDualModel = extras.model !== extras.ground && !!extras.ground

        if (isDualModel) {
          // Dual-model workflow
          const groundingModelId = extras.ground
          if (!groundingModelId || !(groundingModelId in MODEL_CONFIG)) {
            throw new Error(`Grounding model '${groundingModelId}' not selected or not supported`)
          }
          const groundingModelConfig = MODEL_CONFIG[groundingModelId]!
          if (!groundingModelConfig.type.includes('grounding')) {
            throw new Error(`Model ${groundingModelId} is not a grounding model`)
          }
          debug('groundingModelConfig', groundingModelConfig)

          // Planner call
          const plannerSystemPrompt = plannerAgentPromptAllLang.replaceAll(
            '{LANGUAGE}',
            extras.language === 'zh' ? '中文' : 'English',
          )
          debug('plannerSystemPrompt', plannerSystemPrompt)

          if (usedReflectionCache) {
            if (this.reflectionScreenshot && this.reflectionScreenshot.text) {
              modelMessages.push({
                role: 'assistant',
                // @ts-ignore
                content: this.reflectionScreenshot.text,
              })
            }
            this.reflectionScreenshot = null // Consume the screenshot now that we've used it
          }

          const plannerResult = streamText({
            model: plannerModelConfig.model,
            system: [plannerSystemPrompt, userSystemPrompt].filter(Boolean).join('\n'),
            messages: modelMessages,
            headers: {
              Authorization: `Bearer ${this.options.apiKey()}`,
              ['X-Organization-Id']: this.currentOrgId ?? '',
            },
            abortSignal: options.abortSignal,
            providerOptions: {
              lybic: {
                extra_body: extras.thinking ? { thinking: { type: extras.thinking } } : {},
                allowed_openai_params: ['extra_body'],
              },
            },
            onFinish: async (plannerMessage) => {
              const planText = plannerMessage.text
              debug('planText from planner model：', planText)

              if (options.abortSignal?.aborted) {
                throw new Error('User aborted')
              }

              // Grounding call
              const groundingModelMessages: ModelMessage[] = [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: planText },
                    {
                      ...image_message,
                      data: image_message.data.toString(),
                    },
                  ],
                },
              ]
              debug('groundingModelUserMessages', groundingModelMessages)

              let groundingSystemPrompt = ''
              if (groundingModelConfig.groundingPrompt) {
                groundingSystemPrompt = groundingModelConfig.groundingPrompt
                  .replaceAll('{screen_width}', `${preview.cursorPosition?.screenWidth ?? 1280}`)
                  .replaceAll('{screen_height}', `${preview.cursorPosition?.screenHeight ?? 720}`)
                  .replaceAll('{LANGUAGE}', extras.language === 'zh' ? '中文' : 'English')
              } else {
                throw new Error('No grounding prompt defined for grounding model ' + groundingModelId)
              }

              const groundingResult = streamText({
                model: groundingModelConfig.model,
                system: [groundingSystemPrompt, userSystemPrompt].filter(Boolean).join('\n'),
                messages: groundingModelMessages,
                headers: {
                  Authorization: `Bearer ${this.options.apiKey()}`,
                  ['X-Organization-Id']: this.currentOrgId ?? '',
                },
                abortSignal: options.abortSignal,
                onFinish: async (groundingMessage) => {
                  debug('onFinish (grounding)', groundingMessage)
                  if (options.abortSignal?.aborted) {
                    throw new Error('User aborted')
                  }
                  const groundingText = groundingMessage.text
                  const parsedAction = await parseLlmText(
                    coreClient,
                    groundingText,
                    groundingModelConfig.parser,
                    options.abortSignal,
                  ).catch((err) => {
                    if (options.abortSignal?.aborted) {
                      throw new Error('User aborted')
                    }
                    throw new Error('Failed to parse LLM output, please try again later: ' + err.message)
                  })
                  debug('parsedAction (grounding)', parsedAction)
                  if (parsedAction?.actions && parsedAction.actions.length > 0) {
                    writer.write({
                      type: 'data-parsed',
                      data: {
                        actions: parsedAction.actions,
                        text: ['GroundingAgent:', parsedAction.thoughts, parsedAction.unknown]
                          .filter(Boolean)
                          .join('\n'),
                      },
                    })
                    indicatorStore.lastAction = structuredClone(parsedAction.actions[0]!)
                    for (const action of parsedAction.actions) {
                      debug('executeComputerUseAction (grounding)', action)

                      if (options.abortSignal?.aborted) {
                        throw new Error('User aborted')
                      }
                      await executeComputerUseAction(
                        coreClient,
                        sandboxId,
                        {
                          action,
                          includeScreenShot: false,
                          includeCursorPosition: false,
                        },
                        options.abortSignal,
                      ).catch((err) => {
                        console.error(err)
                        if (options.abortSignal?.aborted) {
                          throw new Error('User aborted')
                        }
                        throw new Error('Failed to execute computer use action, please try again later: ' + err.message)
                      })
                    }

                    // Reflection step (optional)
                    if (extras.reflection === 'enabled') {
                      try {
                        if (options.abortSignal?.aborted) {
                          throw new Error('User aborted')
                        }

                        const reflectionPreview = await previewSandbox(
                          coreClient,
                          sandboxId,
                          options.abortSignal,
                        ).catch((err) => {
                          console.error(err)
                          if (options.abortSignal?.aborted) {
                            throw new Error('User aborted')
                          }
                          throw new Error('Failed to get screenshot for reflection: ' + err.message)
                        })
                        if (!reflectionPreview?.screenShot) {
                          throw new Error('Reflection preview failed, no screenshot found')
                        }

                        const reflectionUserMessageContent = `Planner Output: ${planText}`
                        const reflectionImagePart: FilePart = {
                          type: 'file',
                          mediaType: 'image/webp',
                          data: new URL(reflectionPreview.screenShot),
                        }

                        // We need to fetch and encode the image for the reflection call
                        const response = await apiRetry(options.abortSignal, (signal) =>
                          fetch(reflectionImagePart.data.toString(), { signal }),
                        )
                        const arrayBuffer = await response.arrayBuffer()
                        const base64 = encodeBase64(arrayBuffer)
                        reflectionImagePart.data = new URL(`data:image/webp;base64,${base64}`)

                        const reflectionResult = streamText({
                          model: plannerModelConfig.model, // Use planner model for reflection
                          system: reflectionPromptAllLang,
                          messages: [
                            {
                              role: 'user',
                              content: [{ type: 'text', text: reflectionUserMessageContent }, reflectionImagePart],
                            },
                          ],
                          headers: {
                            Authorization: `Bearer ${this.options.apiKey()}`,
                          },
                          abortSignal: options.abortSignal,
                        })
                        for await (const _ of reflectionResult.fullStream); // drain the stream，failure to do so will cause the following await to hang
                        const reflectionText = await reflectionResult.text
                        debug('reflectionText', reflectionText)

                        // Cache the screenshot for the next turn
                        this.reflectionScreenshot = {
                          sandboxId,
                          text: reflectionText,
                          url: reflectionPreview.screenShot,
                          cursorPosition: reflectionPreview.cursorPosition,
                        }

                        writer.write({
                          type: 'data-reflection',
                          data: {
                            reflectionText,
                          },
                        })
                      } catch (err) {
                        if (err instanceof Error && err.name === 'AbortError') {
                          throw err
                        }
                        console.error('Reflection step failed:', err)
                        throw new Error('Reflection step failed, please try again later: ' + (err as Error).message)
                      }
                    }
                  }
                },
              })

              // Drain the grounding stream to trigger its onFinish, without merging its text output to the UI message.
              for await (const _ of groundingResult.fullStream);
            },
          })
          writer.merge(
            plannerResult.toUIMessageStream({
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
        } else {
          // Single-model workflow
          const systemPrompt = (extras.language === 'zh' ? plannerModelConfig.zh : plannerModelConfig.en)
            .replaceAll('{screen_width}', `${preview.cursorPosition?.screenWidth ?? 1280}`)
            .replaceAll('{screen_height}', `${preview.cursorPosition?.screenHeight ?? 720}`)

          if (options.abortSignal?.aborted) {
            throw new Error('User aborted')
          }

          const result = streamText({
            model: plannerModelConfig.model,
            system: [systemPrompt, userSystemPrompt].filter(Boolean).join('\n'),
            messages: modelMessages,
            headers: {
              Authorization: `Bearer ${this.options.apiKey()}`,
              ['X-Organization-Id']: this.currentOrgId ?? '',
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
              const parsedAction = await parseLlmText(
                coreClient,
                message.text,
                plannerModelConfig.parser,
                options.abortSignal,
              ).catch((err) => {
                console.error(err)
                if (options.abortSignal?.aborted) {
                  throw new Error('User aborted')
                }
                throw new Error('Failed to parse LLM output, please try again later: ' + err.message)
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

                  if (options.abortSignal?.aborted) {
                    throw new Error('User aborted')
                  }
                  await executeComputerUseAction(
                    coreClient,
                    sandboxId,
                    {
                      action,
                      includeScreenShot: false,
                      includeCursorPosition: false,
                    },
                    options.abortSignal,
                  ).catch((err) => {
                    console.error(err)
                    if (options.abortSignal?.aborted) {
                      throw new Error('User aborted')
                    }
                    throw new Error('Failed to execute computer use action, please try again later: ' + err.message)
                  })
                }

                // Reflection step for single-model workflow
                if (extras.reflection === 'enabled') {
                  try {
                    if (options.abortSignal?.aborted) {
                      throw new Error('User aborted')
                    }

                    const reflectionPreview = await previewSandbox(coreClient, sandboxId, options.abortSignal).catch(
                      (err) => {
                        console.error(err)
                        if (options.abortSignal?.aborted) {
                          throw new Error('User aborted')
                        }
                        throw new Error('Failed to get screenshot for reflection: ' + err.message)
                      },
                    )
                    if (!reflectionPreview?.screenShot) {
                      throw new Error('Reflection preview failed, no screenshot found')
                    }

                    const reflectionUserMessageContent = `Output: ${message.text}`
                    const reflectionImagePart: FilePart = {
                      type: 'file',
                      mediaType: 'image/webp',
                      data: new URL(reflectionPreview.screenShot),
                    }

                    // We need to fetch and encode the image for the reflection call
                    const response = await apiRetry(options.abortSignal, (signal) =>
                      fetch(reflectionImagePart.data.toString(), { signal }),
                    )
                    const arrayBuffer = await response.arrayBuffer()
                    const base64 = encodeBase64(arrayBuffer)
                    reflectionImagePart.data = new URL(`data:image/webp;base64,${base64}`)

                    const reflectionResult = streamText({
                      model: plannerModelConfig.model, // Use planner model for reflection
                      system: reflectionPromptAllLang,
                      messages: [
                        {
                          role: 'user',
                          content: [{ type: 'text', text: reflectionUserMessageContent }, reflectionImagePart],
                        },
                      ],
                      headers: {
                        Authorization: `Bearer ${this.options.apiKey()}`,
                      },
                      abortSignal: options.abortSignal,
                    })
                    for await (const _ of reflectionResult.fullStream); // drain the stream，failure to do so will cause the following await to hang
                    const reflectionText = await reflectionResult.text
                    debug('reflectionText', reflectionText)

                    // Cache the screenshot for the next turn
                    this.reflectionScreenshot = {
                      sandboxId,
                      text: reflectionText,
                      url: reflectionPreview.screenShot,
                      cursorPosition: reflectionPreview.cursorPosition,
                    }

                    writer.write({
                      type: 'data-reflection',
                      data: {
                        reflectionText,
                      },
                    })
                  } catch (err) {
                    if (err instanceof Error && err.name === 'AbortError') {
                      throw err
                    }
                    console.error('Reflection step failed:', err)
                    throw new Error('Reflection step failed, please try again later: ' + (err as Error).message)
                  }
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
        }
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
