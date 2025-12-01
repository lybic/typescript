import { z } from 'zod/v3'
import { attachMeta } from './utils.js'

export const planSchema = z.object({
  name: attachMeta(z.string(), {
    title: /* i18n */ 'Name',
    fieldComponent: 'string',
  }),
  tier: attachMeta(z.coerce.number(), {
    title: /* i18n */ 'Tier',
    fieldComponent: 'string',
  }),
  concurrentSandboxes: attachMeta(z.coerce.number().int(), {
    title: /* i18n */ 'Concurrent Sandboxes',
    fieldComponent: 'string',
  }),
  pricePerMonth: attachMeta(z.string(), {
    title: /* i18n */ 'Price Per Month',
    fieldComponent: 'string',
  }),
  sandboxHoursIncludedPerMonth: attachMeta(z.string(), {
    title: /* i18n */ 'Sandbox Hours Included Per Month',
    fieldComponent: 'string',
  }),
  agentCreditsIncludedPerMonth: attachMeta(z.string(), {
    title: /* i18n */ 'Agent Credits Included Per Month',
    fieldComponent: 'string',
  }),
  oneTime: attachMeta(z.boolean(), {
    title: /* i18n */ 'One Time',
    fieldComponent: 'switch',
  }),
  purchasable: attachMeta(z.boolean(), {
    title: /* i18n */ 'Purchasable',
    fieldComponent: 'switch',
  }),
})

export type Plan = z.infer<typeof planSchema>

export const assignPlanToOrganizationSchema = z.object({
  organizationId: attachMeta(z.string(), {
    title: /* i18n */ 'Organization ID',
    fieldComponent: 'string',
  }),
  planName: attachMeta(z.string(), {
    title: /* i18n */ 'Plan Name',
    fieldComponent: 'string',
  }),
  expiredAt: attachMeta(z.coerce.date(), {
    title: /* i18n */ 'Expired At',
    fieldComponent: 'date',
  }),
})

export type AssignPlanToOrganization = z.infer<typeof assignPlanToOrganizationSchema>
