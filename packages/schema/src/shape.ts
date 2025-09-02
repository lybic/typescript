import { z } from 'zod/v3'

export const shapeSchema = z.object({
  name: z.string(),
  description: z.string(),
  hardwareAcceleratedEncoding: z.boolean(),
  pricePerHour: z.number(),
  requiredPlanTier: z.number(),
  os: z.enum(['Windows', 'Linux', 'Android']),
  virtualization: z.enum(['KVM', 'Container']),
  architecture: z.enum(['x86_64', 'aarch64']),
})

export const shapeCreateSchema = shapeSchema.extend({
  nomosSpecId: z.string(),
  nomosDatacenterId: z.string(),
})

export type Shape = z.infer<typeof shapeSchema>
export type ShapeCreate = z.infer<typeof shapeCreateSchema>
