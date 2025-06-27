import { z } from 'zod'

export const createSandboxSchema = z.object({
  name: z.string().default('sandbox').describe('The name of the sandbox.'),
  maxLifeSeconds: z
    .number()
    .min(1)
    .max(60 * 60 * 24)
    .default(60 * 60)
    .describe('The maximum life time of the sandbox in seconds. Default is 1 hour, max is 1 day.'),
  projectId: z.string().optional().describe('The project id to use for the sandbox. Use default if not provided.'),
  specId: z.string().optional().describe('The spec of the sandbox. Use default if not provided.'),
  datacenterId: z
    .string()
    .optional()
    .describe('The datacenter id to use for the sandbox. Use default if not provided.'),
})

export type CreateSandbox = z.infer<typeof createSandboxSchema>

export const sandboxSchema = z.object({
  id: z.string(),
  name: z.string(),
  expiredAt: z.date(),
  createdAt: z.date(),
  projectId: z.string(),
})

export type Sandbox = z.infer<typeof sandboxSchema>

export enum InternetServiceProvider {
  UNKNOWN = 0,
  CHINA_MOBILE = 1,
  CHINA_UNICOM = 2,
  CHINA_TELECOM = 3,
  GLOBAL_BGP = 4,
}

export enum GatewayType {
  UNKNOWN = 0,
  KCP = 4,
  QUIC = 5,
  WEB_TRANSPORT = 6,
}

export const sandboxConnectDetailsSchema = z.object({
  gatewayAddresses: z.array(
    z.object({
      address: z.string(),
      port: z.number(),
      name: z.string(),
      preferredProviders: z.array(z.nativeEnum(InternetServiceProvider)),
      gatewayType: z.nativeEnum(GatewayType),
    }),
  ),
  certificateHashBase64: z.string(),
  endUserToken: z.string(),
})

export type SandboxConnectDetails = z.infer<typeof sandboxConnectDetailsSchema>
