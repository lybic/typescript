import { AgentDesktop } from '@/components/agent-desktop'
import { CheckUnsupportedFeatures } from '@/components/check-unsupported-features'
import { Conversation } from '@/components/conversation'
import { SiteNavigation } from '@/components/site-navigation'
import { Spinner } from '@/components/ui/spinner'
import { VerificationDialog } from '@/components/verification-dialog'
import { checkBrowserFeatures, REQUIRED_FEATURES_LEVEL } from '@/lib/check-browser-features'
import { sessionStore } from '@/stores/session'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const session = useSnapshot(sessionStore)
  return (
    <div className="homepage bg-background flex flex-col w-full h-full">
      <SiteNavigation />
      {session.orgId ? (
        <div className="playground-body flex-1 flex gap-4 h-1 px-4 border-t-1 border-border/50">
          <AgentDesktop />
          <Conversation />
        </div>
      ) : (
        <div className="playground-spinner flex-1 flex gap-4 h-1 px-4 border-t-1 border-border/50 justify-center items-center">
          <Spinner className="size-8 text-muted-foreground" />
        </div>
      )}
      {!session.orgId && <iframe src="/verify" className="w-full h-full absolute top-0 left-0" />}
      <CheckUnsupportedFeatures />
    </div>
  )
}
