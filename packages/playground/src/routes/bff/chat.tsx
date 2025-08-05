import { lybicModel } from '@/lib/server/lybic-provider'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import guiAgentUiTarsPrompt from '@/prompts/gui-agent-ui-tars.zh.txt?raw'

export const ServerRoute = createServerFileRoute('/bff/chat').methods({
  POST: async ({ request }) => {
    const apiKey = `sk-${request.headers.get('X-Trial-Session-Token')}`
    const { messages }: { messages: UIMessage[] } = await request.json()

    const result = streamText({
      model: lybicModel('doubao-seed-1-6-flash-250715'),
      system: guiAgentUiTarsPrompt,
      messages: convertToModelMessages(messages),
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return result.toUIMessageStreamResponse()
  },
})
