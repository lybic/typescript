import { z } from 'zod/v3'

export const creditSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  sandboxHours: z.number(),
  agentCredits: z.number(),
  priority: z.number(),
  notBefore: z.string().datetime().nullable(),
  notAfter: z.string().datetime().nullable(),
  grantedAt: z.string().datetime(),
})

export type Credit = z.infer<typeof creditSchema>
