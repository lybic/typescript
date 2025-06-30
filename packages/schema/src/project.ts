import { z } from 'zod'
import { attachMeta } from './utils.js'

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  defaultProject: z.boolean(),
})

export type Project = z.infer<typeof projectSchema>

export const createProjectSchema = z.object({
  name: attachMeta(z.string(), { title: 'Project Name' }).describe('Name of the project.'),
})

export type CreateProject = z.infer<typeof createProjectSchema>
