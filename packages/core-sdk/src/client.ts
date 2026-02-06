import createClient, { type Client, type ClientOptions, type MaybeOptionalInit } from 'openapi-fetch'
import type { operations, paths } from './schema.d.js'
import { ResponseError } from './response-error.js'

export class LybicClient {
  /**
   * The inner `openapi-fetch` client
   */
  public readonly client: Client<paths>
  /**
   * The organization ID
   */
  public orgId: string

  public constructor({
    baseUrl,
    orgId,
    ...clientOptions
  }: { baseUrl: string; orgId: string } & (
    | { apiKey: string }
    | { trialSessionToken: string }
    | { bearerToken: string }
  ) &
    ClientOptions) {
    this.client = createClient<paths>({ baseUrl, ...clientOptions })

    this.client.use({
      onRequest({ request }) {
        const headers = new Headers(request.headers)
        let credentials: RequestCredentials = request.credentials ?? 'same-origin'
        if ('apiKey' in clientOptions) {
          headers.set('X-Api-Key', clientOptions.apiKey)
        } else if ('trialSessionToken' in clientOptions) {
          headers.set('X-Trial-Session-Token', clientOptions.trialSessionToken)
        } else if ('bearerToken' in clientOptions) {
          headers.set('Authorization', `Bearer ${clientOptions.bearerToken}`)
        }

        return new Request(request, { headers, credentials })
      },
      async onResponse({ response, request }) {
        if (!response.ok) {
          try {
            const error = await response.json()
            throw new ResponseError(error.message ?? response.statusText, response, error)
          } catch (e) {
            throw new ResponseError(
              `${request.method} ${response.url}: ${response.status} ${response.statusText}`,
              response,
            )
          }
        }
      },
    })

    this.orgId = orgId
  }

  public createMcpServer(
    data: paths['/api/orgs/{orgId}/mcp-servers']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/mcp-servers'], 'post'>, 'body' | 'params'>,
  ) {
    return this.client.POST('/api/orgs/{orgId}/mcp-servers', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      body: data,
      ...initParam,
    })
  }

  public deleteMcpServer(
    mcpServerId: string,
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/mcp-servers/{mcpServerId}'], 'delete'>, 'params'>,
  ) {
    return this.client.DELETE('/api/orgs/{orgId}/mcp-servers/{mcpServerId}', {
      params: {
        path: {
          orgId: this.orgId,
          mcpServerId,
        },
      },
      ...initParam,
    })
  }

  public listMcpServers(initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/mcp-servers'], 'get'>, 'params'>) {
    return this.client.GET('/api/orgs/{orgId}/mcp-servers', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      ...initParam,
    })
  }

  public setMcpServerToSandbox(
    mcpServerId: string,
    data: paths['/api/orgs/{orgId}/mcp-servers/{mcpServerId}/sandbox']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<
      MaybeOptionalInit<paths['/api/orgs/{orgId}/mcp-servers/{mcpServerId}/sandbox'], 'post'>,
      'body' | 'params'
    >,
  ) {
    return this.client.POST('/api/orgs/{orgId}/mcp-servers/{mcpServerId}/sandbox', {
      body: data,
      params: {
        path: {
          orgId: this.orgId,
          mcpServerId,
        },
      },
      ...initParam,
    })
  }

  public getDefaultMcpServer(
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/mcp-servers/default'], 'get'>, 'params'>,
  ) {
    return this.client.GET('/api/orgs/{orgId}/mcp-servers/default', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      ...initParam,
    })
  }

  public createProject(
    data: paths['/api/orgs/{orgId}/projects']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/projects'], 'post'>, 'body'>,
  ) {
    return this.client.POST('/api/orgs/{orgId}/projects', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      body: data,
      ...initParam,
    })
  }

  public deleteProject(
    projectId: string,
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/projects/{projectId}'], 'delete'>, 'params'>,
  ) {
    return this.client.DELETE('/api/orgs/{orgId}/projects/{projectId}', {
      params: {
        path: {
          orgId: this.orgId,
          projectId,
        },
      },
      ...initParam,
    })
  }

  public listProjects(initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/projects'], 'get'>, 'params'>) {
    return this.client.GET('/api/orgs/{orgId}/projects', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      ...initParam,
    })
  }

  public createSandbox(
    data: paths['/api/orgs/{orgId}/sandboxes']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes'], 'post'>, 'body'>,
  ) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      body: data,
      ...initParam,
    })
  }

  public deleteSandbox(
    sandboxId: string,
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}'], 'delete'>, 'params'>,
  ) {
    return this.client.DELETE('/api/orgs/{orgId}/sandboxes/{sandboxId}', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      ...initParam,
    })
  }

  public listSandboxes(initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes'], 'get'>, 'params'>) {
    return this.client.GET('/api/orgs/{orgId}/sandboxes', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      ...initParam,
    })
  }

  public getSandboxDetails(
    sandboxId: string,
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}'], 'get'>, 'params'>,
  ) {
    return this.client.GET('/api/orgs/{orgId}/sandboxes/{sandboxId}', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      ...initParam,
    })
  }

  public previewSandbox(
    sandboxId: string,
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/preview'], 'post'>, 'params'>,
  ) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes/{sandboxId}/preview', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      ...initParam,
    })
  }

  public listHttpMappings(
    sandboxId: string,
    initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/mappings'], 'get'>, 'params'>,
  ) {
    return this.client.GET('/api/orgs/{orgId}/sandboxes/{sandboxId}/mappings', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      ...initParam,
    })
  }

  public createHttpMapping(
    sandboxId: string,
    data: paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/mappings']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<
      MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/mappings'], 'post'>,
      'body' | 'params'
    >,
  ) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes/{sandboxId}/mappings', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      body: data,
      ...initParam,
    })
  }

  public getHttpMapping(
    sandboxId: string,
    targetEndpoint: operations['getHttpMapping']['parameters']['path']['targetEndpoint'],
    initParam?: Omit<
      MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/mappings/{targetEndpoint}'], 'get'>,
      'params'
    >,
  ) {
    return this.client.GET('/api/orgs/{orgId}/sandboxes/{sandboxId}/mappings/{targetEndpoint}', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
          targetEndpoint,
        },
      },
      ...initParam,
    })
  }

  public deleteHttpMapping(
    sandboxId: string,
    targetEndpoint: operations['deleteHttpMapping']['parameters']['path']['targetEndpoint'],
    initParam?: Omit<
      MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/mappings/{targetEndpoint}'], 'delete'>,
      'params'
    >,
  ) {
    return this.client.DELETE('/api/orgs/{orgId}/sandboxes/{sandboxId}/mappings/{targetEndpoint}', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
          targetEndpoint,
        },
      },
      ...initParam,
    })
  }

  public copyFilesWithSandbox(
    sandboxId: string,
    data: paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/file/copy']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<
      MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/file/copy'], 'post'>,
      'body' | 'params'
    >,
  ) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes/{sandboxId}/file/copy', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      body: data,
      ...initParam,
    })
  }

  public execSandboxProcess(
    sandboxId: string,
    data: paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/process']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<
      MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/process'], 'post'>,
      'body' | 'params'
    >,
  ) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes/{sandboxId}/process', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      body: data,
      ...initParam,
    })
  }

  public executeComputerUseAction(
    sandboxId: string,
    data: paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/actions/computer-use']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<
      MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/actions/computer-use'], 'post'>,
      'body' | 'params'
    >,
  ) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes/{sandboxId}/actions/computer-use', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      body: data,
      ...initParam,
    })
  }

  public executeSandboxAction(
    sandboxId: string,
    data: paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/actions/execute']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<
      MaybeOptionalInit<paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/actions/execute'], 'post'>,
      'body' | 'params'
    >,
  ) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes/{sandboxId}/actions/execute', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      body: data,
      ...initParam,
    })
  }

  public getStats(initParam?: Omit<MaybeOptionalInit<paths['/api/orgs/{orgId}/stats'], 'get'>, 'params'>) {
    return this.client.GET('/api/orgs/{orgId}/stats', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      ...initParam,
    })
  }

  public parseLlmOutput(
    data: paths['/api/computer-use/parse']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<MaybeOptionalInit<paths['/api/computer-use/parse'], 'post'>, 'body'>,
  ) {
    return this.client.POST('/api/computer-use/parse', {
      body: data,
      ...initParam,
    })
  }

  public parseLlmOutputText(
    type: operations['parseModelTextOutput']['parameters']['path']['type'],
    actionSpace: 'computer-use' | 'mobile-use',
    data: paths['/api/computer-use/parse/{type}']['post']['requestBody']['content']['application/json'],
    initParam?: Omit<MaybeOptionalInit<paths['/api/computer-use/parse/{type}'], 'post'>, 'body' | 'params'>,
  ) {
    return this.client.POST(
      actionSpace === 'computer-use' ? '/api/computer-use/parse/{type}' : '/api/mobile-use/parse/{type}',
      {
        params: {
          path: {
            type,
          },
        },
        body: data,
        ...initParam,
      },
    )
  }
}
