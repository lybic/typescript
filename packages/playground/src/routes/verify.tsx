import { VerificationDialog } from '@/components/verification-dialog'
import { createFileRoute } from '@tanstack/react-router'
import verifyCss from '@/styles/verify.css?url'
import { useSnapshot } from 'valtio'
import { sessionStore } from '@/stores/session'

export const Route = createFileRoute('/verify')({
  component: RouteComponent,
  head: () => ({
    scripts: [
      {
        src: 'data:text/javascript,window.AliyunCaptchaConfig={region:"cn",prefix:"1lieou"}',
      },
      {
        src: 'https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: verifyCss,
      },
    ],
  }),
})

function RouteComponent() {
  const { orgId } = useSnapshot(sessionStore)
  if (orgId) {
    return null
  }

  return (
    <div className="verify-page w-full h-full flex justify-center items-center bg-transparent">
      <VerificationDialog />
    </div>
  )
}
