import { IAssistantAction, IComputerUseAction, ILength } from '@lybic/schema'
import { proxy } from 'valtio'

export const indicatorStore = proxy({
  status: 'idle' as 'idle' | 'running' | 'done',
  lastAction: null as null | IAssistantAction,
  screenSize: { width: 1280, height: 720 },
})
