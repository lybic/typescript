import { z } from 'zod/v3'
import { attachMeta } from './utils.js'

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  defaultProject: z.boolean(),
})

export type Project = z.infer<typeof projectSchema>

export const createProjectSchema = z.object({
  name: attachMeta(z.string().describe('Name of the project.'), { title: 'Project Name' }),
})

export type CreateProject = z.infer<typeof createProjectSchema>
