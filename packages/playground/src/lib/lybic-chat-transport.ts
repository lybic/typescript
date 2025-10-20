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
import reflectionPromptAllLang from '@/prompts/reflection-agent.txt?raw'
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
import { DELAY_TIME_MS } from '@/components/conversation/delay'
import { throwIfAborted } from './chat-utils/throw-if-aborted'
import { stripImagesFromMessages } from './chat-utils/strip-images-from-messages'
import { transformImagesToDataUrl } from './chat-utils/transform-images-to-data-url'
import { buildHistory } from './chat-utils/build-history'
import { plannerPrompt } from './chat-utils/prompts'
import { streamTextOptions } from './chat-utils/stream-text-options'
import { mergeToWriter } from './chat-utils/merge-to-writer'
import { formatGroundingPrompt } from './chat-utils/prompts'

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
  'gemini-2.5-pro': {
    model: lybicModel('gemini-2.5-pro'),
    zh: plannerAgentPromptAllLang,
    en: plannerAgentPromptAllLang,
    groundingPrompt: null,
    parser: '',
    type: ['planner'],
  },
  'gemini-2.5-flash': {
    model: lybicModel('gemini-2.5-flash'),
    zh: plannerAgentPromptAllLang,
    en: plannerAgentPromptAllLang,
    groundingPrompt: null,
    parser: '',
    type: ['planner'],
  },
  o3: {
    model: lybicModel('o3'),
    zh: plannerAgentPromptAllLang,
    en: plannerAgentPromptAllLang,
    groundingPrompt: null,
    parser: '',
    type: ['planner'],
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
        const extras = options.body as BodyExtras

        const coreClient = this.getCoreClient(extras)
        const sandboxId = extras.sandboxId as string

        const { messages: modelMessages, screenSize } = await buildHistory({
          messages: options.messages,
          coreClient,
          sandboxId,
          imagesInContext: extras.screenshotsInContext ?? 1,
          abortSignal: options.abortSignal,
          onScreenShot: (screenshot, lastMessageId) => {
            writer.write({
              type: 'data-screenShot',
              data: {
                messageId: lastMessageId,
                url: screenshot,
              },
              transient: true,
            })
          },
        })

        const modelConfig = {
          main: MODEL_CONFIG[extras.model]!,
          grounding: extras.groundingModel ? MODEL_CONFIG[extras.groundingModel]! : null,
        }
        const userSystemPrompt = extras.systemPrompt as string | null
        const isDualModel = extras.model !== extras.groundingModel && !!extras.groundingModel

        if (isDualModel) {
          // Planner call
          const baseSystemPrompt = plannerPrompt({ userLanguage: extras.language as 'zh' | 'en' })

          const plannerCall = streamText(
            streamTextOptions(
              {
                model: modelConfig.main.model,
                baseSystemPrompt,
                userSystemPrompt,
                apiKey: this.options.apiKey(),
                organizationId: this.currentOrgId ?? '',
                abortSignal: options.abortSignal,
                thinking: extras.thinking,
                modelMessages,
              },
              {
                onFinish: (plannerMessage) => {},
              },
            ),
          )

          await mergeToWriter(writer, plannerCall)

          // const plannerResult = streamText({
          //   model: modelConfig.planner.model,
          //   system: [plannerSystemPrompt, userSystemPrompt].filter(Boolean).join('\n'),
          //   messages: modelMessages,
          //   headers: {
          //     Authorization: `Bearer ${this.options.apiKey()}`,
          //     ['X-Organization-Id']: this.currentOrgId ?? '',
          //   },
          //   abortSignal: options.abortSignal,
          //   providerOptions: {
          //     lybic: {
          //       extra_body: extras.thinking ? { thinking: { type: extras.thinking } } : {},
          //       allowed_openai_params: ['extra_body'],
          //     },
          //   },
          //   onFinish: async (plannerMessage) => {
          //     const planText = plannerMessage.text
          //     debug('planText from planner model：', planText)
          //     if (options.abortSignal?.aborted) {
          //       throw new Error('User aborted')
          //     }

          //     // Grounding call
          //     const groundingModelMessages: ModelMessage[] = [
          //       {
          //         role: 'user',
          //         content: [
          //           { type: 'text', text: planText },
          //           {
          //             ...image_message,
          //             data: image_message.data.toString(),
          //           },
          //         ],
          //       },
          //     ]
          //     debug('groundingModelUserMessages', groundingModelMessages)

          //     let groundingSystemPrompt = ''
          //     if (groundingModelConfig.groundingPrompt) {
          //       groundingSystemPrompt = groundingModelConfig.groundingPrompt
          //         .replaceAll('{screen_width}', `${preview?.cursorPosition?.screenWidth ?? 1280}`)
          //         .replaceAll('{screen_height}', `${preview?.cursorPosition?.screenHeight ?? 720}`)
          //         .replaceAll('{LANGUAGE}', extras.language === 'zh' ? '中文' : 'English')
          //     } else {
          //       throw new Error('No grounding prompt defined for grounding model ' + groundingModelId)
          //     }

          //     const groundingResult = streamText({
          //       model: groundingModelConfig.model,
          //       system: [groundingSystemPrompt, userSystemPrompt].filter(Boolean).join('\n'),
          //       messages: groundingModelMessages,
          //       headers: {
          //         Authorization: `Bearer ${this.options.apiKey()}`,
          //         ['X-Organization-Id']: this.currentOrgId ?? '',
          //       },
          //       abortSignal: options.abortSignal,
          //       onFinish: async (groundingMessage) => {
          //         debug('onFinish (grounding)', groundingMessage)
          //         if (options.abortSignal?.aborted) {
          //           throw new Error('User aborted')
          //         }
          //         const groundingText = groundingMessage.text
          //         const parsedAction = await parseLlmText(
          //           coreClient,
          //           groundingText,
          //           groundingModelConfig.parser,
          //           options.abortSignal,
          //         ).catch((err) => {
          //           if (options.abortSignal?.aborted) {
          //             throw new Error('User aborted')
          //           }
          //           throw new Error('Failed to parse LLM output, please try again later: ' + err.message)
          //         })
          //         debug('parsedAction (grounding)', parsedAction)
          //         if (parsedAction?.actions && parsedAction.actions.length > 0) {
          //           writer.write({
          //             type: 'data-parsed',
          //             data: {
          //               actions: parsedAction.actions,
          //               text: ['GroundingAgent:', parsedAction.thoughts, parsedAction.unknown]
          //                 .filter(Boolean)
          //                 .join('\n'),
          //             },
          //           })
          //           indicatorStore.lastAction = structuredClone(parsedAction.actions[0]!)
          //           for (const action of parsedAction.actions) {
          //             debug('executeComputerUseAction (grounding)', action)

          //             if (options.abortSignal?.aborted) {
          //               throw new Error('User aborted')
          //             }
          //             await executeComputerUseAction(
          //               coreClient,
          //               sandboxId,
          //               {
          //                 action,
          //                 includeScreenShot: false,
          //                 includeCursorPosition: false,
          //               },
          //               options.abortSignal,
          //             ).catch((err) => {
          //               console.error(err)
          //               if (options.abortSignal?.aborted) {
          //                 throw new Error('User aborted')
          //               }
          //               throw new Error('Failed to execute computer use action, please try again later: ' + err.message)
          //             })
          //           }
          //         }
          //       },
          //     })

          //     // Drain the grounding stream to trigger its onFinish, without merging its text output to the UI message.
          //     for await (const _ of groundingResult.fullStream);
          //   },
          // })
        } else {
          // Single-model workflow
          const systemPrompt = formatGroundingPrompt(
            extras.language === 'zh' ? modelConfig.main.zh : modelConfig.main.en,
            { userLanguage: extras.language as 'zh' | 'en', screenSize },
          )

          throwIfAborted(options.abortSignal)

          const result = streamText(
            streamTextOptions(
              {
                model: modelConfig.main.model,
                baseSystemPrompt: systemPrompt,
                userSystemPrompt,
                apiKey: this.options.apiKey(),
                organizationId: this.currentOrgId ?? '',
                abortSignal: options.abortSignal,
                thinking: extras.thinking,
                modelMessages,
              },
              {
                onFinish: async (message) => {
                  debug('onFinish', message)
                  if (options.abortSignal?.aborted) {
                    throw new Error('User aborted')
                  }
                  const parsedAction = await throwIfAborted(
                    options.abortSignal,
                    () => parseLlmText(coreClient, message.text, modelConfig.main.parser, options.abortSignal),
                    'Parse LLM output',
                  )
                  debug('parsedActions', parsedAction)
                  if (parsedAction?.actions && parsedAction.actions.length > 0) {
                    writer.write({
                      type: 'data-parsed',
                      data: {
                        actions: parsedAction.actions,
                        text: [parsedAction.thoughts, parsedAction.unknown].filter(Boolean).join('\n'),
                      },
                    })
                    for (const action of parsedAction?.actions) {
                      debug('executeComputerUseAction', action)

                      await throwIfAborted(
                        options.abortSignal,
                        () =>
                          executeComputerUseAction(
                            coreClient!,
                            sandboxId as string,
                            { action, includeScreenShot: false, includeCursorPosition: false },
                            options.abortSignal,
                          ),
                        'Execute computer use action',
                      )
                    }
                  }
                },
              },
            ),
          )

          await mergeToWriter(writer, result)
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
