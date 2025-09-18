// hidden models are not performance well, so we hide them by default
// use `localStorage.lybicPlaygroundShowHiddenModels = 'true'` to show them
export const UI_MODELS = {
  'doubao-1-5-ui-tars-250428': {
    displayName: 'Doubao 1.5 UI-TARS 250428',
    thinking: true,
    hidden: false,
    type: ['planner', 'grounding'],
  },
  'doubao-1-5-thinking-vision-pro-250428': {
    displayName: 'Doubao 1.5 Vision Pro',
    thinking: true,
    hidden: false,
    type: ['planner', 'grounding'],
  },
  'doubao-seed-1-6-vision-250815': {
    displayName: 'Doubao Seed 1.6 Vision',
    thinking: true,
    hidden: false,
    type: ['planner'],
  },
  'gemini-2.5-pro': {
    displayName: 'Gemini 2.5 Pro',
    thinking: false,
    hidden: true, // Hidden because of internal use only
    type: ['planner'],
  },
  'gemini-2.5-flash': {
    displayName: 'Gemini 2.5 Flash',
    thinking: false,
    hidden: true, // Hidden because of internal use only
    type: ['planner'],
  },
  'o3': {
    displayName: 'OpenAI GPT4-O3',
    thinking: false,
    hidden: true, // Hidden because of internal use only
    type: ['planner'],
  },
  'doubao-seed-1-6-flash-250715': {
    displayName: 'Doubao Seed 1.6 Flash',
    thinking: true,
    hidden: false,
    type: ['planner'],
  },
  'OpenCUA': {
    displayName: 'OpenCUA',
    thinking: false,
    hidden: true, // Hidden because backend support has not yet been added
    type: ['grounding'],
  },
  'Qwen2.5-VL': {
    displayName: 'Qwen2.5-VL',
    thinking: false,
    hidden: true, // Hidden because backend support has not yet been added
    type: ['grounding'],
  },
} as Record<string, { displayName: string; thinking: boolean; hidden: boolean; type: ('planner' | 'grounding')[] }>;
