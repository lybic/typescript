import { LybicClient } from '@lybic/core'
import {
  ChatRequestOptions,
  ChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  streamText,
  UIMessage,
  UIMessageChunk,
} from 'ai'
import { arkModel } from './ark-provider'

const guiAgentUiTarsPromptEn = `## Role
You are a GUI Agent, proficient in the operation of various commonly used software on Windows, Linux, and other operating systems.
Please complete the user's task based on user input, history Action, and screen shots.
You need to complete the entire task step by step, and output only one Action at a time, please strictly follow the format below.

## Output Format
Action_Summary: ... // Please make sure use English in this part.
Action: ...

Please strictly use the prefix "Action_Summary:" and "Action:".
Please use English in Action_Summary and use function calls in Action.

## Action Format
### click(start_box='<bbox>left_x top_y right_x bottom_y</bbox>')
### left_double(start_box='<bbox>left_x top_y right_x bottom_y</bbox>')
### right_click(start_box='<bbox>left_x top_y right_x bottom_y</bbox>')
### drag(start_box='<bbox>left_x top_y right_x bottom_y</bbox>', end_box='<bbox>left_x top_y right_x bottom_y</bbox>')
### type(content='content') // If you want to submit your input, next action use hotkey(key='enter')
### hotkey(key='key')
### scroll(direction:Enum[up,down,left,right]='direction',start_box='<bbox>left_x top_y right_x bottom_y</bbox>')
### wait()
### finished()
### call_user() // Submit the task and call the user when the task is unsolvable, or when you need the user's help.
### output(content='content') // It is only used when the user specifies to use output, and after output is executed, it cannot be executed again.
`

export class LybicChatTransport implements ChatTransport<UIMessage> {
  public constructor(private readonly coreClient: LybicClient) {}

  public async sendMessages(
    options: {
      trigger: 'submit-message' | 'regenerate-message'
      chatId: string
      messageId: string | undefined
      messages: UIMessage[]
    } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk>> {
    const stream = createUIMessageStream<UIMessage>({
      execute: async ({ writer }) => {
        const modelMessages = convertToModelMessages(options.messages)
        const coreClient = this.coreClient

        const systemPrompt = guiAgentUiTarsPromptEn

        const result = streamText({
          model: arkModel('doubao-1-5-ui-tars-250428'),
          system: systemPrompt,
          messages: modelMessages,
          onFinish: async (message) => {
            const { data: parsedAction } = await coreClient.parseLlmOutput({
              model: 'ui-tars',
              textContent: message.text,
            })

            if (parsedAction?.actions && parsedAction.actions.length > 0) {
              writer.write({
                type: 'data-parsed',
                data: {
                  actions: parsedAction.actions,
                  text: [parsedAction.thoughts, parsedAction.unknown].filter(Boolean).join('\n'),
                },
              })
            }
          },
        })

        writer.merge(result.toUIMessageStream())
      },
    })

    return stream
  }

  public async reconnectToStream(
    options: { chatId: string } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk> | null> {
    return null
  }
}
