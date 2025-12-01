import { z } from 'zod/v3'

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

export const computerUseActionKeyDownSchema = z
  .object({
    type: z.literal('key:down'),
    key: z.string().describe('Key to press'),
  })
  .describe(
    'Press ONE key down, in xdotool key syntax. Only use this action if hotkey or type cannot satisfy your needs.',
  )

export const computerUseActionKeyUpSchema = z
  .object({
    type: z.literal('key:up'),
    key: z.string().describe('Key to release'),
  })
  .describe(
    'Release ONE key, in xdotool key syntax. Only use this action if keydown cannot satisfy your needs and only after a key down.',
  )

export const computerUseActionMouseClickSchema = z
  .object({
    type: z.literal('mouse:click'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    button: z
      .number()
      .describe(
        'Mouse button flag combination. 1: left, 2: right, 4: middle, 8: back, 16: forward; add them together to press multiple buttons at once.',
      ),
    holdKey: z
      .string()
      .optional()
      .describe('Key to hold down during click, in xdotool key syntax. Example: "ctrl", "alt", "alt+shift".'),
    relative: z.boolean().optional().describe('Whether the coordinates are relative to the current mouse position.'),
  })
  .describe('Click the mouse at the specified coordinates')

export const computerUseActionMouseDoubleClickSchema = z
  .object({
    type: z.literal('mouse:doubleClick'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    button: z.number().describe('Mouse button index'),
    holdKey: z
      .string()
      .optional()
      .describe('Key to hold down during double click, in xdotool key syntax. Example: "ctrl", "alt", "alt+shift".'),
    relative: z.boolean().optional().describe('Whether the coordinates are relative to the current mouse position.'),
  })
  .describe('Double click the mouse at the specified coordinates')

export const computerUseActionMouseTripleClickSchema = z
  .object({
    type: z.literal('mouse:tripleClick'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    button: z.number().describe('Mouse button index'),
    holdKey: z
      .string()
      .optional()
      .describe('Key to hold down during triple click, in xdotool key syntax. Example: "ctrl", "alt", "alt+shift".'),
    relative: z.boolean().optional().describe('Whether the coordinates are relative to the current mouse position.'),
  })
  .describe('Triple click the mouse at the specified coordinates')

export const computerUseActionMouseMoveSchema = z
  .object({
    type: z.literal('mouse:move'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    holdKey: z
      .string()
      .optional()
      .describe('Key to hold down during move, in xdotool key syntax. Example: "ctrl", "alt", "alt+shift".'),
    relative: z.boolean().optional().describe('Whether the coordinates are relative to the current mouse position.'),
  })
  .describe('Move the mouse to the specified coordinates')

export const computerUseActionMouseScrollSchema = z
  .object({
    type: z.literal('mouse:scroll'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    stepVertical: z.number().describe('Vertical scroll steps'),
    stepHorizontal: z.number().describe('Horizontal scroll steps'),
    holdKey: z
      .string()
      .optional()
      .describe('Key to hold down during scroll, in xdotool key syntax. Example: "ctrl", "alt", "alt+shift".'),
    relative: z.boolean().optional().describe('Whether the coordinates are relative to the current mouse position.'),
  })
  .describe('Scroll the mouse')

export const computerUseActionMouseDragSchema = z
  .object({
    type: z.literal('mouse:drag'),
    startX: lengthSchema.describe('Start X coordinate'),
    startY: lengthSchema.describe('Start Y coordinate'),
    endX: lengthSchema.describe('End X coordinate'),
    endY: lengthSchema.describe('End Y coordinate'),
    button: z.number().optional().describe('Mouse button index'),
    holdKey: z
      .string()
      .optional()
      .describe('Key to hold down during drag, in xdotool key syntax. Example: "ctrl", "alt", "alt+shift".'),
    startRelative: z
      .boolean()
      .optional()
      .describe('Whether the coordinates are relative to the current mouse position.'),
    endRelative: z.boolean().optional().describe('Whether the coordinates are relative to the current mouse position.'),
  })
  .describe('Drag the mouse from start to end coordinates')

export const generalActionKeyboardTypeSchema = z
  .object({
    type: z.literal('keyboard:type'),
    content: z.string().describe('Text content to type'),
    treatNewLineAsEnter: z
      .boolean()
      .default(false)
      .optional()
      .nullable()
      .describe(
        'Whether to treat line breaks as enter. If true, any line breaks(\\n) in content will be treated as enter key press, and content will be split into multiple lines.',
      ),
  })
  .describe('Type text content')

export const generalActionKeyboardHotkeySchema = z
  .object({
    type: z.literal('keyboard:hotkey'),
    keys: z
      .string()
      .describe(
        'Hotkey combination, in xdotool key syntax. Examples: "a", "Return", "alt+Tab", "ctrl+s", "Up", "KP_0" (for the numpad 0 key).',
      ),
    duration: z
      .number()
      .min(1)
      .max(5000)
      .optional()
      .describe('Duration in milliseconds. If specified, the hotkey will be held for a while and then released.'),
  })
  .describe('Press a keyboard hotkey')

export const mobileUseActionTapSchema = z
  .object({
    type: z.literal('touch:tap'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
  })
  .describe('Tap the screen at the specified coordinates')

export const mobileUseActionDragSchema = z
  .object({
    type: z.literal('touch:drag'),
    startX: lengthSchema.describe('Start X coordinate'),
    startY: lengthSchema.describe('Start Y coordinate'),
    endX: lengthSchema.describe('End X coordinate'),
    endY: lengthSchema.describe('End Y coordinate'),
  })
  .describe('Touch and hold at start coordinates, then move to end coordinates and release')

export const mobileUseActionLongPressSchema = z
  .object({
    type: z.literal('touch:longPress'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    duration: z.number().describe('Duration in milliseconds'),
  })
  .describe('Long press the screen at the specified coordinates')

export const mobileUseActionPressBackSchema = z
  .object({
    type: z.literal('android:back'),
  })
  .describe('Press the back button')

export const mobileUseActionPressHomeSchema = z
  .object({
    type: z.literal('android:home'),
  })
  .describe('Press the home button')

export const mobileUseActionListAppsSchema = z
  .object({
    type: z.literal('os:listApps'),
  })
  .describe('List all installed apps')

export const mobileUseActionStartAppSchema = z
  .object({
    type: z.literal('os:startApp'),
    packageName: z.string().describe('App package name'),
  })
  .describe('Start an app by its package name')

export const mobileUseActionStartAppByNameSchema = z
  .object({
    type: z.literal('os:startAppByName'),
    name: z.string().describe('App name'),
  })
  .describe('Start an app by its name')

export const mobileUseActionCloseAppSchema = z
  .object({
    type: z.literal('os:closeApp'),
  })
  .describe('Close the current app')

export const mobileUseActionSwipeSchema = z
  .object({
    type: z.literal('touch:swipe'),
    x: lengthSchema.describe('X coordinate'),
    y: lengthSchema.describe('Y coordinate'),
    direction: z.enum(['up', 'down', 'left', 'right']).describe('Scroll direction'),
    distance: lengthSchema.describe('Scroll distance'),
  })
  .describe('Swipe the screen in a specified direction by a specified distance')

export const generalActionScreenshotSchema = z
  .object({
    type: z.literal('screenshot'),
  })
  .describe('Take a screenshot of the current screen')

export const generalActionWaitSchema = z
  .object({
    type: z.literal('wait'),
    duration: z.number().describe('Duration in milliseconds'),
  })
  .describe('Wait for a specified duration')

export const generalActionFinishedSchema = z
  .object({
    type: z.literal('finished'),
    message: z.string().optional().describe('Completion message'),
  })
  .describe('Indicates the action has finished')

export const generalActionFailedSchema = z
  .object({
    type: z.literal('failed'),
    message: z.string().optional().describe('Failure message'),
  })
  .describe('Indicates the action has failed')

export const generalActionUserTakeoverSchema = z
  .object({
    type: z.literal('client:user-takeover'),
  })
  .describe('Indicates the human user should take over the control')

export const mobileUseActionSchema = z
  .discriminatedUnion('type', [
    generalActionScreenshotSchema,
    generalActionWaitSchema,
    generalActionFinishedSchema,
    generalActionFailedSchema,
    generalActionUserTakeoverSchema,
    generalActionKeyboardTypeSchema,
    generalActionKeyboardHotkeySchema,
    mobileUseActionTapSchema,
    mobileUseActionDragSchema,
    mobileUseActionSwipeSchema,
    mobileUseActionLongPressSchema,
    mobileUseActionPressBackSchema,
    mobileUseActionPressHomeSchema,
    mobileUseActionListAppsSchema,
    mobileUseActionStartAppSchema,
    mobileUseActionStartAppByNameSchema,
    mobileUseActionCloseAppSchema,
  ])
  .and(
    z.object({
      callId: z.string().optional().describe('Optional call identifier'),
    }),
  )
  .describe('All possible mobile use actions, with optional callId')

export const computerUseActionSchema = z
  .discriminatedUnion('type', [
    computerUseActionMouseClickSchema,
    computerUseActionMouseDoubleClickSchema,
    computerUseActionMouseTripleClickSchema,
    computerUseActionMouseMoveSchema,
    computerUseActionMouseScrollSchema,
    computerUseActionMouseDragSchema,
    generalActionKeyboardTypeSchema,
    generalActionKeyboardHotkeySchema,
    generalActionScreenshotSchema,
    generalActionWaitSchema,
    generalActionFinishedSchema,
    generalActionFailedSchema,
    generalActionUserTakeoverSchema,
    computerUseActionKeyDownSchema,
    computerUseActionKeyUpSchema,
  ])
  .and(
    z.object({
      callId: z.string().optional().describe('Optional call identifier'),
    }),
  )
  .describe('All possible computer use actions, with optional callId')

export const sandboxActionSchema = z
  .union([computerUseActionSchema, mobileUseActionSchema])
  .describe('All possible sandbox actions')

export const executeComputerUseActionSchema = z.object({
  action: computerUseActionSchema,
  includeScreenShot: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to include the screenshot url after action in the response'),
  includeCursorPosition: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to include the cursor position after action in the response'),
})

export const executeMobileUseActionSchema = z.object({
  action: mobileUseActionSchema,
  includeScreenShot: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to include the screenshot url after action in the response'),
  includeCursorPosition: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'Whether to include the cursor position after action in the response. Only width and height are meaningful.',
    ),
})

export const executeSandboxActionSchema = z.object({
  action: z.discriminatedUnion('type', [
    computerUseActionKeyDownSchema,
    computerUseActionKeyUpSchema,
    computerUseActionMouseClickSchema,
    computerUseActionMouseDoubleClickSchema,
    computerUseActionMouseDragSchema,
    computerUseActionMouseMoveSchema,
    computerUseActionMouseScrollSchema,
    computerUseActionMouseTripleClickSchema,
    generalActionFailedSchema,
    generalActionFinishedSchema,
    generalActionKeyboardHotkeySchema,
    generalActionKeyboardTypeSchema,
    generalActionScreenshotSchema,
    generalActionUserTakeoverSchema,
    generalActionWaitSchema,
    mobileUseActionCloseAppSchema,
    mobileUseActionDragSchema,
    mobileUseActionListAppsSchema,
    mobileUseActionLongPressSchema,
    mobileUseActionPressBackSchema,
    mobileUseActionPressHomeSchema,
    mobileUseActionStartAppByNameSchema,
    mobileUseActionStartAppSchema,
    mobileUseActionSwipeSchema,
    mobileUseActionTapSchema,
  ]),
  includeScreenShot: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to include the screenshot url after action in the response'),
  includeCursorPosition: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'Whether to include the cursor position after action in the response. On some cursor-less devices, only width and height are meaningful.',
    ),
})

export type ILength = z.infer<typeof lengthSchema>
export type ILengthPixel = z.infer<typeof lengthPxSchema>
export type ILengthFraction = z.infer<typeof lengthFractionSchema>

export type IComputerUseAction = z.infer<typeof computerUseActionSchema>
export type IComputerUseActionMouseClick = z.infer<typeof computerUseActionMouseClickSchema>
export type IComputerUseActionMouseDoubleClick = z.infer<typeof computerUseActionMouseDoubleClickSchema>
export type IComputerUseActionMouseTripleClick = z.infer<typeof computerUseActionMouseTripleClickSchema>
export type IComputerUseActionMouseMove = z.infer<typeof computerUseActionMouseMoveSchema>
export type IComputerUseActionMouseScroll = z.infer<typeof computerUseActionMouseScrollSchema>
export type IComputerUseActionMouseDrag = z.infer<typeof computerUseActionMouseDragSchema>
export type IGeneralActionKeyboardType = z.infer<typeof generalActionKeyboardTypeSchema>
export type IGeneralActionKeyboardHotkey = z.infer<typeof generalActionKeyboardHotkeySchema>
export type IComputerUseActionScreenshot = z.infer<typeof generalActionScreenshotSchema>
export type IComputerUseActionWait = z.infer<typeof generalActionWaitSchema>
export type IComputerUseActionFinished = z.infer<typeof generalActionFinishedSchema>
export type IComputerUseActionFailed = z.infer<typeof generalActionFailedSchema>
export type IComputerUseActionUserTakeover = z.infer<typeof generalActionUserTakeoverSchema>
export type IComputerUseActionKeyDown = z.infer<typeof computerUseActionKeyDownSchema>
export type IComputerUseActionKeyUp = z.infer<typeof computerUseActionKeyUpSchema>

export type IAssistantAction = z.infer<typeof sandboxActionSchema>
export type IMobileUseAction = z.infer<typeof mobileUseActionSchema>

export type IExecuteComputerUseAction = z.infer<typeof executeComputerUseActionSchema>
export type IExecuteMobileUseAction = z.infer<typeof executeMobileUseActionSchema>
export type IExecuteSandboxAction = z.infer<typeof executeSandboxActionSchema>
