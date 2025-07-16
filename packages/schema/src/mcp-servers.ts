import { z } from 'zod'
import { attachMeta } from './utils.js'

export const mcpServerPolicySchema = z.object({
  sandboxMaxLifetimeSeconds: z.number().default(3600).describe('The maximum lifetime of a sandbox.'),
  sandboxMaxIdleTimeSeconds: z.number().default(3600).describe('The maximum idle time of a sandbox.'),
  sandboxAutoCreation: z
    .boolean()
    .default(false)
    .describe(
      'Whether to create a new sandbox automatically when old sandbox is deleted. If not, new sandboxes will be created when calling computer use tools.',
    ),
  sandboxExposeRecreateTool: z.boolean().default(false).describe('Whether to expose recreate tool to LLMs.'),
  sandboxExposeRestartTool: z.boolean().default(false).describe('Whether to expose restart tool to LLMs.'),
  sandboxExposeDeleteTool: z.boolean().default(false).describe('Whether to expose delete tool to LLMs.'),
})

export type McpServerPolicy = z.infer<typeof mcpServerPolicySchema>

export const mcpServerSchema = z.object({
  id: z.string().describe('ID of the MCP server.'),
  name: z.string().describe('Name of the MCP server.'),
  createdAt: z.string().describe('Creation date of the MCP server.'),
  defaultMcpServer: z.boolean().describe('Whether this is the default MCP server for the organization.'),
  projectId: z.string().describe('Project ID to which the MCP server belongs.'),
  policy: mcpServerPolicySchema,
})

export type McpServer = z.infer<typeof mcpServerSchema>

export const createMcpServerSchema = z.object({
  name: attachMeta(z.string().describe('Name of the MCP server.'), { title: 'MCP Server Name' }),
  projectId: attachMeta(z.string().optional().describe('Project to which the MCP server belongs to.'), {
    title: 'Project',
    fieldComponent: 'project',
  }),
  sandboxMaxLifetimeSeconds: attachMeta(
    z.coerce.number().default(3600).describe('The maximum lifetime of a sandbox.'),
    {
      title: 'Sandbox Max Lifetime',
    },
  ),
  sandboxMaxIdleTimeSeconds: attachMeta(
    z.coerce.number().default(3600).describe('The maximum idle time of a sandbox.'),
    {
      title: 'Sandbox Max Idle Time',
    },
  ),
  sandboxAutoCreation: attachMeta(
    z
      .boolean()
      .default(false)
      .describe(
        'Whether to create a new sandbox automatically when old sandbox is deleted. If not, new sandboxes will be created when calling computer use tools.',
      ),
    {
      title: 'Sandbox Auto Creation',
      fieldComponent: 'switch',
    },
  ),
  sandboxExposeRecreateTool: attachMeta(
    z.boolean().default(false).describe('Whether to expose recreate tool to LLMs.'),
    { title: 'Sandbox Expose Recreate Tool', fieldComponent: 'switch' },
  ),
  sandboxExposeRestartTool: attachMeta(z.boolean().default(false).describe('Whether to expose restart tool to LLMs.'), {
    title: 'Sandbox Expose Restart Tool',
    fieldComponent: 'switch',
  }),
  sandboxExposeDeleteTool: attachMeta(z.boolean().default(false).describe('Whether to expose delete tool to LLMs.'), {
    title: 'Sandbox Expose Delete Tool',
    fieldComponent: 'switch',
  }),
})

export type CreateMcpServer = z.infer<typeof createMcpServerSchema>
