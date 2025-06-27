import { z } from 'zod'
import { attachTitle } from './utils.js'

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  defaultProject: z.boolean(),
})

export type Project = z.infer<typeof projectSchema>

export const createProjectSchema = z.object({
  name: attachTitle(z.string(), 'Project Name').describe('Name of the project.'),
})

export type CreateProject = z.infer<typeof createProjectSchema>
