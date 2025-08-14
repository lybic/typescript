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

export function CheckUnsupportedFeatures() {
  const [unsupportedFeatures, setUnsupportedFeatures] = useState<{ name: string; description: string }[]>([])
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const supportedFeaturesLevel = localStorage['lybic-playground-browser-features-level']
    if (supportedFeaturesLevel === REQUIRED_FEATURES_LEVEL) {
      return
    }
    checkBrowserFeatures().then(({ features, allSupported }) => {
      if (allSupported) {
        localStorage['lybic-playground-browser-features-level'] = REQUIRED_FEATURES_LEVEL
        return
      }
      setUnsupportedFeatures(features.filter((feature) => !feature.supported))
    })
  }, [])

  if (unsupportedFeatures.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Some or all functions may not operate correctly</DialogTitle>
          <DialogDescription>
            Your browser is missing some features. We recommend switching to the latest Google Chrome for the best
            experience.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 prose prose-sm max-h-48 overflow-y-auto mr-4">
          <ul>
            {unsupportedFeatures.map((feature) => (
              <li key={feature.name}>
                <strong>{feature.name} is not supported</strong>
                <p>{feature.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-amber-600">
              You may dismiss this message and proceed, however, please be aware that SOME or ALL features may NOT
              operate correctly.
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
