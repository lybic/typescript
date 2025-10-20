import {
  StreamTextResult,
  ToolSet,
  UIMessageStreamOnFinishCallback,
  UIMessageStreamOptions,
  UIMessageStreamWriter,
} from 'ai'
import { LybicUIMessage } from '../ui-message-type'

type ReturnValue = Parameters<UIMessageStreamOnFinishCallback<LybicUIMessage>>[0]

export function mergeToWriter(
  writer: UIMessageStreamWriter<LybicUIMessage>,
  stream: StreamTextResult<ToolSet, unknown>,
) {
  return new Promise<ReturnValue>((resolve) => {
    writer.merge(
      stream.toUIMessageStream({
        onFinish: resolve,
        messageMetadata({ part }) {
          if (part.type === 'start') {
            return {
              createdAt: Date.now(),
            }
          } else if (part.type === 'finish') {
            return {
              usage: {
                inputTokens: part.totalUsage?.inputTokens ?? 0,
                outputTokens: part.totalUsage?.outputTokens ?? 0,
              },
            }
          }
        },
      }),
    )
  })
}
