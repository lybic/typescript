import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { customProvider, defaultSettingsMiddleware, wrapLanguageModel } from 'ai'

const openaiCompatible = createOpenAICompatible({
  baseURL: process.env.LYBIC_LLM_BASE_URL!,
  name: 'lybic',
})

const lybicProvider = customProvider({
  languageModels: {
    'doubao-1-5-ui-tars-250328': wrapLanguageModel({
      model: openaiCompatible('doubao-1-5-ui-tars-250328'),
      middleware: [],
    }),
    'doubao-1.5-ui-tars-250428': wrapLanguageModel({
      model: openaiCompatible('doubao-1.5-ui-tars-250428'),
      middleware: [],
    }),
    'doubao-1-5-thinking-vision-pro-250428': wrapLanguageModel({
      model: openaiCompatible('doubao-1-5-thinking-vision-pro-250428'),
      middleware: [],
    }),
    'doubao-seed-1-6-flash-250715': wrapLanguageModel({
      model: openaiCompatible('doubao-seed-1-6-flash-250715'),
      middleware: [],
    }),
  },
})

export const lybicModel = lybicProvider.languageModel
