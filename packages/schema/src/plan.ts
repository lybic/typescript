import { z } from 'zod/v3'
import { attachMeta } from './utils.js'

export const planSchema = z.object({
  name: attachMeta(z.string(), {
    title: 'Name',
    fieldComponent: 'string',
  }),
  tier: attachMeta(z.coerce.number(), {
    title: 'Tier',
    fieldComponent: 'string',
  }),
  concurrentSandboxes: attachMeta(z.coerce.number().int(), {
    title: 'Concurrent Sandboxes',
    fieldComponent: 'string',
  }),
  pricePerMonth: attachMeta(z.string(), {
    title: 'Price Per Month',
    fieldComponent: 'string',
  }),
  sandboxHoursIncludedPerMonth: attachMeta(z.string(), {
    title: 'Sandbox Hours Included Per Month',
    fieldComponent: 'string',
  }),
  agentCreditsIncludedPerMonth: attachMeta(z.string(), {
    title: 'Agent Credits Included Per Month',
    fieldComponent: 'string',
  }),
  oneTime: attachMeta(z.boolean(), {
    title: 'One Time',
    fieldComponent: 'switch',
  }),
})

export type Plan = z.infer<typeof planSchema>

export const assignPlanToOrganizationSchema = z.object({
  organizationId: attachMeta(z.string(), {
    title: 'Organization ID',
    fieldComponent: 'string',
  }),
  planName: attachMeta(z.string(), {
    title: 'Plan Name',
    fieldComponent: 'string',
  }),
  expiredAt: attachMeta(z.coerce.date(), {
    title: 'Expired At',
    fieldComponent: 'date',
  }),
})

export type AssignPlanToOrganization = z.infer<typeof assignPlanToOrganizationSchema>
