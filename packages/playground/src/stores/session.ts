import { proxy, subscribe } from 'valtio'

const initialState = {
  signedInViaDashboard: false,
  trialSessionToken: '',
  orgId: '',
  llmApiKey: '',
}

export const sessionStore = proxy(initialState)

function readFromLocalStorage() {
  const playgroundJson = localStorage.getItem('lybic-playground')
  if (playgroundJson) {
    const { trialSessionToken, orgId, signedInViaDashboard, llmApiKey } = JSON.parse(playgroundJson)
    sessionStore.trialSessionToken = trialSessionToken || ''
    sessionStore.signedInViaDashboard = signedInViaDashboard ?? false
    sessionStore.orgId = orgId || ''
    sessionStore.llmApiKey = llmApiKey || ''
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
          llmApiKey: sessionStore.llmApiKey,
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
