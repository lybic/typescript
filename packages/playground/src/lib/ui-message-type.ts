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

export type BodyExtras = {
  baseUrl?: string
  systemPrompt?: string
  sandboxId?: string
  orgId?: string
  trialSessionToken?: string
  thinking?: 'auto' | 'enabled' | 'disabled' // 豆包系列模型思考
}
