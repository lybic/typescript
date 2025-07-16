import { z } from 'zod'

export const statsSchema = z.object({
  mcpServers: z.number().describe('Number of MCP servers'),
  sandboxes: z.number().describe('Number of sandboxes'),
  projects: z.number().describe('Number of projects'),
})

export type Stats = z.infer<typeof statsSchema>
