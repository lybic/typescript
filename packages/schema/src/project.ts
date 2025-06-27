import { z } from 'zod'

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  defaultProject: z.boolean(),
})

export type Project = z.infer<typeof projectSchema>
