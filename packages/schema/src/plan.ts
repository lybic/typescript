import { z } from 'zod/v3'

export const planSchema = z.object({
  name: z.string(),
  tier: z.number(),
  concurrentSandboxes: z.number().int(),
  pricePerMonth: z.string(),
  sandboxHoursIncludedPerMonth: z.string(),
  agentCreditsIncludedPerMonth: z.string(),
  oneTime: z.boolean(),
})

export type Plan = z.infer<typeof planSchema>

export const assignPlanToOrganizationSchema = z.object({
  organizationId: z.string(),
  planName: z.string(),
  expiredAt: z.coerce.date(),
})

export type AssignPlanToOrganization = z.infer<typeof assignPlanToOrganizationSchema>
