import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import Map from '@/components/ui/map'
import { myAxios } from '@/lib/axios'
import { sessionStore } from '@/stores/session'
import { sandboxStore } from '@/stores/sandbox'
import { toast } from 'sonner'

interface MapDialogProps {
  open: boolean
  onLocationChange: (location?: { lng: number; lat: number }) => void
}

export function MapDialog({ open, onLocationChange }: MapDialogProps) {
  const locationChange = async (location?: { lng: number; lat: number }) => {
    try {
      await myAxios.post(`/api/orgs/${sessionStore.orgId}/sandboxes/${sandboxStore.id}/process`, {
        executable: 'settings',
        args: ['put', 'global', 'gps_inject_info', `${location?.lng},${location?.lat}`],
      })
      onLocationChange(location)
    } catch (error: any) {
      toast.error('Failed to inject location', {
        description: error?.message || error?.response?.data?.message || String(error),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onLocationChange()}>
      <DialogContent className="!max-w-none w-[92vw] h-[92vh] p-0 border-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Select Location</DialogTitle>
        </DialogHeader>
        <div className="flex-1 backdrop-blur-md bg-white/10 rounded-lg overflow-hidden">
          <Map className="w-full h-full" onLocationChange={locationChange} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
