import { z } from 'zod/v3'

export const statsSchema = z.object({
  mcpServers: z.number().describe(/* i18n */ 'Number of MCP servers'),
  sandboxes: z.number().describe(/* i18n */ 'Number of sandboxes'),
  projects: z.number().describe(/* i18n */ 'Number of projects'),
})

export type Stats = z.infer<typeof statsSchema>

export const siteConfigSchema = z.object({
  apiUrl: z.string().describe(/* i18n */ 'API URL'),
  siteUrl: z.string().describe(/* i18n */ 'Site URL'),
  siteRegion: z.string().describe(/* i18n */ 'Site region'),
  turnstileSiteKey: z.string().describe(/* i18n */ 'Turnstile site key'),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>

export const waitListInputSchema = z.object({
  email: z.string().email().describe(/* i18n */ 'E-Mail'),
  name: z.string().optional().describe(/* i18n */ 'Name'),
  useCase: z.string().optional().describe(/* i18n */ 'Use Case'),
})

export type WaitListInput = z.infer<typeof waitListInputSchema>
