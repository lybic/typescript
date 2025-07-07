import { z } from 'zod'
import { attachMeta } from './utils.js'

export const mcpServerPolicySchema = z.object({
  sandboxMaxLifetimeSeconds: z.number().default(3600),
  sandboxMaxIdleTimeSeconds: z.number().default(3600),
  sandboxAutoCreation: z.boolean().default(false),
  sandboxExposeRecreateTool: z.boolean().default(false),
  sandboxExposeRestartTool: z.boolean().default(false),
  sandboxExposeDeleteTool: z.boolean().default(false),
})

export type McpServerPolicy = z.infer<typeof mcpServerPolicySchema>

export const mcpServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  defaultMcpServer: z.boolean(),
  projectId: z.string(),
  policy: mcpServerPolicySchema,
})

export type McpServer = z.infer<typeof mcpServerSchema>

export const createMcpServerSchema = z.object({
  name: attachMeta(z.string().describe('Name of the MCP server.'), { title: 'MCP Server Name' }),
  projectId: attachMeta(z.string().optional().describe('Project to which the MCP server belongs to.'), {
    title: 'Project',
    fieldComponent: 'project',
  }),
  sandboxMaxLifetimeSeconds: attachMeta(z.number().default(3600).describe('The maximum lifetime of a sandbox.'), {
    title: 'Sandbox Max Lifetime',
  }),
  sandboxMaxIdleTimeSeconds: attachMeta(z.number().default(3600).describe('The maximum idle time of a sandbox.'), {
    title: 'Sandbox Max Idle Time',
  }),
  sandboxAutoCreation: attachMeta(
    z
      .boolean()
      .default(false)
      .describe(
        'Whether to create a new sandbox automatically when old sandbox is deleted. If not, new sandboxes will be created when calling computer use tools.',
      ),
    {
      title: 'Sandbox Auto Creation',
    },
  ),
  sandboxExposeRecreateTool: attachMeta(
    z.boolean().default(false).describe('Whether to expose recreate tool to LLMs.'),
    { title: 'Sandbox Expose Recreate Tool' },
  ),
  sandboxExposeRestartTool: attachMeta(z.boolean().default(false).describe('Whether to expose restart tool to LLMs.'), {
    title: 'Sandbox Expose Restart Tool',
  }),
  sandboxExposeDeleteTool: attachMeta(z.boolean().default(false).describe('Whether to expose delete tool to LLMs.'), {
    title: 'Sandbox Expose Delete Tool',
  }),
})

export type CreateMcpServer = z.infer<typeof createMcpServerSchema>
