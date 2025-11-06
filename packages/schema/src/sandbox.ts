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

export const sandboxFileMultipartUploadSchema = z
  .object({
    url: z.string().url().describe('Multipart upload target URL'),
    formFields: z.record(z.string()).default({}).describe('Extra form fields for multipart upload'),
    fileFieldName: z.string().default('file').describe('File field name in multipart form'),
  })
  .describe('Multipart upload configuration')

export const sandboxFileUploadItemSchema = z
  .object({
    localPath: z.string().min(1).describe('Absolute path in sandbox'),
    putUrl: z.string().url().describe('PUT upload URL'),
    multipartUpload: sandboxFileMultipartUploadSchema.optional().describe('Multipart upload configuration'),
  })
  .refine((v) => !!v.putUrl || !!v.multipartUpload, {
    message: 'Either putUrl or multipartUpload must be provided',
  })
  .describe('Single file upload item')

export const sandboxFileUploadRequestSchema = z.object({
  files: attachMeta(z.array(sandboxFileUploadItemSchema).min(1), { title: 'Files to upload' }),
})

export const sandboxFileUploadResultSchema = z
  .object({
    localPath: z.string().describe('Sandbox local path'),
    success: z.boolean().describe('Whether the operation succeeded'),
    error: z.string().optional().describe('Error message if failed'),
  })
  .describe('Single file upload result')

export const sandboxFileUploadResponseSchema = z.object({
  results: z.array(sandboxFileUploadResultSchema),
})

export const sandboxFileDownloadItemSchema = z
  .object({
    url: z.string().url().describe('Download URL'),
    headers: z.record(z.string()).default({}).describe('Optional HTTP headers'),
    localPath: z.string().min(1).describe('Absolute path to save in sandbox'),
  })
  .describe('Single file download item')

export const sandboxFileDownloadRequestSchema = z.object({
  files: attachMeta(z.array(sandboxFileDownloadItemSchema).min(1), { title: 'Files to download' }),
})

export const sandboxFileDownloadResultSchema = z
  .object({
    localPath: z.string().describe('Sandbox local path'),
    success: z.boolean().describe('Whether the operation succeeded'),
    error: z.string().optional().describe('Error message if failed'),
  })
  .describe('Single file download result')

export const sandboxFileDownloadResponseSchema = z.object({
  results: z.array(sandboxFileDownloadResultSchema),
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

export type SandboxFileUploadRequest = z.infer<typeof sandboxFileUploadRequestSchema>
export type SandboxFileUploadResponse = z.infer<typeof sandboxFileUploadResponseSchema>
export type SandboxFileDownloadRequest = z.infer<typeof sandboxFileDownloadRequestSchema>
export type SandboxFileDownloadResponse = z.infer<typeof sandboxFileDownloadResponseSchema>
export type SandboxProcessRequest = z.infer<typeof sandboxProcessRequestSchema>
export type SandboxProcessResponse = z.infer<typeof sandboxProcessResponseSchema>
