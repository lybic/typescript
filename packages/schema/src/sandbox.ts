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
