import { proxy, subscribe } from 'valtio'

const initialState = {
  signedInViaDashboard: false,
  trialSessionToken: '',
  orgId: '',
  llmBaseUrl: '',
  llmApiKey: '',
}

export const sessionStore = proxy(initialState)

function readFromLocalStorage() {
  const playgroundJson = localStorage.getItem('lybic-playground')
  if (playgroundJson) {
    const { trialSessionToken, orgId, signedInViaDashboard } = JSON.parse(playgroundJson)
    sessionStore.trialSessionToken = trialSessionToken
    sessionStore.signedInViaDashboard = signedInViaDashboard
    sessionStore.orgId = orgId
  }
}

if (typeof localStorage !== 'undefined') {
  readFromLocalStorage()

  let updateTimer: NodeJS.Timeout | null = null
  subscribe(sessionStore, () => {
    if (updateTimer) {
      clearTimeout(updateTimer)
    }
    updateTimer = setTimeout(() => {
      localStorage.setItem(
        'lybic-playground',
        JSON.stringify({
          trialSessionToken: sessionStore.trialSessionToken,
          orgId: sessionStore.orgId,
          signedInViaDashboard: sessionStore.signedInViaDashboard,
        }),
      )
      updateTimer = null
    })
  })

  addEventListener('storage', (event) => {
    if (event.key === 'lybic-playground') {
      readFromLocalStorage()
    }
  })
}
