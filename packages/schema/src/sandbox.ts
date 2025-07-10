import { z } from 'zod'
import { attachMeta } from './utils.js'

export const createSandboxSchema = z.object({
  name: attachMeta(z.string().optional().default('sandbox').describe('The name of the sandbox.'), {
    title: 'Sandbox Name',
  }),
  maxLifeSeconds: attachMeta(
    z
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
  specId: attachMeta(z.string().optional().describe('The spec of the sandbox. Use default if not provided.'), {
    title: 'Spec',
    fieldComponent: 'hidden',
  }),
  datacenterId: attachMeta(
    z.string().optional().describe('The datacenter id to use for the sandbox. Use default if not provided.'),
    {
      title: 'Datacenter',
      fieldComponent: 'hidden',
    },
  ),
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
  CHINA_MOBILE = 1,
  CHINA_UNICOM = 2,
  CHINA_TELECOM = 3,
  GLOBAL_BGP = 4,
}

export enum GatewayType {
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

export const sandboxPreviewSchema = z.object({
  screenShot: z.string().url(),
  cursorPosition: z.object({
    x: z.number(),
    y: z.number(),
    screenWidth: z.number(),
    screenHeight: z.number(),
    screenIndex: z.number(),
  }),
})

export type SandboxPreview = z.infer<typeof sandboxPreviewSchema>
