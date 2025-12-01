import { z } from 'zod/v3'
import { attachMeta } from './utils.js'
import { shapeSchema } from './shape.js'

export const createSandboxSchema = z.object({
  name: attachMeta(z.string().optional().default('sandbox').describe('The name of the sandbox.'), {
    title: 'Sandbox Name',
  }),
  maxLifeSeconds: attachMeta(
    z.coerce
      .number()
      .min(1)
      .max(60 * 60 * 24)
      .default(60 * 60)
      .describe('The maximum life time of the sandbox in seconds. Default is 1 hour, max is 1 day.'),
    {
      title: 'Max Life Time',
    },
  ),
  projectId: attachMeta(
    z.string().optional().describe('The project id to use for the sandbox. Use default if not provided.'),
    {
      title: 'Project',
      fieldComponent: 'project',
    },
  ),
  shape: attachMeta(z.string().describe('Specs and datacenter of the sandbox.'), {
    title: 'Shape',
    fieldComponent: 'shape',
  }),
})

export type CreateSandbox = z.infer<typeof createSandboxSchema>

export const sandboxSchema = z.object({
  id: z.string(),
  name: z.string(),
  expiredAt: z.string().datetime().describe('Deprecated, use `expiresAt` instead.'),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  projectId: z.string(),
  shapeName: z.string(),
  status: z.enum(['PENDING', 'RUNNING', 'STOPPED', 'ERROR']).optional().describe('Current sandbox status'),
})

export type Sandbox = z.infer<typeof sandboxSchema>

export enum InternetServiceProvider {
  CHINA_TELECOM = 1,
  CHINA_UNICOM = 2,
  CHINA_MOBILE = 3,
  GLOBAL_BGP = 4,
}

export enum GatewayType {
  KCP = 4,
  QUIC = 5,
  WEB_TRANSPORT = 6,
  WEBSOCKET = 7,
  WEBSOCKET_SECURE = 8,
}

const gatewayAddressSchema = z.object({
  address: z.string(),
  port: z.number(),
  name: z.string(),
  preferredProviders: z.array(z.nativeEnum(InternetServiceProvider)),
  gatewayType: z.nativeEnum(GatewayType),
  path: z.string().optional(),
})

export const sandboxConnectDetailsSchema = z.object({
  gatewayAddresses: z.array(gatewayAddressSchema),
  certificateHashBase64: z.string(),
  endUserToken: z.string(),
  roomId: z.string(),
})

export type SandboxConnectDetails = z.infer<typeof sandboxConnectDetailsSchema>

export const sandboxPreviewSchema = z.object({
  screenShot: z
    .string()
    .url()
    .describe('The screenshot URL of the sandbox. Only available if includeScreenShot is true.'),
  cursorPosition: z
    .object({
      x: z.number().describe('The x position of the cursor.'),
      y: z.number().describe('The y position of the cursor.'),
      screenWidth: z.number().describe('The width of the screen.'),
      screenHeight: z.number().describe('The height of the screen.'),
      screenIndex: z.number().describe('The index of the screen.'),
    })
    .describe('The cursor position of the sandbox. Only available if includeCursorPosition is true.'),
})

export type SandboxPreview = z.infer<typeof sandboxPreviewSchema>

export const createBringYourOwnSandboxSchema = z.object({
  name: attachMeta(z.string().optional().default('sandbox').describe('The name of the sandbox.'), {
    title: 'Sandbox Name',
  }),
  projectId: attachMeta(
    z.string().optional().describe('The project id to use for the sandbox. Use default if not provided.'),
    {
      title: 'Project',
      fieldComponent: 'project',
    },
  ),
  maxLifeSeconds: attachMeta(
    z.coerce
      .number()
      .min(1)
      .max(60 * 60 * 24 * 365)
      .default(60 * 60)
      .describe('The maximum life time of the sandbox in seconds. Default is 1 hour, max is 1 year.'),
    {
      title: 'Max Life Time',
    },
  ),
  gatewayAddress: attachMeta(z.string().describe('The gateway address of the sandbox.'), {
    title: 'Gateway Address',
  }),
  gatewayPort: attachMeta(z.number().describe('The QUIC and WebTransport port of the sandbox.'), {
    title: 'Port',
  }),
  roomCertificateHashBase64: attachMeta(
    z.string().describe('The base64 encoded room certificate hash of the sandbox.'),
    {
      title: 'Room Certificate Hash',
    },
  ),
  jwkX: attachMeta(z.string().describe('The x of the jwk of the sandbox.'), {
    title: 'JWK X',
  }),
  jwkD: attachMeta(z.string().describe('The d of the jwk of the sandbox.'), {
    title: 'JWK D',
  }),
  roomId: attachMeta(z.string().describe('The room id of the sandbox.'), {
    title: 'Room ID',
  }),
  roomShape: shapeSchema,
})

export type CreateBringYourOwnSandbox = z.infer<typeof createBringYourOwnSandboxSchema>

export const getSandboxResponseSchema = z.object({
  sandbox: z.intersection(
    sandboxSchema,
    z.object({
      shape: shapeSchema,
    }),
  ),
  connectDetails: sandboxConnectDetailsSchema,
})

export type GetSandboxResponse = z.infer<typeof getSandboxResponseSchema>

export const executeComputerUseResponseSchema = z.object({
  screenShot: z.string().url().optional().describe('The screenshot of the sandbox after the action is executed.'),
  cursorPosition: z
    .object({
      x: z.number().describe('The x position of the cursor.'),
      y: z.number().describe('The y position of the cursor.'),
      screenWidth: z.number().describe('The width of the screen.'),
      screenHeight: z.number().describe('The height of the screen.'),
      screenIndex: z.number().describe('The index of the screen.'),
    })
    .optional(),
  actionResult: z
    .any()
    .optional()
    .describe(
      "The result of the action. Schema is based on the action type and there's no guarantee on the schema. Pass it directly to the LLM if it exists.",
    ),
})

export type ExecuteComputerUseResponse = z.infer<typeof executeComputerUseResponseSchema>

export const connectMcpServerToSandboxSchema = z.object({
  sandboxId: z.string().nullable().describe('The ID of the sandbox to connect the MCP server to.'),
})

export type ConnectMcpServerToSandbox = z.infer<typeof connectMcpServerToSandboxSchema>

export const extendSandboxSchema = z.object({
  maxLifeSeconds: attachMeta(
    z.coerce
      .number()
      .min(30)
      .max(60 * 60 * 24)
      .default(60 * 60)
      .describe(
        'The new max life time of the sandbox (relative to the current time) in seconds. Should not less than 30 seconds or more than 24 hours. Note that the total maximum lifetime of a sandbox should not longer than 13 days.',
      ),
    {
      title: 'New Max Life Time',
    },
  ),
})

export type ExtendSandbox = z.infer<typeof extendSandboxSchema>

export const sandboxFileLocationSchema = z.object({
  type: z.literal('sandboxFileLocation'),
  path: z.string().min(1).describe('File path in sandbox'),
})

export const httpPutLocationSchema = z.object({
  type: z.literal('httpPutLocation'),
  url: z.string().url().describe('PUT upload URL'),
  headers: z.record(z.string()).optional().describe('Optional HTTP headers'),
})

export const httpGetLocationSchema = z.object({
  type: z.literal('httpGetLocation'),
  url: z.string().url().describe('GET download URL'),
  headers: z.record(z.string()).optional().describe('Optional HTTP headers'),
})

export const httpPostFormLocationSchema = z.object({
  type: z.literal('httpPostFormLocation'),
  url: z.string().url().describe('POST form upload URL'),
  form: z.record(z.string()).describe('Form fields'),
  fileField: z.string().default('file').describe('File field name in form'),
  headers: z.record(z.string()).optional().describe('Optional HTTP headers'),
})

export const fileLocationSchema = z.discriminatedUnion('type', [
  sandboxFileLocationSchema,
  httpPutLocationSchema,
  httpGetLocationSchema,
  httpPostFormLocationSchema,
])

export const sandboxFileCopyItemSchema = z
  .object({
    id: z
      .string()
      .optional()
      .describe(
        'A caller-defined unique identifier for this item. The value is included in the response to associate results with their corresponding requests',
      ),
    src: fileLocationSchema.describe('Copy file source'),
    dest: fileLocationSchema.describe('Copy file destination'),
  })
  .describe('Single file copy item')

export const sandboxFileCopyRequestSchema = z.object({
  files: attachMeta(z.array(sandboxFileCopyItemSchema).min(1), { title: 'copy files' }),
})

export const sandboxFileCopyResultSchema = z
  .object({
    id: z.string().optional().describe('unique identifier of the files item from the request'),
    success: z.boolean().describe('Whether the operation succeeded'),
    error: z.string().optional().describe('Error message if failed'),
  })
  .describe('Single file copy result')

export const sandboxFileCopyResponseSchema = z.object({
  results: z.array(sandboxFileCopyResultSchema),
})

export const sandboxProcessRequestSchema = z
  .object({
    executable: z.string().min(1).describe('Executable path'),
    args: z.array(z.string()).default([]).describe('Arguments'),
    workingDirectory: z.string().optional().describe('Working directory'),
    stdinBase64: z.string().optional().describe('Optional stdin as base64-encoded bytes'),
  })
  .describe('Create a process in sandbox')

export const sandboxProcessResponseSchema = z
  .object({
    stdoutBase64: z.string().default('').describe('stdout as base64-encoded bytes'),
    stderrBase64: z.string().default('').describe('stderr as base64-encoded bytes'),
    exitCode: z.number().describe('Exit code'),
  })
  .describe('Process execution result')

export type SandboxFileCopyRequest = z.infer<typeof sandboxFileCopyRequestSchema>
export type SandboxFileCopyResponse = z.infer<typeof sandboxFileCopyResponseSchema>
export type SandboxProcessRequest = z.infer<typeof sandboxProcessRequestSchema>
export type SandboxProcessResponse = z.infer<typeof sandboxProcessResponseSchema>
