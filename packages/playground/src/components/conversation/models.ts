// hidden models are not performance well, so we hide them by default
// use `localStorage.lybicPlaygroundShowHiddenModels = 'true'` to show them
export const UI_MODELS = {
  'doubao-1-5-ui-tars-250428': {
    displayName: 'Doubao 1.5 UI-TARS 250428',
    thinking: true,
    hidden: false,
  },
  'doubao-1-5-thinking-vision-pro-250428': {
    displayName: 'Doubao 1.5 Vision Pro',
    thinking: true,
    hidden: false,
  },
  'doubao-seed-1-6-vision-250815': {
    displayName: 'Doubao Seed 1.6 Vision',
    thinking: true,
    hidden: true,
  },
  'doubao-seed-1-6-flash-250715': {
    displayName: 'Doubao Seed 1.6 Flash',
    thinking: true,
    hidden: true,
  },
} as Record<string, { displayName: string; thinking: boolean; hidden: boolean }>
