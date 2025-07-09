import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
})

export const memberSchema = z.object({
  id: z.string(),
  user: userSchema,
  role: z.string(),
  createdAt: z.string(),
})

export type Member = z.infer<typeof memberSchema>

export const invitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  expiresAt: z.string(),
  user: userSchema,
})

export type Invitation = z.infer<typeof invitationSchema>
