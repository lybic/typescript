import { z } from 'zod/v3'
import { attachMeta } from './utils.js'
import { sandboxSchema } from './sandbox.js'

export const createMachineImageSchema = z.object({
  sandboxId: attachMeta(z.string().describe(/* i18n */ 'The sandbox ID to create image from.'), {
    title: /* i18n */ 'Sandbox ID',
    fieldComponent: 'hidden',
  }),
  name: attachMeta(z.string().min(1).max(100).describe(/* i18n */ 'The name of the machine image.'), {
    title: /* i18n */ 'Image Name',
  }),
  description: attachMeta(
    z.string().max(500).optional().describe(/* i18n */ 'Optional description of the machine image.'),
    {
      title: /* i18n */ 'Description',
    },
  ),
})

export type CreateMachineImage = z.infer<typeof createMachineImageSchema>

export const machineImageStatusSchema = z.enum(['CREATING', 'READY', 'ERROR'])

export const machineImageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  shapeName: z.string(),
  status: machineImageStatusSchema,
})

export type MachineImage = z.infer<typeof machineImageSchema>

export const machineImagesResponseSchema = z.object({
  images: z.array(machineImageSchema),
  quota: z.object({
    used: z.number(),
    limit: z.number(),
  }),
})

export type MachineImagesResponse = z.infer<typeof machineImagesResponseSchema>

export const createSandboxFromImageSchema = z.object({
  imageId: attachMeta(z.string().describe(/* i18n */ 'The machine image ID to create sandbox from.'), {
    title: /* i18n */ 'Image ID',
    fieldComponent: 'hidden',
  }),
  name: attachMeta(z.string().min(1).max(100).describe(/* i18n */ 'The name of the sandbox.'), {
    title: /* i18n */ 'Sandbox Name',
  }),
  maxLifeSeconds: attachMeta(
    z.coerce
      .number()
      .int()
      .min(300)
      .max(604800)
      .describe(/* i18n */ 'The maximum life time of the sandbox in seconds.'),
    {
      title: /* i18n */ 'Max Life Time',
    },
  ),
  projectId: attachMeta(
    z.string().optional().describe(/* i18n */ 'The project id to use for the sandbox. Use default if not provided.'),
    {
      title: /* i18n */ 'Project',
      fieldComponent: 'project',
    },
  ),
})

export type CreateSandboxFromImage = z.infer<typeof createSandboxFromImageSchema>

export const createSandboxFromImageResponseSchema = z.object({
  sandbox: sandboxSchema,
  bookId: z.string(),
})

export type CreateSandboxFromImageResponse = z.infer<typeof createSandboxFromImageResponseSchema>
