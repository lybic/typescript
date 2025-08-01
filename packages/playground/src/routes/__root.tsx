/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import icon from '../assets/icon.svg?no-inline'

import appCss from '@/styles/app.css?url'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient } from '@tanstack/react-query'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=960, initial-scale=1, user-scalable=yes',
      },
      {
        title: 'Lybic Playground',
      },
    ],
    links: [
      { rel: 'icon', href: icon },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  ssr: true,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="h-full w-full bg-transparent">
      <head>
        <HeadContent />
      </head>
      <body className="h-full w-full overflow-x-hidden bg-transparent">
        {children}
        <Scripts />
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </body>
    </html>
  )
}
