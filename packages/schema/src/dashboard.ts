import { z } from 'zod'

export const statsSchema = z.object({
  mcpServers: z.number().describe('Number of MCP servers'),
  sandboxes: z.number().describe('Number of sandboxes'),
  projects: z.number().describe('Number of projects'),
})

export type Stats = z.infer<typeof statsSchema>

export const siteConfigSchema = z.object({
  apiUrl: z.string().describe('API URL'),
  turnstileSiteKey: z.string().describe('Turnstile site key'),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>

export const waitListInputSchema = z.object({
  email: z.string().email().describe('E-Mail'),
  name: z.string().optional().describe('Name'),
  useCase: z.string().optional().describe('Use Case'),
})

export type WaitListInput = z.infer<typeof waitListInputSchema>
