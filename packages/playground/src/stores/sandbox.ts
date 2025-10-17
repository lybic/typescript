import { proxy } from 'valtio'

export const sandboxStore = proxy({
  id: '',
  name: '',
  expiresAt: 0,
  connectDetails: null as any,
  shape: null as any,
})
