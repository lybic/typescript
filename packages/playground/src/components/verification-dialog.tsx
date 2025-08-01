import { FormTrialPhoneNumber } from '@/components/form-trial-phone-number'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DialogDescription } from '@radix-ui/react-dialog'
import { IconBuilding, IconMoodPuzzled, IconPhone, IconRefresh } from '@tabler/icons-react'

export function VerificationDialog() {
  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Verification required</DialogTitle>
          <DialogDescription>
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
                <FormTrialPhoneNumber />
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
        <DialogFooter className="mt-4">
          <Button variant="outline" size="icon">
            <IconRefresh />
          </Button>
          <Button>Verify</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
