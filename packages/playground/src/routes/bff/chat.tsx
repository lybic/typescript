import { lybicModel } from '@/lib/server/lybic-provider'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'

export const ServerRoute = createServerFileRoute('/bff/chat').methods({
  POST: async ({ request }) => {
    const apiKey = `sk-${request.headers.get('X-Trial-Session-Token')}`
    const { messages }: { messages: UIMessage[] } = await request.json()

    const result = streamText({
      model: lybicModel('doubao-seed-1-6-flash-250715'),
      system:
        String.raw`You are a GUI agent. You are given a task and your action history, with screenshots. You need to perform the next action to complete the task.
## Output Format
···
Thought: ...
Action: ...
···
## Action Space
click(start_box='[x1, y1, x2, y2]')
left_double(start_box='[x1, y1, x2, y2]')
right_single(start_box='[x1, y1, x2, y2]')
drag(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')
hotkey(key='')
type(content='') #If you want to submit your input, use "\n" at the end of ·content·.
scroll(start_box='[x1, y1, x2, y2]', direction='down or up or right or left')
wait() #Sleep for 5s and take a screenshot to check for any changes.
finished(content='xxx') # Use escape characters \\', \\", and \\n in content part to ensure we can parse the content in normal python string format.
## Note
- Use {language} in ·Thought· part.
- Write a small plan and finally summarize your next action (with its target element) in one sentence in ·Thought· part.
## User Instruction
 {instruction}`
          .replaceAll(`·`, '`')
          .replaceAll('{language}', 'Chinese')
          .replaceAll('{instruction}', ''),
      messages: convertToModelMessages(messages),
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return result.toUIMessageStreamResponse()
  },
})
