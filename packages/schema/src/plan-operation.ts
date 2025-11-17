import { z } from 'zod/v3'
import { attachMeta } from './utils.js'

export const createPurchasePlanOperationSchema = z.object({
  planName: attachMeta(z.string(), {
    title: 'Plan Name',
    fieldComponent: 'string',
  }),
  months: attachMeta(z.coerce.number().int().min(1).max(12), {
    title: 'Months',
  }),
})

export type CreatePurchasePlanOperation = z.infer<typeof createPurchasePlanOperationSchema>

export const createExtendPlanOperationSchema = z.object({
  planName: attachMeta(z.string(), {
    title: 'Plan Name',
    fieldComponent: 'string',
  }),
  months: attachMeta(z.coerce.number().int().min(1).max(12), {
    title: 'Months',
  }),
})

export type CreateExtendPlanOperation = z.infer<typeof createExtendPlanOperationSchema>

export const createUpgradePlanOperationSchema = z.object({
  planName: attachMeta(z.string(), {
    title: 'Plan Name',
    fieldComponent: 'string',
  }),
  months: attachMeta(z.coerce.number().int().min(1).max(12), {
    title: 'Months',
  }),
  expectedDeductionAmount: attachMeta(z.string().optional(), {
    title: 'Expected Deduction Amount',
    fieldComponent: 'string',
  }),
})

export type CreateUpgradePlanOperation = z.infer<typeof createUpgradePlanOperationSchema>
