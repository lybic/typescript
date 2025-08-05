import createClient, { Client, ClientOptions } from 'openapi-fetch'
import { paths } from './schema'

export class LybicClient {
  public readonly client: Client<paths>
  public orgId: string

  public constructor({
    baseUrl,
    orgId,
    ...clientOptions
  }: { baseUrl: string; orgId: string } & ({ apiKey: string } | { trialSessionToken: string }) & ClientOptions) {
    this.client = createClient<paths>(clientOptions)

    this.client.use({
      onRequest({ request }) {
        const headers = new Headers(request.headers)
        let credentials: RequestCredentials = request.credentials ?? 'same-origin'
        if ('apiKey' in clientOptions) {
          headers.set('X-Api-Key', clientOptions.apiKey)
        } else if ('trialSessionToken' in clientOptions) {
          headers.set('X-Trial-Session-Token', clientOptions.trialSessionToken)
        } else {
          credentials = 'include'
        }

        return new Request(request, { headers, credentials })
      },
      async onResponse({ response, request }) {
        if (!response.ok) {
          try {
            const error = await response.json()
            throw new Error(error.message ?? response.statusText)
          } catch (e) {
            throw new Error(`${request.method} ${response.url}: ${response.status} ${response.statusText}`)
          }
        }
      },
    })

    this.orgId = orgId
  }

  public createMcpServer(
    data: paths['/api/orgs/{orgId}/mcp-servers']['post']['requestBody']['content']['application/json'],
  ) {
    return this.client.POST('/api/orgs/{orgId}/mcp-servers', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      body: data,
    })
  }

  public deleteMcpServer(mcpServerId: string) {
    return this.client.DELETE('/api/orgs/{orgId}/mcp-servers/{mcpServerId}', {
      params: {
        path: {
          orgId: this.orgId,
          mcpServerId,
        },
      },
    })
  }

  public listMcpServers() {
    return this.client.GET('/api/orgs/{orgId}/mcp-servers', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
    })
  }

  public setMcpServerToSandbox(
    mcpServerId: string,
    data: paths['/api/orgs/{orgId}/mcp-servers/{mcpServerId}/sandbox']['post']['requestBody']['content']['application/json'],
  ) {
    return this.client.POST('/api/orgs/{orgId}/mcp-servers/{mcpServerId}/sandbox', {
      body: data,
      params: {
        path: {
          orgId: this.orgId,
          mcpServerId,
        },
      },
    })
  }

  public getDefaultMcpServer() {
    return this.client.GET('/api/orgs/{orgId}/mcp-servers/default', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
    })
  }

  public createProject(
    data: paths['/api/orgs/{orgId}/projects']['post']['requestBody']['content']['application/json'],
  ) {
    return this.client.POST('/api/orgs/{orgId}/projects', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      body: data,
    })
  }

  public deleteProject(projectId: string) {
    return this.client.DELETE('/api/orgs/{orgId}/projects/{projectId}', {
      params: {
        path: {
          orgId: this.orgId,
          projectId,
        },
      },
    })
  }

  public listProjects() {
    return this.client.GET('/api/orgs/{orgId}/projects', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
    })
  }

  public createSandbox(
    data: paths['/api/orgs/{orgId}/sandboxes']['post']['requestBody']['content']['application/json'],
  ) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
      body: data,
    })
  }

  public deleteSandbox(sandboxId: string) {
    return this.client.DELETE('/api/orgs/{orgId}/sandboxes/{sandboxId}', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
    })
  }

  public listSandboxes() {
    return this.client.GET('/api/orgs/{orgId}/sandboxes', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
    })
  }

  public getSandboxDetails(sandboxId: string) {
    return this.client.GET('/api/orgs/{orgId}/sandboxes/{sandboxId}', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
    })
  }

  public previewSandbox(sandboxId: string) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes/{sandboxId}/preview', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
    })
  }

  public executeComputerUseAction(
    sandboxId: string,
    data: paths['/api/orgs/{orgId}/sandboxes/{sandboxId}/actions/computer-use']['post']['requestBody']['content']['application/json'],
  ) {
    return this.client.POST('/api/orgs/{orgId}/sandboxes/{sandboxId}/actions/computer-use', {
      params: {
        path: {
          orgId: this.orgId,
          sandboxId,
        },
      },
      body: data,
    })
  }

  public getStats() {
    return this.client.GET('/api/orgs/{orgId}/stats', {
      params: {
        path: {
          orgId: this.orgId,
        },
      },
    })
  }

  public parseLlmOutput(data: paths['/api/computer-use/parse']['post']['requestBody']['content']['application/json']) {
    return this.client.POST('/api/computer-use/parse', {
      body: data,
    })
  }
}
