import { AgentDesktop } from '@/components/agent-desktop'
import { Conversation } from '@/components/conversation'
import { SiteNavigation } from '@/components/site-navigation'
import { VerificationDialog } from '@/components/verification-dialog'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="homepage bg-background flex flex-col w-full h-full">
      <SiteNavigation />
      <div className="playground-body flex-1 flex gap-4 h-1 px-4 border-t-1 border-border/50">
        <AgentDesktop />
        <Conversation />
      </div>
      {/* <iframe src="/verify" className="w-full h-full absolute top-0 left-0" /> */}
    </div>
  )
}
