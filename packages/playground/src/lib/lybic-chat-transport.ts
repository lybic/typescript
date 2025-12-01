import groundingAgentOpenCuaPromptAllLang from '@/prompts/ground-agent-opencua.txt?raw'
import groundingAgentQwenPromptAllLang from '@/prompts/ground-agent-qwen.txt?raw'
import groundingAgentUiTarsPromptAllLang from '@/prompts/ground-agent-uitars.txt?raw'
import guiAgentSeedPromptEn from '@/prompts/gui-agent-seed.en.txt?raw'
import guiAgentSeedPromptZh from '@/prompts/gui-agent-seed.zh.txt?raw'
import guiAgentUiTarsPromptEn from '@/prompts/gui-agent-ui-tars.en.txt?raw'
import guiAgentUiTarsPromptZh from '@/prompts/gui-agent-ui-tars.zh.txt?raw'
import mobileUseUiTarsPrompt from '@/prompts/mobile-use-ui-tars.txt?raw'
import plannerAgentPromptAllLang from '@/prompts/planner-agent.txt?raw'
import { LybicClient } from '@lybic/core'
import { ChatRequestOptions, ChatTransport, createUIMessageStream, LanguageModel, streamText, UIMessageChunk } from 'ai'
import createDebug from 'debug'
import { executeSandboxAction } from './api/execute-computer-use-action'
import { parseLlmText } from './api/parse-llm-text'
import { buildHistory } from './chat-utils/build-history'
import { mergeToWriter } from './chat-utils/merge-to-writer'
import { formatGroundingPrompt } from './chat-utils/prompts'
import { streamTextOptions } from './chat-utils/stream-text-options'
import { throwIfAborted } from './chat-utils/throw-if-aborted'
import { lybicModel } from './lybic-provider'
import { BodyExtras, LybicUIMessage } from './ui-message-type'

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
  private currentBearerToken: string | null | undefined = null

  public constructor(
    private readonly options: {
      apiKey: () => string
    },
  ) {}

  private getCoreClient(body: BodyExtras) {
    const { baseUrl, orgId, trialSessionToken, bearerToken } = body
    if (
      baseUrl !== this.currentBaseUrl ||
      orgId !== this.currentOrgId ||
      trialSessionToken !== this.currentTrialSessionToken ||
      bearerToken !== this.currentBearerToken
    ) {
      this.currentBaseUrl = baseUrl
      this.currentOrgId = orgId
      this.currentTrialSessionToken = trialSessionToken
      this.coreClient = new LybicClient({
        baseUrl: baseUrl ?? '/',
        orgId: orgId ?? '',
        ...(bearerToken ? { bearerToken } : trialSessionToken ? { trialSessionToken } : ({} as { apiKey: string })),
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
        }
        const userSystemPrompt = extras.systemPrompt as string | null
        const actionSpace = extras.actionSpace ?? 'computer-use'
        const computerUseSystemPrompt = extras.language === 'zh' ? modelConfig.main.zh : modelConfig.main.en

        const systemPrompt = formatGroundingPrompt(
          actionSpace === 'computer-use' ? computerUseSystemPrompt : mobileUseUiTarsPrompt, // [FIXME]: different models should have their own system prompt
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
                  () =>
                    parseLlmText(coreClient, message.text, modelConfig.main.parser, actionSpace, options.abortSignal),
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
                  for (const [index, action] of parsedAction?.actions.entries()) {
                    debug('execute action', action)

                    const result = await throwIfAborted(
                      options.abortSignal,
                      () =>
                        executeSandboxAction(
                          coreClient!,
                          sandboxId as string,
                          { action, includeScreenShot: false, includeCursorPosition: false },
                          options.abortSignal,
                        ),
                      'Execute computer use action',
                    )
                    writer.write({
                      type: 'data-actions',
                      data: {
                        index,
                        result: result?.actionResult,
                      },
                    })
                  }
                }
              },
            },
          ),
        )

        await mergeToWriter(writer, result)
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
