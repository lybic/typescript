import { proxy } from 'valtio'

export const sandboxStore = proxy({
  id: '',
  expiresAt: 0,
  connectDetails: null as any,
})
