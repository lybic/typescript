import { UIMessage } from 'ai'
import { IComputerUseAction } from '@lybic/schema'

export type LybicUIMessage = UIMessage<
  Partial<{
    createdAt: number
    usage: {
      inputTokens: number
      outputTokens: number
    }
  }>,
  {
    screenShot: {
      messageId: string
      url: string
    }
    parsed: {
      actions: IComputerUseAction[]
      text?: string
    }
  }
>
