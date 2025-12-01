import { z } from 'zod/v3'
import { attachMeta } from './utils.js'

export const mcpServerPolicySchema = z.object({
  sandboxShape: z.string().describe(/* i18n */ 'The shape of the sandbox created by the MCP server.'),
  sandboxMaxLifetimeSeconds: z.number().default(3600).describe(/* i18n */ 'The maximum lifetime of a sandbox.'),
  sandboxMaxIdleTimeSeconds: z.number().default(3600).describe(/* i18n */ 'The maximum idle time of a sandbox.'),
  sandboxAutoCreation: z
    .boolean()
    .default(false)
    .describe(
      /* i18n */ 'Whether to create a new sandbox automatically when old sandbox is deleted. If not, new sandboxes will be created when calling computer use tools.',
    ),
  sandboxExposeRecreateTool: z.boolean().default(false).describe(/* i18n */ 'Whether to expose recreate tool to LLMs.'),
  sandboxExposeRestartTool: z.boolean().default(false).describe(/* i18n */ 'Whether to expose restart tool to LLMs.'),
  sandboxExposeDeleteTool: z.boolean().default(false).describe(/* i18n */ 'Whether to expose delete tool to LLMs.'),
})

export type McpServerPolicy = z.infer<typeof mcpServerPolicySchema>

export const mcpServerSchema = z.object({
  id: z.string().describe(/* i18n */ 'ID of the MCP server.'),
  name: z.string().describe(/* i18n */ 'Name of the MCP server.'),
  createdAt: z.string().describe(/* i18n */ 'Creation date of the MCP server.'),
  defaultMcpServer: z.boolean().describe(/* i18n */ 'Whether this is the default MCP server for the organization.'),
  projectId: z.string().describe(/* i18n */ 'Project ID to which the MCP server belongs.'),
  policy: mcpServerPolicySchema,
  currentSandboxId: z.string().nullable().describe(/* i18n */ 'ID of the currently connected sandbox.'),
})

export type McpServer = z.infer<typeof mcpServerSchema>

export const createMcpServerSchema = z.object({
  name: attachMeta(z.string().describe(/* i18n */ 'Name of the MCP server.'), { title: /* i18n */ 'MCP Server Name' }),
  projectId: attachMeta(z.string().optional().describe(/* i18n */ 'Project to which the MCP server belongs to.'), {
    title: /* i18n */ 'Project',
    fieldComponent: 'project',
  }),
  sandboxShape: attachMeta(z.string().describe(/* i18n */ 'The shape of the sandbox created by the MCP server.'), {
    title: /* i18n */ 'Sandbox Shape',
    fieldComponent: 'shape',
  }),
  sandboxMaxLifetimeSeconds: attachMeta(
    z.coerce.number().default(3600).describe(/* i18n */ 'The maximum lifetime of a sandbox.'),
    {
      title: /* i18n */ 'Sandbox Max Lifetime',
    },
  ),
  sandboxMaxIdleTimeSeconds: attachMeta(
    z.coerce.number().default(3600).describe(/* i18n */ 'The maximum idle time of a sandbox.'),
    {
      title: /* i18n */ 'Sandbox Max Idle Time',
    },
  ),
  sandboxAutoCreation: attachMeta(
    z
      .boolean()
      .default(false)
      .describe(
        /* i18n */ 'Whether to create a new sandbox automatically when old sandbox is deleted. If not, new sandboxes will be created when calling computer use tools.',
      ),
    {
      title: /* i18n */ 'Sandbox Auto Creation',
      fieldComponent: 'switch',
    },
  ),
  sandboxExposeRecreateTool: attachMeta(
    z.boolean().default(false).describe(/* i18n */ 'Whether to expose recreate tool to LLMs.'),
    { title: /* i18n */ 'Sandbox Expose Recreate Tool', fieldComponent: 'switch' },
  ),
  sandboxExposeRestartTool: attachMeta(
    z.boolean().default(false).describe(/* i18n */ 'Whether to expose restart tool to LLMs.'),
    {
      title: /* i18n */ 'Sandbox Expose Restart Tool',
      fieldComponent: 'switch',
    },
  ),
  sandboxExposeDeleteTool: attachMeta(
    z.boolean().default(false).describe(/* i18n */ 'Whether to expose delete tool to LLMs.'),
    {
      title: /* i18n */ 'Sandbox Expose Delete Tool',
      fieldComponent: 'switch',
    },
  ),
})

export type CreateMcpServer = z.infer<typeof createMcpServerSchema>
