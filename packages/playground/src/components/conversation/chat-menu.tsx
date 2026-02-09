import { conversationConfigState } from '@/stores/conversation-config'
import {
  IconBulb,
  IconDownload,
  IconLanguage,
  IconMessage2Star,
  IconMessageChatbot,
  IconPhotoSpark,
} from '@tabler/icons-react'
import { type ComponentType } from 'react'
import { UI_MODELS } from './models'
import { ChatMenuSystemPrompt } from './chat-menu-system-prompt'

const showHidden = localStorage.getItem('lybicPlaygroundShowHiddenModels') === 'true'

const ALL_MENU_ITEMS = [
  {
    key: 'export-chat',
    label: 'Export Chat',
    description: 'Download current chat',
    icon: IconDownload,
  },
  {
    key: 'system-prompt',
    label: 'System Prompt',
    description: ChatMenuSystemPrompt,
    icon: IconMessage2Star,
  },
  {
    key: 'model',
    label: 'Model',
    icon: IconMessageChatbot,
    options: Object.entries(UI_MODELS)
      .filter(([_, value]) => value.type.includes('planner') && (showHidden || !value.hidden))
      .map(([key, value]) => ({ key, value: key, label: value.displayName })),
  },
  {
    key: 'thinking',
    label: 'Thinking',
    icon: IconBulb,
    options: [
      { key: 'disabled', value: 'disabled', label: 'Disabled' },
      { key: 'enabled', value: 'enabled', label: 'Enabled' },
      { key: 'auto', value: 'auto', label: 'Auto' },
    ],
  },
  {
    key: 'screenshotsInContext',
    label: 'Screenshots in Context',
    icon: IconPhotoSpark,
    options: [
      { key: '1', value: 1, label: 'Only Latest' },
      { key: '2', value: 2, label: '2' },
      { key: '3', value: 3, label: '3' },
      { key: '4', value: 4, label: '4' },
      { key: '5', value: 5, label: '5' },
      { key: 'all', value: 'all', label: 'All' },
    ],
  },
  {
    key: 'language',
    label: 'Prompt Language',
    icon: IconLanguage,
    options: [
      { key: 'zh', value: 'zh', label: '中文' },
      { key: 'en', value: 'en', label: 'English' },
    ],
  },
  {
    key: 'location',
    label: 'Set Location',
    description: 'Set your current location for better results',
    icon: IconLanguage,
    requireConnection: true,
  },
] satisfies Array<ItemInternal> as Array<ItemInternal>

export function getChatMenu(connectDetails?: any, shape?: any): Item[] {
  const isConnected = !!connectDetails
  const isAndroid = shape?.os === 'Android'

  return ALL_MENU_ITEMS.filter((item) => {
    // show only when connected and on Android
    if (item.key === 'location') {
      return isConnected && isAndroid
    }

    return true
  }) as Item[]
}

type OptionItem = { key: string; value: any; label: string }
type Common = { label: string; icon: ComponentType<{ className?: string }> }
type CommandItem = Common & { key: string; description: string | ComponentType }
type RadioGroupItem = Common & {
  key: keyof typeof conversationConfigState
  options: OptionItem[]
}
export type Item = CommandItem | RadioGroupItem
type ItemInternal = (CommandItem | RadioGroupItem) & { requireConnection?: boolean }
