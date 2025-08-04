import { proxy } from 'valtio'

export const sandboxState = proxy({
  id: '',
  expiresAt: 0,
  connectDetails: null as any,
})
