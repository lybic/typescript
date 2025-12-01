import { proxy, subscribe } from 'valtio'

const initialState = {
  signedInViaDashboard: false,
  dashboardSessionToken: '',
  trialSessionToken: '',
  orgId: '',
  llmApiKey: '',
}

export const sessionStore = proxy(initialState)

export function clearSession() {
  sessionStore.signedInViaDashboard = false
  sessionStore.dashboardSessionToken = ''
  sessionStore.orgId = ''
  sessionStore.trialSessionToken = ''
  sessionStore.llmApiKey = ''
}

function readFromLocalStorage() {
  const playgroundJson = localStorage.getItem('lybic-playground-v2')
  if (playgroundJson) {
    const { trialSessionToken, orgId, signedInViaDashboard, llmApiKey, dashboardSessionToken } =
      JSON.parse(playgroundJson)
    sessionStore.trialSessionToken = trialSessionToken || ''
    sessionStore.signedInViaDashboard = signedInViaDashboard ?? false
    sessionStore.dashboardSessionToken = dashboardSessionToken || ''
    sessionStore.orgId = orgId || ''
    sessionStore.llmApiKey = llmApiKey || ''
  }
}

if (typeof localStorage !== 'undefined') {
  if (localStorage.getItem('lybic-playground')) {
    localStorage.removeItem('lybic-playground')
  }

  readFromLocalStorage()

  let updateTimer: NodeJS.Timeout | null = null
  subscribe(sessionStore, () => {
    if (updateTimer) {
      clearTimeout(updateTimer)
    }
    updateTimer = setTimeout(() => {
      localStorage.setItem(
        'lybic-playground-v2',
        JSON.stringify({
          trialSessionToken: sessionStore.trialSessionToken,
          orgId: sessionStore.orgId,
          signedInViaDashboard: sessionStore.signedInViaDashboard,
          llmApiKey: sessionStore.llmApiKey,
          dashboardSessionToken: sessionStore.dashboardSessionToken,
        }),
      )
      updateTimer = null
    })
  })

  addEventListener('storage', (event) => {
    if (event.key === 'lybic-playground-v2') {
      readFromLocalStorage()
    }
  })
}
