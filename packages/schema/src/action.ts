import { z } from 'zod'

export const lengthPxSchema = z
  .object({
    type: z.literal('px').describe('Indicates the unit is pixel'),
    value: z.number().describe('Length in pixels'),
  })
  .describe('Length in pixels')

export const lengthFractionSchema = z
  .object({
    type: z.literal('/'),
    numerator: z.number().describe('Numerator of the fraction'),
    denominator: z.number().describe('Denominator of the fraction'),
  })
  .describe('Length as a fraction')

export const lengthSchema = z
  .union([lengthPxSchema, lengthFractionSchema])
  .describe('Length, either in pixels or as a fraction')

export const computerUseActionMouseClickSchema = z
  .object({
    type: z.literal('mouse:click'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    button: z.number().describe('Mouse button index'),
  })
  .describe('Click the mouse at the specified coordinates')

export const computerUseActionMouseDoubleClickSchema = z
  .object({
    type: z.literal('mouse:doubleClick'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    button: z.number().describe('Mouse button index'),
  })
  .describe('Double click the mouse at the specified coordinates')

export const computerUseActionMouseMoveSchema = z
  .object({
    type: z.literal('mouse:move'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
  })
  .describe('Move the mouse to the specified coordinates')

export const computerUseActionMouseScrollSchema = z
  .object({
    type: z.literal('mouse:scroll'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    stepVertical: z.number().describe('Vertical scroll steps'),
    stepHorizontal: z.number().describe('Horizontal scroll steps'),
  })
  .describe('Scroll the mouse')

export const computerUseActionMouseDragSchema = z
  .object({
    type: z.literal('mouse:drag'),
    startX: lengthSchema.describe('Start X coordinate'),
    startY: lengthSchema.describe('Start Y coordinate'),
    endX: lengthSchema.describe('End X coordinate'),
    endY: lengthSchema.describe('End Y coordinate'),
  })
  .describe('Drag the mouse from start to end coordinates')

export const computerUseActionKeyboardTypeSchema = z
  .object({
    type: z.literal('keyboard:type'),
    content: z.string().describe('Text content to type'),
  })
  .describe('Type text content')

export const computerUseActionKeyboardHotkeySchema = z
  .object({
    type: z.literal('keyboard:hotkey'),
    keys: z
      .string()
      .describe(
        'Hotkey combination, in xdotool key syntax. Examples: "a", "Return", "alt+Tab", "ctrl+s", "Up", "KP_0" (for the numpad 0 key).',
      ),
  })
  .describe('Press a keyboard hotkey')

export const computerUseActionScreenshotSchema = z
  .object({
    type: z.literal('screenshot'),
  })
  .describe('Take a screenshot of the current screen')

export const computerUseActionWaitSchema = z
  .object({
    type: z.literal('wait'),
    duration: z.number().describe('Duration in milliseconds'),
  })
  .describe('Wait for a specified duration')

export const computerUseActionFinishedSchema = z
  .object({
    type: z.literal('finished'),
    message: z.string().optional().describe('Completion message'),
  })
  .describe('Indicates the action has finished')

export const computerUseActionFailedSchema = z
  .object({
    type: z.literal('failed'),
    message: z.string().optional().describe('Failure message'),
  })
  .describe('Indicates the action has failed')

export const computerUseActionSchema = z
  .union([
    computerUseActionMouseClickSchema,
    computerUseActionMouseDoubleClickSchema,
    computerUseActionMouseMoveSchema,
    computerUseActionMouseScrollSchema,
    computerUseActionMouseDragSchema,
    computerUseActionKeyboardTypeSchema,
    computerUseActionKeyboardHotkeySchema,
    computerUseActionScreenshotSchema,
    computerUseActionWaitSchema,
    computerUseActionFinishedSchema,
    computerUseActionFailedSchema,
  ])
  .and(
    z.object({
      callId: z.string().optional().describe('Optional call identifier'),
    }),
  )
  .describe('All possible computer use actions, with optional callId')

export const executeComputerUseActionSchema = z.object({
  action: computerUseActionSchema,
})

export type ILength = z.infer<typeof lengthSchema>
export type ILengthPixel = z.infer<typeof lengthPxSchema>
export type ILengthFraction = z.infer<typeof lengthFractionSchema>

export type IComputerUseAction = z.infer<typeof computerUseActionSchema>
export type IComputerUseActionMouseClick = z.infer<typeof computerUseActionMouseClickSchema>
export type IComputerUseActionMouseDoubleClick = z.infer<typeof computerUseActionMouseDoubleClickSchema>
export type IComputerUseActionMouseMove = z.infer<typeof computerUseActionMouseMoveSchema>
export type IComputerUseActionMouseScroll = z.infer<typeof computerUseActionMouseScrollSchema>
export type IComputerUseActionMouseDrag = z.infer<typeof computerUseActionMouseDragSchema>
export type IComputerUseActionKeyboardType = z.infer<typeof computerUseActionKeyboardTypeSchema>
export type IComputerUseActionKeyboardHotkey = z.infer<typeof computerUseActionKeyboardHotkeySchema>
export type IComputerUseActionScreenshot = z.infer<typeof computerUseActionScreenshotSchema>
export type IComputerUseActionWait = z.infer<typeof computerUseActionWaitSchema>
export type IComputerUseActionFinished = z.infer<typeof computerUseActionFinishedSchema>
export type IComputerUseActionFailed = z.infer<typeof computerUseActionFailedSchema>

export type IExecuteComputerUseAction = z.infer<typeof executeComputerUseActionSchema>
