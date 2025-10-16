import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useConnectResponder } from '@/hooks/use-connect-responder'
import { getSessionQueryOptions } from '@/queries/get-session'
import { sessionStore } from '@/stores/session'
import { DialogDescription } from '@radix-ui/react-dialog'
import { IconExternalLink } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

export function VerificationDialog() {
  const response = useConnectResponder()
  const handleLogin = useCallback(() => {
    const screenX = window.screenX + (window.innerWidth - 500) / 2
    const screenY = window.screenY + (window.innerHeight - 620) / 2
    window.open(
      'http://localhost:3050/auth/connect',
      'connect',
      `width=500,height=620,popup=true,screenX=${screenX},screenY=${screenY}`,
    )
  }, [])

  const queryClient = useQueryClient()
  useEffect(() => {
    if (response?.sessionToken && response?.orgId) {
      sessionStore.trialSessionToken = ''
      sessionStore.dashboardSessionToken = response?.sessionToken ?? ''
      sessionStore.orgId = response?.orgId ?? ''
      sessionStore.signedInViaDashboard = true
      queryClient.resetQueries(getSessionQueryOptions())
    }
  }, [response])

  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Login required</DialogTitle>
          <DialogDescription>
            <div>
              In order to use the Lybic playground, you need to login via the Lybic dashboard, and join or create an
              organization.
            </div>
          </DialogDescription>
          <div className="mt-2">
            <Button className="w-full" type="button" onClick={handleLogin}>
              <IconExternalLink />
              Login
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
