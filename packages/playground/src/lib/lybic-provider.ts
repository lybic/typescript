import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { customProvider, defaultSettingsMiddleware, wrapLanguageModel } from 'ai'

const openaiCompatible = createOpenAICompatible({
  baseURL: `${import.meta.env.VITE_LYBIC_BASE_URL!}/api/v1`,
  name: 'lybic',
  includeUsage: true,
})

const lybicProvider = customProvider({
  languageModels: {
    'doubao-1-5-ui-tars-250328': wrapLanguageModel({
      model: openaiCompatible('doubao-1-5-ui-tars-250328'),
      middleware: [],
    }),
    'doubao-1-5-ui-tars-250428': wrapLanguageModel({
      model: openaiCompatible('doubao-1-5-ui-tars-250428'),
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
    'doubao-seed-1-6-vision-250815': wrapLanguageModel({
      model: openaiCompatible('doubao-seed-1-6-vision-250815'),
      middleware: [],
    }),
    'OpenCUA-7B': wrapLanguageModel({
      model: openaiCompatible('OpenCUA-7B'),
      middleware: [],
    }),
    'Qwen2.5-VL-7B': wrapLanguageModel({
      model: openaiCompatible('Qwen2.5-VL-7B'),
      middleware: [],
    }),
  },
})

export const lybicModel = lybicProvider.languageModel
