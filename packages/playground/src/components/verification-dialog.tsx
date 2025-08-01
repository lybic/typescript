import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DialogDescription } from '@radix-ui/react-dialog'
import { IconBuilding, IconMoodPuzzled, IconPhone, IconRefresh } from '@tabler/icons-react'
import { VerifyPhoneNumber } from './verification-dialog/verify-phone-number'

export function VerificationDialog() {
  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Verification required</DialogTitle>
          <DialogDescription asChild>
            <Tabs defaultValue="trail" className="mt-2">
              <TabsList className="mb-4">
                <TabsTrigger value="trail">
                  <IconPhone />
                  Phone Number
                </TabsTrigger>
                <TabsTrigger value="org">
                  <IconBuilding />
                  Existing Organization
                </TabsTrigger>
              </TabsList>
              <TabsContent value="trail">
                <VerifyPhoneNumber />
              </TabsContent>
              <TabsContent value="org">
                <Alert>
                  <IconMoodPuzzled />
                  <AlertTitle>No organization found</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <div>
                      Please{' '}
                      <a href="https://dashboard.lybic.cn/" target="_blank" className="underline underline-offset-2">
                        sign in
                      </a>{' '}
                      via the Lybic dashboard and make sure you have joined an organization.
                    </div>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
