import { LybicClient } from '@lybic/core'
import { throwIfAborted } from './throw-if-aborted'
import { previewSandbox } from '../api/preview-sandbox'
import { LybicUIMessage } from '../ui-message-type'
import { convertToModelMessages, FilePart, ModelMessage } from 'ai'
import { stripImagesFromMessages } from './strip-images-from-messages'
import { transformImagesToDataUrl } from './transform-images-to-data-url'

export async function buildHistory({
  messages,
  abortSignal,
  coreClient,
  sandboxId,
  imagesInContext,
  onScreenShot,
}: {
  messages: LybicUIMessage[]
  coreClient: LybicClient
  sandboxId: string
  imagesInContext: number | 'all'
  abortSignal?: AbortSignal
  onScreenShot?: (screenshot: string, lastMessageId: string) => void
}): Promise<{ messages: ModelMessage[]; screenSize: { width: number; height: number } }> {
  const lastMessageId = messages[messages.length - 1]?.id
  const modelMessages = convertToModelMessages(messages)
  const lastMessage = modelMessages[modelMessages.length - 1]
  if (!lastMessage || lastMessage.role !== 'user' || !lastMessageId) {
    throw new Error('Last message must be a user message')
  }

  throwIfAborted(abortSignal)

  // #region take screenshot
  let preview = await throwIfAborted(
    abortSignal,
    () => previewSandbox(coreClient, sandboxId, abortSignal),
    'Preview sandbox',
  )!

  onScreenShot?.(preview!.screenShot!, lastMessageId)

  // #endregion

  throwIfAborted(abortSignal)

  // #region build new messages
  if (typeof lastMessage.content === 'string') {
    lastMessage.content = [
      {
        type: 'text',
        text: lastMessage.content,
      },
    ]
  }

  const imagePart: FilePart = {
    type: 'file',
    mediaType: 'image/webp',
    data: new URL(preview!.screenShot!),
  }
  lastMessage.content.push(imagePart)

  stripImagesFromMessages(modelMessages, imagesInContext ?? 1)
  await transformImagesToDataUrl(modelMessages, abortSignal)

  // #endregion

  return {
    messages: modelMessages,
    screenSize: {
      width: preview!.cursorPosition?.screenWidth ?? 1280,
      height: preview!.cursorPosition?.screenHeight ?? 720,
    },
  }
}
