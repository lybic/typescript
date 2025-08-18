import { REQUIRED_FEATURES_LEVEL, checkBrowserFeatures } from '@/lib/check-browser-features'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { StreamingClient } from '@lybic/ui/streaming-client'

export function CheckWebTransport() {
  const [wtUnavailable, setWtUnavailable] = useState(false)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (!('WebTransport' in window)) {
      // not worth to check
      return
    }

    StreamingClient.testConnectivity().then((result) => {
      if (!result) {
        setOpen(true)
        setWtUnavailable(true)
      }
    })
  }, [])

  if (!wtUnavailable) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>WebTransport is not available</DialogTitle>
          <DialogDescription className="pt-4">
            We cannot connect to our WebTransport server. This usually means you are using a proxy, VPN, or your network
            is blocking UDP. Please resolve this issue before continuing.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-amber-600">
              You may dismiss this message and proceed, however, please note that you might not be able to view the live
              stream.
            </div>
            <DialogClose asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-600">
                Continue Anyway
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
