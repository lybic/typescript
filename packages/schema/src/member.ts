import { z } from 'zod/v3'
import { attachMeta } from './utils.js'

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

export const createMemberInvitationSchema = z.object({
  email: attachMeta(
    z
      .string()
      .email()
      .describe(
        /* i18n */ 'The email address of the user to invite. They must sign up with this email in order to accept invitation.',
      ),
    {
      title: /* i18n */ 'Email',
    },
  ),
  role: attachMeta(
    z
      .enum(['owner', 'admin', 'member'])
      .default('member')
      .describe(/* i18n */ 'The role of the user in the organization if they accept the invitation.'),
    {
      title: /* i18n */ 'Role',
      fieldComponent: 'select',
      fieldProps: {
        options: [
          {
            label: /* i18n */ 'Owner',
            value: 'owner',
          },
          {
            label: /* i18n */ 'Admin',
            value: 'admin',
          },
          {
            label: /* i18n */ 'Member',
            value: 'member',
          },
        ],
      },
    },
  ),
})

export type CreateMemberInvitation = z.infer<typeof createMemberInvitationSchema>

export const addMemberToOrgSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member', 'owner']),
})

export type AddMemberToOrg = z.infer<typeof addMemberToOrgSchema>
