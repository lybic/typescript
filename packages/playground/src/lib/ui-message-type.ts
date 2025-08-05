import { UIMessage } from 'ai'

export type LybicUIMessage = UIMessage<
  never,
  {
    screenShot: {
      messageId: string
      url: string
    }
  }
>
