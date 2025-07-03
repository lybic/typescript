import { z } from 'zod'

export const statsSchema = z.object({
  mcpServers: z.number(),
  sandboxes: z.number(),
  projects: z.number(),
})

export type Stats = z.infer<typeof statsSchema>
